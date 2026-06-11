import torch
import torch.nn as nn
import torch.optim as optim
from model import AgroShieldHybridModel
from dataset import get_data_loaders

# Clean paths starting straight from your root workspace directory layout
TRAIN_DIR = "./dataset/plantvillage/train" 
VALID_DIR = "./dataset/plantvillage/val"
BATCH_SIZE = 32
EPOCHS = 5
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

def run_epoch(model, loader, criterion, optimizer, is_train):
    model.train() if is_train else model.eval()
    running_loss, correct, total = 0.0, 0, 0
    
    context = torch.enable_grad() if is_train else torch.no_grad()
    with context:
        for images, labels in loader:
            if images.size(0) <= 1: continue  # Skip single trailing element batch normalization failures
            images, labels = images.to(DEVICE), labels.to(DEVICE)
            
            if is_train: optimizer.zero_grad()
            outputs = model(images)
            loss = criterion(outputs, labels)
            
            if is_train:
                loss.backward()
                optimizer.step()
                
            running_loss += loss.item() * images.size(0)
            _, predicted = outputs.max(1)
            total += labels.size(0)
            correct += predicted.eq(labels).sum().item()
            
    return running_loss / total, correct / total

if __name__ == "__main__":
    print(f"--- AgroShield AI Hybrid Pipeline ---")
    print(f"Target hardware environment: {DEVICE}")
    
    try:
        train_loader, valid_loader, num_classes = get_data_loaders(TRAIN_DIR, VALID_DIR, BATCH_SIZE)
        print(f"Dataset connected successfully! Total classes verified: {num_classes}")
    except Exception as e:
        print(f"\n❌ Path Resolution Error: Check your target data directories.")
        print(f"Details: {e}")
        exit()
    
    model = AgroShieldHybridModel(num_classes=num_classes).to(DEVICE)
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.AdamW(model.parameters(), lr=3e-4, weight_decay=1e-2)
    
    best_acc = 0.0
    for epoch in range(EPOCHS):
        print(f"\nExecuting Epoch [{epoch+1}/{EPOCHS}]...")
        t_loss, t_acc = run_epoch(model, train_loader, criterion, optimizer, is_train=True)
        v_loss, v_acc = run_epoch(model, valid_loader, criterion, None, is_train=False)
        
        print(f"Epoch [{epoch+1}/{EPOCHS}] Logs -> Train Loss: {t_loss:.4f}, Train Acc: {t_acc*100:.2f}% | Val Loss: {v_loss:.4f}, Val Acc: {v_acc*100:.2f}%")
        
        if v_acc > best_acc:
            best_acc = v_acc
            torch.save(model.state_dict(), "agroshield_hybrid.pth")
            print("💾 Saved optimal feature fusion weights state dictionary!")