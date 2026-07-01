from pathlib import Path
import json

import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, WeightedRandomSampler
from torchvision import datasets, transforms

from model import AgroShieldHybridModel

SCRIPT_DIR = Path(__file__).resolve().parent
DATASET_ROOT = SCRIPT_DIR.parents[2] / "dataset" / "plantvillage"
TRAIN_DIR = DATASET_ROOT / "train"
VALID_DIR = DATASET_ROOT / "val"


def _find_weights_dir() -> Path:
    for parent in SCRIPT_DIR.parents:
        candidate = parent / "agroshield_hybrid"
        if candidate.exists():
            return candidate
    return SCRIPT_DIR


WEIGHTS_DIR = _find_weights_dir()
CHECKPOINT_PATH = WEIGHTS_DIR / "agroshield_hybrid.pth"

BATCH_SIZE = 32
EPOCHS = 20
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
IMAGENET_MEAN = [0.485, 0.456, 0.406]
IMAGENET_STD = [0.229, 0.224, 0.225]


def _build_transforms():
    train_transform = transforms.Compose(
        [
            transforms.RandomResizedCrop(224, scale=(0.75, 1.0), ratio=(0.9, 1.1)),
            transforms.RandomHorizontalFlip(),
            transforms.RandomRotation(20),
            transforms.ColorJitter(brightness=0.2, contrast=0.2, saturation=0.15, hue=0.02),
            transforms.ToTensor(),
            transforms.Normalize(mean=IMAGENET_MEAN, std=IMAGENET_STD),
            transforms.RandomErasing(p=0.15, scale=(0.02, 0.08), ratio=(0.3, 3.3)),
        ]
    )
    valid_transform = transforms.Compose(
        [
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(mean=IMAGENET_MEAN, std=IMAGENET_STD),
        ]
    )
    return train_transform, valid_transform


def _build_weighted_sampler(dataset: datasets.ImageFolder) -> WeightedRandomSampler:
    labels = torch.tensor(dataset.targets, dtype=torch.long)
    class_counts = torch.bincount(labels, minlength=len(dataset.classes)).float()
    class_weights = 1.0 / class_counts.clamp_min(1.0)
    sample_weights = class_weights[labels]
    return WeightedRandomSampler(sample_weights, num_samples=len(sample_weights), replacement=True)


def get_data_loaders(train_dir: Path, valid_dir: Path, batch_size: int):
    if not train_dir.exists():
        raise FileNotFoundError(f"Training directory not found: {train_dir}")
    if not valid_dir.exists():
        raise FileNotFoundError(f"Validation directory not found: {valid_dir}")

    train_transform, valid_transform = _build_transforms()
    train_dataset = datasets.ImageFolder(str(train_dir), transform=train_transform)
    valid_dataset = datasets.ImageFolder(str(valid_dir), transform=valid_transform)
    train_sampler = _build_weighted_sampler(train_dataset)

    loader_kwargs = {
        "batch_size": batch_size,
        "num_workers": 0,
        "pin_memory": torch.cuda.is_available(),
    }

    train_loader = DataLoader(
        train_dataset,
        sampler=train_sampler,
        drop_last=len(train_dataset) > batch_size,
        **loader_kwargs,
    )
    valid_loader = DataLoader(valid_dataset, shuffle=False, **loader_kwargs)
    return train_loader, valid_loader, len(train_dataset.classes)


def run_epoch(model, loader, criterion, optimizer, is_train):
    model.train() if is_train else model.eval()
    running_loss, correct, total = 0.0, 0, 0

    context = torch.enable_grad() if is_train else torch.no_grad()
    with context:
        for images, labels in loader:
            if is_train and images.size(0) <= 1:
                continue

            images = images.to(DEVICE, non_blocking=True)
            labels = labels.to(DEVICE, non_blocking=True)

            if is_train:
                optimizer.zero_grad(set_to_none=True)

            outputs = model(images)
            loss = criterion(outputs, labels)

            if is_train:
                loss.backward()
                torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
                optimizer.step()

            running_loss += loss.item() * images.size(0)
            _, predicted = outputs.max(1)
            total += labels.size(0)
            correct += predicted.eq(labels).sum().item()

    if total == 0:
        return 0.0, 0.0

    return running_loss / total, correct / total


if __name__ == "__main__":
    print("--- AgroShield AI Hybrid Pipeline ---")
    print(f"Target hardware environment: {DEVICE}")

    try:
        train_loader, valid_loader, num_classes = get_data_loaders(
            TRAIN_DIR, VALID_DIR, BATCH_SIZE
        )
        print(f"Dataset connected successfully. Total classes verified: {num_classes}")
    except Exception as e:
        print("\nPath resolution error: check your target data directories.")
        print(f"Details: {e}")
        raise SystemExit(1)

    model = AgroShieldHybridModel(num_classes=num_classes).to(DEVICE)
    criterion = nn.CrossEntropyLoss(label_smoothing=0.05)
    optimizer = optim.AdamW(model.parameters(), lr=3e-4, weight_decay=1e-2)
    scheduler = optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=EPOCHS)
    classes = train_loader.dataset.classes
    WEIGHTS_DIR.mkdir(parents=True, exist_ok=True)
    (WEIGHTS_DIR / "classes.json").write_text(json.dumps(classes, indent=2), encoding="utf-8")
    (WEIGHTS_DIR / "class_to_idx.json").write_text(
        json.dumps(train_loader.dataset.class_to_idx, indent=2),
        encoding="utf-8",
    )

    best_acc = 0.0
    for epoch in range(EPOCHS):
        print(f"\nExecuting epoch [{epoch + 1}/{EPOCHS}]...")
        t_loss, t_acc = run_epoch(model, train_loader, criterion, optimizer, is_train=True)
        v_loss, v_acc = run_epoch(model, valid_loader, criterion, None, is_train=False)

        print(
            f"Epoch [{epoch + 1}/{EPOCHS}] logs -> "
            f"Train Loss: {t_loss:.4f}, Train Acc: {t_acc * 100:.2f}% | "
            f"Val Loss: {v_loss:.4f}, Val Acc: {v_acc * 100:.2f}%"
        )
        scheduler.step()

        if v_acc > best_acc:
            best_acc = v_acc
            torch.save(model.state_dict(), str(CHECKPOINT_PATH))
            print(f"Saved best checkpoint to: {CHECKPOINT_PATH}")
