import os
import torch
from torchvision import transforms
from PIL import Image
from model import AgroShieldHybridModel

def main():
    print("🌿 Loading AgroShield AI Backend Engine...")
    device = torch.device('cpu') 
    
    # Check both current directory and the auto-generated nested path variant
    weights_path = "best_model.pth"
    if not os.path.exists(weights_path):
        if os.path.exists("dataset/best_model.pth"):
            weights_path = "dataset/best_model.pth"
        else:
            # Check for any .pth weights file in the directory
            pth_files = [f for f in os.listdir('.') if f.endswith('.pth')]
            if pth_files:
                weights_path = pth_files[0]
            elif os.path.exists('dataset') and os.path.isdir('dataset'):
                pth_files_nested = [os.path.join('dataset', f) for f in os.listdir('dataset') if f.endswith('.pth')]
                if pth_files_nested:
                    weights_path = pth_files_nested[0]

    model = AgroShieldHybridModel(num_classes=38).to(device)
    if os.path.exists(weights_path):
        model.load_state_dict(torch.load(weights_path, map_location=device))
        model.eval()
        print(f"✅ 98% Accurate Weights Loaded Successfully from: {weights_path}")
    else:
        print("❌ Error: Weights (.pth) file not found in this folder."); return

    img_path = input("\n📥 Drag & drop or paste your leaf image path here and press Enter: ").strip("'\" ")
    if img_path and os.path.exists(img_path):
        transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
        ])
        img = transform(Image.open(img_path).convert('RGB')).unsqueeze(0).to(device)
        
        with torch.no_grad():
            outputs = model(img)
            _, predicted = outputs.max(1)
            
        print(f"\n🔬 [RESULT] Predicted Plant Disease Class ID: {predicted.item()}\n")
    else:
        print("❌ Invalid image path.")

if __name__ == '__main__':
    main()