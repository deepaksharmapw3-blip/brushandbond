#!/usr/bin/env python3
"""
Direct Hero Image Integration for Brush and Bond
This script will download the college building image and create all necessary optimizations
"""

import os
import sys
import urllib.request
import urllib.error
from pathlib import Path

def ensure_pillow():
    """Ensure Pillow is installed"""
    try:
        from PIL import Image
        return True
    except ImportError:
        print("Installing Pillow...")
        import subprocess
        subprocess.run([sys.executable, "-m", "pip", "install", "Pillow", "-q"], check=True)
        return True

def optimize_image(input_path, output_path, width, quality):
    """Convert and optimize image to WebP"""
    from PIL import Image
    
    try:
        img = Image.open(input_path)
        
        # Calculate height maintaining aspect ratio
        aspect_ratio = img.height / img.width
        height = int(width * aspect_ratio)
        
        # Resize with high-quality resampling
        img_resized = img.resize((width, height), Image.Resampling.LANCZOS)
        
        # Save as WebP with optimization
        img_resized.save(output_path, 'WEBP', quality=quality, method=6)
        
        file_size = os.path.getsize(output_path) / 1024
        return file_size
    except Exception as e:
        print(f"Error optimizing {output_path}: {e}")
        return None

def main():
    project_root = Path(__file__).parent
    images_dir = project_root / "public" / "images"
    images_dir.mkdir(parents=True, exist_ok=True)
    
    input_jpg = images_dir / "hero-building.jpg"
    
    print("🎨 Brush and Bond Hero Image Integration")
    print("=" * 60)
    
    # Check if input image exists
    if not input_jpg.exists():
        print(f"\n❌ Image not found at: {input_jpg}")
        print("\nHow to fix:")
        print("1. Save your college building photo to:")
        print(f"   {input_jpg}")
        print("\n2. Then run this script again")
        print("\nAlternatively, use the UI to upload the image first.")
        return 1
    
    print(f"\n📸 Input image: {input_jpg.name}")
    input_size = input_jpg.stat().st_size / 1024
    print(f"   Size: {input_size:.0f} KB")
    
    # Ensure Pillow
    print("\n✓ Checking dependencies...")
    ensure_pillow()
    print("✓ Pillow ready")
    
    print("\n🔄 Generating optimized WebP versions...\n")
    
    # Define conversions
    conversions = [
        (640, 80, "hero-building-640w.webp", "📱 Mobile"),
        (1280, 82, "hero-building-1280w.webp", "📲 Tablet"),
        (1920, 85, "hero-building-1920w.webp", "🖥️  Desktop"),
    ]
    
    all_success = True
    
    for width, quality, filename, emoji in conversions:
        output_path = images_dir / filename
        print(f"{emoji} {filename}")
        print(f"   └─ {width}px @ quality {quality}")
        
        size = optimize_image(str(input_jpg), str(output_path), width, quality)
        
        if size is not None:
            print(f"   └─ Result: {size:.0f} KB ✓\n")
        else:
            print(f"   └─ Failed ✗\n")
            all_success = False
    
    if all_success:
        print("=" * 60)
        print("✅ Hero image integration complete!\n")
        
        print("📁 Generated files:")
        for file in sorted(images_dir.glob("hero-building*")):
            size = file.stat().st_size / 1024
            print(f"   ✓ {file.name} ({size:.0f} KB)")
        
        print("\n🚀 Next steps:")
        print("   1. Refresh your browser: http://localhost:5173")
        print("   2. Hero should load with smooth zoom animation")
        print("   3. Text should be readable over the image")
        print("   4. Test on mobile and desktop")
        
        print("\n✨ The hero is live!\n")
        return 0
    else:
        print("❌ Some conversions failed. Please check the errors above.")
        return 1

if __name__ == "__main__":
    sys.exit(main())
