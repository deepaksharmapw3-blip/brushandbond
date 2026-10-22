# Hero Background Image Setup

## Image Placement & Optimization

Your college building photo has been set up in the hero component. Now you need to save and optimize it.

### Step 1: Save the Original Image

Save your photo as:
```
public/images/hero-building.jpg
```

Recommended settings:
- Quality: 85% (good balance of quality and file size)
- Dimensions: 1920px wide minimum (height auto-scales)
- Format: JPEG for best browser support

### Step 2: Generate WebP Optimizations

The hero is configured to use WebP images at three breakpoints for optimal performance:

**640px (Mobile)**
- Source: `public/images/hero-building-640w.webp`
- For mobile devices
- Command: `cwebp -q 80 -resize 640 0 hero-building.jpg -o hero-building-640w.webp`

**1280px (Tablet)**
- Source: `public/images/hero-building-1280w.webp`
- For tablets and small desktops
- Command: `cwebp -q 82 -resize 1280 0 hero-building.jpg -o hero-building-1280w.webp`

**1920px (Desktop)**
- Source: `public/images/hero-building-1920w.webp`
- For large desktop screens
- Command: `cwebp -q 85 -resize 1920 0 hero-building.jpg -o hero-building-1920w.webp`

### Installing WebP Tools

**Windows:**
```powershell
# Using chocolatey (if installed)
choco install libwebp

# Or download from: https://developers.google.com/speed/webp/download
```

**macOS:**
```bash
brew install webp
```

**Linux:**
```bash
sudo apt-get install webp
```

**Alternative: Online WebP Converter**
- https://convertio.co/jpg-webp/
- https://image.online-convert.com/convert-to-webp

### Step 3: File Structure

After optimization, your `public/images/` directory should contain:

```
public/images/
├── hero-building.jpg              (1920px, ~200-250KB)
├── hero-building-640w.webp        (~40-60KB)
├── hero-building-1280w.webp       (~80-120KB)
└── hero-building-1920w.webp       (~150-200KB)
```

### Step 4: Verify Setup

The HeroBackdrop component will:
1. ✅ Preload the image with `fetchPriority="high"`
2. ✅ Show a dark placeholder while loading
3. ✅ Display the highest resolution WebP for the device
4. ✅ Fall back to JPEG if WebP isn't supported
5. ✅ Apply overlays and filters
6. ✅ Animate zoom on load (1.05 → 1.0 over 8 seconds)
7. ✅ Respect prefers-reduced-motion

### What the Component Does

**Image Positioning:**
- Desktop: `object-position: 50% 35%` (shows sky, clouds, top of building)
- Mobile: `object-position: 50% 50%` (responsive, adjusts for portrait)

**Filters & Effects:**
- Saturation: 70% (reduces vibrancy)
- Contrast: 95% (slightly lowered)
- Gradient overlay: Dark at top (55% opacity) to transparent at bottom
- Vignette: 25% black at edges

**Text Colors (On Photo):**
- "Brush": #F5F1EA (off-white)
- "and Bond": #7E88FF (accent blue)
- Tagline: #F5F1EA
- Support line: #F5F1EA/70
- Buttons: Accent fill + off-white border

**Accessibility:**
- Image marked as decorative (`alt=""`, `aria-hidden="true"`)
- Fallback: Solid dark background if image fails
- Cursor paint effect: 35% opacity, screen blend mode
- No motion if prefers-reduced-motion is set

## Quick Image Conversion Script

Save this as `optimize-hero.ps1` in your project root:

```powershell
# PowerShell script to convert and optimize hero image

$imagePath = "public/images/hero-building.jpg"

if (-not (Test-Path $imagePath)) {
    Write-Error "Image not found at $imagePath"
    exit 1
}

# Check if cwebp is installed
$cwebp = Get-Command cwebp -ErrorAction SilentlyContinue

if (-not $cwebp) {
    Write-Error "cwebp not found. Install libwebp to continue."
    Write-Host "Visit: https://developers.google.com/speed/webp/download"
    exit 1
}

Write-Host "Converting hero images to WebP..."

# 640px
cwebp -q 80 -resize 640 0 $imagePath -o "public/images/hero-building-640w.webp"
Write-Host "✓ Generated hero-building-640w.webp"

# 1280px
cwebp -q 82 -resize 1280 0 $imagePath -o "public/images/hero-building-1280w.webp"
Write-Host "✓ Generated hero-building-1280w.webp"

# 1920px
cwebp -q 85 -resize 1920 0 $imagePath -o "public/images/hero-building-1920w.webp"
Write-Host "✓ Generated hero-building-1920w.webp"

Write-Host "Done! All WebP versions generated."
```

Run with:
```powershell
.\optimize-hero.ps1
```

## Performance Checklist

- [ ] Image saved to `public/images/hero-building.jpg`
- [ ] 640px WebP generated
- [ ] 1280px WebP generated
- [ ] 1920px WebP generated
- [ ] All files in place
- [ ] `npm run dev` starts without errors
- [ ] Hero loads with smooth zoom animation
- [ ] Image visible with overlay and text readable
- [ ] Works on mobile (responsive positioning)
- [ ] Dark mode looks good
- [ ] Cursor paint effect visible but subtle

## Troubleshooting

**Image not loading?**
- Check file paths are correct
- Verify all files are in `public/images/`
- Clear browser cache and hard refresh (Ctrl+Shift+R)
- Check browser console for 404 errors

**WebP not loading?**
- Verify quality settings are reasonable (80-85)
- Test image size is not too large
- Check browser support (all modern browsers support WebP)

**Text not readable?**
- Adjust overlay opacity in HeroBackdrop.tsx
- Increase `rgba(21, 19, 15, 0.xx)` values (higher = darker)
- Test on different backgrounds

**Animation not smooth?**
- Check prefers-reduced-motion is respected
- Verify device has enough resources
- Test on different browsers

**Cursor paint fights image?**
- Opacity reduced to 35% with `mix-blend-mode: screen`
- Should be subtle and non-intrusive
- Adjust opacity in HeroPaintCanvas.tsx if needed

## Browser Support

- ✅ Chrome/Edge 23+
- ✅ Firefox 25+
- ✅ Safari 16+
- ✅ Mobile browsers (iOS 14+, Android Chrome)
- ✅ Fallback to JPEG for older browsers

## Next Steps

1. Save the original JPEG to `public/images/hero-building.jpg`
2. Generate WebP versions using cwebp or online tool
3. Verify all files are in place
4. Test locally with `npm run dev`
5. Check on mobile and desktop
6. Verify WCAG contrast on text

That's it! The hero will automatically load and display the image with proper optimizations, overlays, and animations.
