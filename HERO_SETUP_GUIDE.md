# Hero Background Image Setup Guide

Your college building image is ready to be integrated. Follow these steps to complete the setup.

## Quick Start

The image you provided is perfect for the hero:
- ✅ Low-angle perspective showing the building
- ✅ Beautiful sky with clouds at the top
- ✅ Tree leaves framing the sides
- ✅ GCECT signboard visible
- ✅ Dusk lighting with warm tones

## Step 1: Place the Original JPEG

**File location:** `public/images/hero-building.jpg`

The image should be:
- Minimum 1920px wide
- JPEG format (quality ~85%)
- Dimensions: typically 1920x1440 or similar aspect ratio

**Status:** ✅ Directory created and ready

## Step 2: Generate WebP Optimized Versions

You have two options:

### Option A: Using cwebp (Recommended - Best Quality Control)

**Install libwebp:**

```powershell
# Using Chocolatey (if installed)
choco install libwebp

# Or download manually
# https://developers.google.com/speed/webp/download
```

**Then run the setup script:**

```powershell
cd c:\Users\DEEPAK\Downloads\brushandbond
.\HERO_IMAGE_SETUP.ps1
```

This will automatically generate all three WebP sizes.

### Option B: Online WebP Converter (No Installation)

Use this free online tool: https://convertio.co/jpg-webp/

**Generate each size:**

1. **640px (Mobile)**
   - Upload: `hero-building.jpg`
   - Resize to: 640px width (height: proportional)
   - Quality: 80
   - Download as: `hero-building-640w.webp`
   - Save to: `public/images/`

2. **1280px (Tablet)**
   - Upload: `hero-building.jpg`
   - Resize to: 1280px width
   - Quality: 82
   - Download as: `hero-building-1280w.webp`
   - Save to: `public/images/`

3. **1920px (Desktop)**
   - Upload: `hero-building.jpg`
   - Resize to: 1920px width
   - Quality: 85
   - Download as: `hero-building-1920w.webp`
   - Save to: `public/images/`

## Step 3: Verify File Structure

After optimization, your `public/images/` should have:

```
public/images/
├── hero-building.jpg              (original, ~200-300KB)
├── hero-building-640w.webp        (~40-60KB)
├── hero-building-1280w.webp       (~80-120KB)
└── hero-building-1920w.webp       (~150-200KB)
```

Check in Windows Explorer:
```
c:\Users\DEEPAK\Downloads\brushandbond\public\images\
```

## Step 4: Test the Hero

1. **Start the dev server:**
   ```bash
   npm run dev
   ```

2. **Open in browser:**
   ```
   http://localhost:5173
   ```

3. **Verify:**
   - ✅ Hero image loads (no 404 in console)
   - ✅ Zoom animation plays smoothly
   - ✅ Gradient overlay is visible
   - ✅ Text is readable ("Brush and Bond")
   - ✅ Sky/clouds visible at top
   - ✅ Building visible below
   - ✅ Tree leaves frame the sides
   - ✅ Buttons are clickable
   - ✅ Responsive on mobile (landscape crop)

## What Will Happen

When you visit the homepage:

1. **Placeholder** - Dark background shows while loading
2. **Image loads** - Browser picks the best WebP variant:
   - Mobile: 640w version (~0.5s)
   - Tablet: 1280w version (~0.8s)
   - Desktop: 1920w version (~1.2s)
3. **Zoom animation** - Subtle 1.05 → 1.0 scale over 8 seconds
4. **Overlays apply** - Gradient and vignette blend
5. **Text renders** - "Brush and Bond" in off-white and accent blue
6. **Interactive** - Cursor paint effect (35% opacity)

## Troubleshooting

### Image not loading?
- Check file path: `public/images/hero-building.jpg`
- Verify all three WebP files exist
- Clear browser cache: **Ctrl+Shift+R**
- Check browser console for 404 errors

### Text not readable?
- Hero gradient is designed to make text readable
- If text is too faint, the overlay will adapt
- Try adjusting monitor brightness/contrast

### Animation not smooth?
- Check browser DevTools Performance tab
- Verify device has adequate GPU/CPU
- Animation respects `prefers-reduced-motion` setting

### WebP not loading but JPEG is?
- Most modern browsers support WebP
- JPEG fallback is available
- Check browser support: https://caniuse.com/webp

### File size too large?
- Reduce quality: 80 (mobile), 82 (tablet), 85 (desktop)
- Compress JPEG before converting
- Or use lower resolution input

## Performance Checklist

- [ ] All 4 image files in `public/images/`
- [ ] No 404 errors in browser console
- [ ] Hero loads within 2 seconds
- [ ] Zoom animation plays smoothly
- [ ] Text is readable
- [ ] Works on mobile (responsive crop)
- [ ] Works on dark mode
- [ ] Cursor paint effect visible but subtle

## Next Steps After Setup

Once the hero is working:

1. **Test on different devices:**
   - Desktop Chrome/Edge/Firefox
   - Mobile Safari/Chrome
   - Tablet

2. **Verify accessibility:**
   - Text contrast is WCAG AA compliant
   - Image is marked decorative (screenreaders skip it)
   - Focus states visible on buttons
   - Keyboard navigation works

3. **Monitor performance:**
   - Check Lighthouse scores
   - Image should be <200KB each
   - Hero should load in <1.5s

4. **Future enhancements:**
   - Add AVIF format for even better compression
   - Implement intersection observer for lazy loading
   - Add alt text variation for social media

## Questions?

Refer to `IMAGE_SETUP.md` for detailed technical information about the HeroBackdrop component.

---

**Estimated time:** 10-15 minutes
**Difficulty:** Easy
**No coding required!**
