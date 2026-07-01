from __future__ import annotations

import base64
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
import traceback
from io import BytesIO
from pathlib import Path
from typing import Literal, Optional

import numpy as np
import torch
import torch.nn.functional as F
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from PIL import Image, ImageOps
from torchvision import transforms
SCRIPT_DIR = Path(__file__).resolve().parent

# Go up to the root folder, then go straight into the ml_pipeline directory
MODEL_SRC_DIR = SCRIPT_DIR.parent.parent / "dataset" / "plantvillage" / "ml_pipeline"
WEIGHTS_DIR = SCRIPT_DIR.parent / "agroshield_hybrid"

if MODEL_SRC_DIR.exists():
    sys.path.insert(0, str(MODEL_SRC_DIR))
else:
    # Fallback if structure varies slightly on the container
    sys.path.insert(0, str(SCRIPT_DIR.parent.parent))

# Import directly from the file name since the folder is now in sys.path
from model import AgroShieldHybridModel


# ---------------------------------------------------------------------------
# Class labels
# ---------------------------------------------------------------------------
# IMPORTANT:
# Your checkpoint was trained with a specific label index ordering (usually from
# torchvision.datasets.ImageFolder(class folders sorted lexicographically)).
# If we map output indices to the wrong CLASS_LABELS order, the UI will show
# incorrect disease names.

import json

DEFAULT_CLASS_LABELS: list[str] = [
    "Apple___Apple_scab",
    "Apple___Black_rot",
    "Apple___Cedar_apple_rust",
    "Apple___Healthy",
    "Blueberry___Healthy",
    "Cherry___Powdery_mildew",
    "Cherry___Healthy",
    "Corn___Cercospora_leaf_spot Gray_leaf_spot",
    "Corn___Common_rust",
    "Corn___Northern_Leaf_Blight",
    "Corn___Healthy",
    "Grape___Black_rot",
    "Grape___Esca_(Black_Measles)",
    "Grape___Leaf_blight_(Isariopsis_Leaf_Spot)",
    "Grape___Healthy",
    "Orange___Haunglongbing_(Citrus_greening)",
    "Peach___Bacterial_spot",
    "Peach___Healthy",
    "Pepper,_bell___Bacterial_spot",
    "Pepper,_bell___Healthy",
    "Potato___Early_blight",
    "Potato___Late_blight",
    "Potato___Healthy",
    "Raspberry___Healthy",
    "Soybeans___Healthy",
    "Squash___Powdery_mildew",
    "Strawberry___Leaf_scorch",
    "Strawberry___Healthy",
    "Tomato___Bacterial_spot",
    "Tomato___Early_blight",
    "Tomato___Late_blight",
    "Tomato___Leaf_Mold",
    "Tomato___Septoria_leaf_spot",
    "Tomato___Spider_mites_Two-spotted_spider_mite",
    "Tomato___Target_Spot",
    "Tomato___Tomato_Yellow_Leaf_Curl_Virus",
    "Tomato___Tomato_mosaic_virus",
    "Tomato___Healthy",
]

CLASS_LABELS: list[str] = DEFAULT_CLASS_LABELS

candidate_class_files = [
    WEIGHTS_DIR / "class_to_idx.json",
    WEIGHTS_DIR / "classes (1).json",
    WEIGHTS_DIR / "classes.json",
]


def _coerce_labels_from_loaded(loaded: object) -> list[str] | None:
    if isinstance(loaded, list) and all(isinstance(x, str) for x in loaded):
        return loaded

    if isinstance(loaded, dict):
        idx_label_pairs: list[tuple[int, str]] = []

        all_value_str = all(isinstance(v, str) for v in loaded.values())
        if all_value_str:
            ok = True
            for k, v in loaded.items():
                try:
                    idx = int(k)
                except Exception:
                    ok = False
                    break
                idx_label_pairs.append((idx, v))
            if ok and idx_label_pairs:
                idx_label_pairs.sort(key=lambda t: t[0])
                return [label for _, label in idx_label_pairs]

        all_value_int = all(isinstance(v, int) for v in loaded.values())
        if all_value_int:
            idx_label_pairs = []
            for label, idx in loaded.items():
                if not isinstance(label, str) or not isinstance(idx, int):
                    return None
                idx_label_pairs.append((idx, label))
            idx_label_pairs.sort(key=lambda t: t[0])
            return [label for _, label in idx_label_pairs]

    return None


loaded_any = False
for classes_json_path in candidate_class_files:
    if not classes_json_path.exists():
        continue
    try:
        loaded = json.loads(classes_json_path.read_text(encoding="utf-8"))
        coerced = _coerce_labels_from_loaded(loaded)
        if coerced and len(coerced) > 0:
            CLASS_LABELS = coerced
            loaded_any = True
            print(
                f"[agroshield] Loaded CLASS_LABELS from: {classes_json_path} "
                f"len={len(CLASS_LABELS)}"
            )
            break
        else:
            print(f"[agroshield] classes file loaded but had unsupported format: {classes_json_path}")
    except Exception as e:
        print(f"[agroshield] Failed to load classes file {classes_json_path}: {e}")

if not loaded_any:
    print("[agroshield] Using DEFAULT_CLASS_LABELS (external classes.json not found or invalid).")


NUM_CLASSES = len(CLASS_LABELS)
RiskLevel = Literal["LOW", "MODERATE", "HIGH", "CRITICAL"]

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")


# ---------------------------------------------------------------------------
# Model loading
# ---------------------------------------------------------------------------
model: AgroShieldHybridModel | None = None
weights_path: Path | None = None

for name in ("best_model.pth", "agroshield_hybrid.pth", "best.pth"):
    p = WEIGHTS_DIR / name
    if p.exists():
        weights_path = p
        break

if weights_path is None:
    for p in sorted(WEIGHTS_DIR.rglob("*.pth")):
        if p.is_file():
            weights_path = p
            break

if weights_path is not None:
    model = AgroShieldHybridModel(num_classes=NUM_CLASSES).to(device)
    model.load_state_dict(torch.load(str(weights_path), map_location=device))
    model.eval()
    print(f"[agroshield] Loaded weights from: {weights_path}")
else:
    print(
        "[agroshield] No .pth weights found — model inference disabled. "
        "Place a .pth file in: " + str(WEIGHTS_DIR)
    )


transform = transforms.Compose(
    [
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
    ]
)


def _build_tta_batch(pil_img: Image.Image) -> tuple[torch.Tensor, torch.Tensor]:
    base_tensor = transform(pil_img).unsqueeze(0).to(device)
    flipped_tensor = torch.flip(base_tensor, dims=[3])
    return base_tensor, torch.cat((base_tensor, flipped_tensor), dim=0)


# ---------------------------------------------------------------------------
# Grad-CAM helper
# ---------------------------------------------------------------------------
class GradCAM:
    def __init__(self, backbone: torch.nn.Module, target_layer: str = "norm") -> None:
        self.backbone = backbone
        self.gradients: torch.Tensor | None = None
        self.activations: torch.Tensor | None = None
        self._register_hooks(target_layer)

    def _register_hooks(self, target_layer: str) -> None:
        layer = dict(self.backbone.named_modules()).get(target_layer)
        if layer is None:
            return
        layer.register_forward_hook(self._forward_hook)
        layer.register_full_backward_hook(self._backward_hook)

    def _forward_hook(self, module: torch.nn.Module, input: torch.Tensor, output: torch.Tensor) -> None:
        self.activations = output.detach()

    def _backward_hook(
        self, module: torch.nn.Module, grad_input: torch.Tensor, grad_output: torch.Tensor
    ) -> None:
        self.gradients = grad_output[0].detach()

    def generate(self, class_idx: int | None = None) -> np.ndarray:
        if self.activations is None or self.gradients is None:
            return np.zeros((224, 224), dtype=np.float32)

        weights = self.gradients.mean(dim=(2, 3), keepdim=True)
        cam = (weights * self.activations).sum(dim=1, keepdim=True)
        cam = F.relu(cam)
        cam = F.interpolate(cam, size=(224, 224), mode="bilinear", align_corners=False)

        cam_np = cam.squeeze().cpu().numpy()
        if cam_np.max() > 0:
            cam_np = cam_np / cam_np.max()
        return cam_np


# ---------------------------------------------------------------------------
# Phase / risk helpers
# ---------------------------------------------------------------------------

def _risk_from_env(
    humidity: Optional[float],
    soil_resistance: Optional[float],
    temperature: Optional[float],
) -> RiskLevel:
    h = humidity if humidity is not None else 0
    if h > 80:
        return "CRITICAL"
    if h > 65:
        return "HIGH"
    if h > 40:
        return "MODERATE"
    return "LOW"


def _phases_for_disease(disease_name: str) -> list[dict]:
    return [
        {
            "phase": 1,
            "title": "Immediate Containment",
            "action": "Isolate the affected plant/area. Remove heavily diseased leaves. Clean tools and reduce plant-to-plant contact to limit spread.",
        },
        {
            "phase": 2,
            "title": "Targeted Eradication",
            "action": "Identify symptom progression zones (hotspots). Apply treatment targeted to the likely disease stage. Re-check after 48–72 hours and adjust based on response.",
        },
        {
            "phase": 3,
            "title": "Recovery",
            "action": "Stabilize irrigation and soil conditions. Support regrowth with balanced nutrition. Monitor new leaf emergence and remove any regrowth that shows recurrence.",
        },
        {
            "phase": 4,
            "title": "Future Prevention",
            "action": "Establish a monitoring schedule (weekly photos + notes). Improve preventative hygiene + resistant cultivar strategy. Use weather/humidity-driven alerts to intervene early.",
        },
    ]


# ---------------------------------------------------------------------------
# FastAPI app
# ---------------------------------------------------------------------------
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173", 
        "http://127.0.0.1:5173",
        "https://ieee-internship-project-agroshield-rust.vercel.app"  # <-- Added your exact frontend URL
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health() -> dict:
    return {
        "ok": True,
        "service": "agroshield-scan",
        "model_loaded": model is not None,
        "device": str(device),
    }


@app.post("/predict")
def predict(
    image: UploadFile = File(...),
    soil_resistance: Optional[float] = Form(None),
    humidity: Optional[float] = Form(None),
    temperature: Optional[float] = Form(None),
    language: Optional[str] = Form(None),
):
    if not image:
        raise HTTPException(status_code=400, detail="Missing image")

    content = image.file.read()
    if not content:
        raise HTTPException(status_code=400, detail="Empty image")

    language = (language or "en").lower()
    try:
        pil_img = ImageOps.exif_transpose(Image.open(BytesIO(content))).convert("RGB")
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid image")

    if model is None:
        disease_name = "Stub Disease (model weights not loaded)"
        confidence = 0.9
        risk = _risk_from_env(humidity, soil_resistance, temperature)
        heatmap_base64 = (
            "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/xcAAgMBgQh8ZQAAAABJRU5ErkJggg=="
        )
        ai_insight = (
            "Stub response: model weights (.pth) were not found. "
            f"Place a .pth file in {WEIGHTS_DIR} to enable real inference."
        )
        top5 = []
    else:
        try:
            img_tensor, tta_tensor = _build_tta_batch(pil_img)

            gradcam = GradCAM(model.convnext, "norm")
            model.zero_grad()
            with torch.no_grad():
                output = model(tta_tensor)
                probs = F.softmax(output, dim=1).mean(dim=0, keepdim=True)
            pred_class = probs.argmax(dim=1).item()
            confidence = float(probs[0, pred_class].item())

            topk = torch.topk(probs[0], k=min(5, probs.shape[1]))
            topk_idx = topk.indices.tolist()
            topk_vals = topk.values.tolist()

            top5 = []
            for idx, val in zip(topk_idx, topk_vals):
                mapped = CLASS_LABELS[idx] if idx < len(CLASS_LABELS) else f"Class_{idx}"
                top5.append({"idx": idx, "label": mapped, "prob": float(val)})

            disease_name = CLASS_LABELS[pred_class] if pred_class < len(CLASS_LABELS) else f"Class_{pred_class}"

            model.zero_grad()
            output = model(img_tensor)
            target = output[0, pred_class]
            target.backward()

            cam_np = gradcam.generate(class_idx=pred_class)
            cam_img = (cam_np * 255).astype(np.uint8)
            cam_pil = Image.fromarray(cam_img, mode="L")
            buf = BytesIO()
            cam_pil.save(buf, format="PNG")
            heatmap_base64 = base64.b64encode(buf.getvalue()).decode("utf-8")

            risk = _risk_from_env(humidity, soil_resistance, temperature)

            def _insight_en() -> str:
                return (
                    f"We identified: {disease_name}. "
                    f"Confidence: {confidence * 100:.1f}%. "
                    f"{'This looks healthy—no disease signs detected.' if 'healthy' in disease_name.lower() else 'Signs of disease were detected. Use the heatmap to see the most affected leaf areas.'}"
                )

            def _insight_hinglish() -> str:
                return (
                    f"Humein yeh beemari/healthy state mila: {disease_name}. "
                    f"Confidence: {confidence * 100:.1f}%. "
                    f"{'Patti/plant healthy lag rahi hai—koi badi disease signs nazar nahi aaye.' if 'healthy' in disease_name.lower() else 'Disease ke signs mil rahe hain. Heatmap dekhein taaki zyada affected leaf areas samajh aa sake.'}"
                )

            ai_insight = _insight_hinglish() if language in ("hi", "hin", "hindi", "hinglish") else _insight_en()

        except Exception:
            traceback.print_exc()
            disease_name = "Inference Error"
            confidence = 0.0
            risk = "LOW"
            heatmap_base64 = (
                "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/xcAAgMBgQh8ZQAAAABJRU5ErkJggg=="
            )
            ai_insight = "An error occurred during model inference. Check the server logs for details."
            top5 = []

    return {
        "disease_detected": "healthy" not in disease_name.lower(),
        "disease_name": disease_name,
        "confidence": round(confidence, 2),
        "top5": top5,
        "soil": {"soil_resistance": soil_resistance},
        "humidity": humidity,
        "temperature": temperature,
        "ai_insight": ai_insight,
        "explainable_ai": {"heatmap_base64": heatmap_base64, "summary": "Grad-CAM heatmap highlighting regions that influenced the prediction."},
        "roadmap": {"risk_level": risk, "phases": _phases_for_disease(disease_name)},
    }

