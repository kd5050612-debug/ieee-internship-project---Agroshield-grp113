# Backend API server

FastAPI server that loads the AgroShieldHybridModel (ConvNeXt-Tiny + Swin Transformer V2) and serves real predictions + Grad-CAM heatmaps to the frontend.

## Prerequisites

The server expects model weights (`.pth` file) in:

```
backend/backend/agroshield_hybrid/
```

Place your trained `.pth` file there. The server looks for (in order):
- `best_model.pth`
- `agroshield_hybrid.pth`
- `best.pth`
- any `*.pth` file found recursively

Without a `.pth` file, the server falls back to a stub response.

## Run

From repo root:

```powershell
cd backend
.\venv\Scripts\activate
pip install fastapi uvicorn pillow torch torchvision timm numpy
uvicorn api_server.main:app --port 8000 --host 127.0.0.1
```

## Endpoints
- `GET /health` — returns model_loaded status and device
- `POST /predict` — expects `multipart/form-data` with `image` plus optional `soil_resistance`, `humidity`, `temperature`

### Response shape

```json
{
  "disease_detected": true,
  "disease_name": "Tomato___Late_blight",
  "confidence": 92.45,
  "soil": {"soil_resistance": 68},
  "humidity": 82,
  "temperature": 24,
  "ai_insight": "Model prediction: Tomato___Late_blight with 92.5% confidence...",
  "explainable_ai": {
    "heatmap_base64": "iVBOR...",
    "summary": "Grad-CAM heatmap highlighting regions that influenced the prediction."
  },
  "roadmap": {
    "risk_level": "HIGH",
    "phases": [...]
  }
}
```

