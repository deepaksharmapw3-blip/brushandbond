#!/usr/bin/env python3
"""
Brush and Bond Hero Image Optimizer
Converts and optimizes hero building image to WebP format
"""

import os
import sys
import subprocess
from pathlib import Path

def check_pillow():
    """Check if Pillow is installed, install if needed"""
    try:
        from PIL import Image
        print("✓ Pillow is installed")
        return True
    except ImportError:
        print("⚠ Installing Pillow for image optimization...")
        subprocess.run([sys.executable, "-m", "pip", "install", "Pillow", "-q"], check=True)
        print("✓ Pillow installed")
        return True

def optimize_image(input_path, output_path, width, quality):
    """Optimize image to WebP format"""
    from PIL import Image
    
    try:
        img = Image.open(input_path)
        
        # Calculate height maintaining aspect ratio
        aspect_ratio = img.height / img.width
        height = int(width * aspect_ratio)
        
        # Resize
        img_resized = img.resize((width, height), Image.Resampling.LANCZOS)
        
        # Save as WebP
        img_resized.save(output_path, 'WEBP', quality=quality, method=6)
        
        file_size = os.path.getsize(output_path) / 1024  # KB
        print(f"  ✓ {os.path.basename(output_path)} ({file_size:.0f} KB)")
        return True
    except Exception as e:
        print(f"  ✗ Error: {e}")
        return False

def main():
    # Project root
    project_root = Path(__file__).parent
    images_dir = project_root / "public" / "images"
    
    # Ensure directory exists
    images_dir.mkdir(parents=True, exist_ok=True)
    
    # Input JPEG path
    input_jpg = images_dir / "hero-building.jpg"
    
    if not input_jpg.exists():
        print(f"❌ Image not found: {input_jpg}")
        print(f"\nPlease save your college building image to:")
        print(f"  {input_jpg}")
        sys.exit(1)
    
    print("🎨 Brush and Bond Hero Image Optimizer")
    print("=" * 50)
    print(f"\n📸 Input: {input_jpg.name}")
    
    # Check file size
    input_size = input_jpg.stat().st_size / 1024
    print(f"   Size: {input_size:.0f} KB")
    
    # Install Pillow if needed
    check_pillow()
    
    print("\n🔄 Converting to WebP...")
    
    # Define output sizes
    sizes = [
        (640, 80, "hero-building-640w.webp"),    # Mobile
        (1280, 82, "hero-building-1280w.webp"),  # Tablet
        (1920, 85, "hero-building-1920w.webp"),  # Desktop
    ]
    
    success_count = 0
    for width, quality, filename in sizes:
        output_path = images_dir / filename
        device = ["📱 Mobile", "📲 Tablet", "🖥️  Desktop"][success_count]
        print(f"\n{device} ({width}px, quality {quality}):")
        
        if optimize_image(str(input_jpg), str(output_path), width, quality):
            success_count += 1
        else:
            print(f"  ✗ Failed to optimize {filename}")
    
    if success_count == len(sizes):
        print("\n" + "=" * 50)
        print("✅ Hero image setup complete!")
        print("\n📊 Final file structure:")
        print(f"   {images_dir}/")
        
        # List all files
        for file in sorted(images_dir.glob("hero-building*")):
            size = file.stat().st_size / 1024
            print(f"   ├─ {file.name} ({size:.0f} KB)")
        
        print("\n🚀 Next steps:")
        print("   1. Refresh browser at http://localhost:5173")
        print("   2. Hero should load with image and animation")
        print("   3. Verify text is readable and image looks good")
        print("\n✨ Done! The hero is ready to shine!\n")
        return 0
    else:
        print(f"\n❌ Only {success_count}/{len(sizes)} conversions succeeded")
        return 1

if __name__ == "__main__":
    sys.exit(main())
