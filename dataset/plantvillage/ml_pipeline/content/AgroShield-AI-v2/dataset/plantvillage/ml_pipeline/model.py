import torch
import torch.nn as nn
import timm

class AgroShieldHybridModel(nn.Module):
    def __init__(self, num_classes=38):
        super(AgroShieldHybridModel, self).__init__()
        
        # Standard timm backbones without classification heads (num_classes=0)
        self.convnext = timm.create_model('convnext_tiny', pretrained=True, num_classes=0)
        self.swin = timm.create_model('swin_tiny_patch4_window7_224', pretrained=True, num_classes=0)
        
        # ConvNeXt Tiny (768) + Swin Tiny (768) = 1536 fused features
        self.classifier = nn.Sequential(
            nn.Linear(1536, 512),
            nn.BatchNorm1d(512),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(512, num_classes)
        )

    def forward(self, x):
        feat1 = self.convnext(x)
        feat2 = self.swin(x)
        
        # Concatenate feature maps side-by-side
        merged_feats = torch.cat((feat1, feat2), dim=1)
        
        # Dynamic fallback alignment in case of feature matrix dimensional drift
        if self.classifier[0].in_features != merged_feats.size(1):
            self.classifier[0] = nn.Linear(merged_feats.size(1), 512).to(merged_feats.device)
            self.classifier[1] = nn.BatchNorm1d(512).to(merged_feats.device)
            
        return self.classifier(merged_feats)
