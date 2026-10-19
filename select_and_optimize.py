#!/usr/bin/env python3
"""
Interactive image selector and optimizer for Brush and Bond hero
"""

import os
import sys
import shutil
from pathlib import Path

def select_image_interactive():
    """Let user select image via file explorer"""
    try:
        import tkinter as tk
        from tkinter import filedialog
        
        root = tk.Tk()
        root.withdraw()
        root.wm_attributes('-topmost', 1)
        
        file_path = filedialog.askopenfilename(
            title="Select college building image",
            filetypes=[("JPEG files", "*.jpg *.jpeg"), ("All files", "*.*")],
            initialdir=os.path.expanduser("~\\Downloads")
        )
        
        return file_path if file_path else None
    except ImportError:
        return None

def copy_and_optimize(source_path, project_root):
    """Copy image and generate WebP versions"""
    from PIL import Image
    
    source_path = Path(source_path)
    images_dir = Path(project_root) / "public" / "images"
    images_dir.mkdir(parents=True, exist_ok=True)
    
    # Copy to destination
    output_jpg = images_dir / "hero-building.jpg"
    shutil.copy2(source_path, output_jpg)
    
    print(f"✓ Copied: {output_jpg.name}")
    size_kb = output_jpg.stat().st_size / 1024
    print(f"  Size: {size_kb:.0f} KB\n")
    
    # Generate WebP versions
    conversions = [
        (640, 80, "hero-building-640w.webp", "📱 Mobile"),
        (1280, 82, "hero-building-1280w.webp", "📲 Tablet"),
        (1920, 85, "hero-building-1920w.webp", "🖥️  Desktop"),
    ]
    
    print("🔄 Generating WebP versions...\n")
    
    all_success = True
    for width, quality, filename, emoji in conversions:
        output_path = images_dir / filename
        
        try:
            img = Image.open(output_jpg)
            aspect_ratio = img.height / img.width
            height = int(width * aspect_ratio)
            
            img_resized = img.resize((width, height), Image.Resampling.LANCZOS)
            img_resized.save(output_path, 'WEBP', quality=quality, method=6)
            
            size = output_path.stat().st_size / 1024
            print(f"{emoji} {filename}")
            print(f"   └─ {width}px @ Q{quality} ({size:.0f} KB) ✓\n")
        except Exception as e:
            print(f"{emoji} {filename}")
            print(f"   └─ Error: {e} ✗\n")
            all_success = False
    
    return all_success

def main():
    print("🎨 Brush and Bond Hero Image Optimizer")
    print("=" * 60)
    print("\n📸 Select your college building image...\n")
    
    # Try interactive selection
    selected_file = select_image_interactive()
    
    if not selected_file:
        print("❌ No image selected or tkinter not available.")
        print("\nManual alternative:")
        print("1. Save your image to: c:\\Users\\DEEPAK\\Downloads\\brushandbond\\public\\images\\hero-building.jpg")
        print("2. Run: python integrate_hero_direct.py")
        return 1
    
    print(f"✓ Selected: {selected_file}")
    print(f"  Size: {os.path.getsize(selected_file) / 1024:.0f} KB\n")
    
    project_root = Path(__file__).parent
    
    try:
        # Ensure Pillow
        from PIL import Image
    except ImportError:
        print("Installing Pillow...")
        import subprocess
        subprocess.run([sys.executable, "-m", "pip", "install", "Pillow", "-q"], check=True)
        from PIL import Image
    
    try:
        if copy_and_optimize(selected_file, project_root):
            print("=" * 60)
            print("✅ Hero image setup complete!\n")
            print("📁 Files generated:")
            images_dir = project_root / "public" / "images"
            for f in sorted(images_dir.glob("hero-building*")):
                size = f.stat().st_size / 1024
                print(f"   ✓ {f.name} ({size:.0f} KB)")
            
            print("\n🚀 Next steps:")
            print("   1. Refresh: http://localhost:5173")
            print("   2. Hero loads with animation")
            print("   3. Test on mobile and desktop\n")
            print("✨ Done!\n")
            return 0
        else:
            print("❌ Some WebP conversions failed.")
            return 1
    except Exception as e:
        print(f"❌ Error: {e}")
        return 1

if __name__ == "__main__":
    sys.exit(main())
