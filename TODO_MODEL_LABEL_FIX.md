# AgroShield hybrid: label mapping fix (no retraining)

## Goal
Make API return correct disease names for your trained `agroshield_hybrid.pth`.

## Background
`backend/api_server/main.py` currently uses a hardcoded `CLASS_LABELS` list. If the order doesn’t match the label index order used during training (torchvision `ImageFolder`), the UI will show wrong labels (e.g., Apple scab → Soybean healthy).

## Step-by-step
1. Create a `classes.json` (or `class_to_idx.json`) from the exact training dataset folder ordering used when training.
   - Use torchvision `ImageFolder(TRAIN_DIR)` and save `d.classes` in order.
2. Put the file into:
   - `backend/backend/agroshield_hybrid/classes.json`
3. Patch `backend/api_server/main.py` so it loads `classes.json` at runtime:
   - If file exists: build `CLASS_LABELS` from JSON.
   - If file missing: fall back to current hardcoded labels.
4. Restart backend server.
5. Retest by uploading a known Apple scab image and verify disease name is correct.

