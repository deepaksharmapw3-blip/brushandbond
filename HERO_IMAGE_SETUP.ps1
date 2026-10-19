# =========================================================
# Brush and Bond Hero Image Setup Script
# =========================================================
# This script requires cwebp to be installed
# Download: https://developers.google.com/speed/webp/download
# Or use chocolatey: choco install libwebp
# =========================================================

param(
    [string]$ImagePath = "public/images/hero-building.jpg"
)

Write-Host "🎨 Brush and Bond Hero Image Optimization" -ForegroundColor Cyan
Write-Host "=========================================`n"

# Check if image exists
if (-not (Test-Path $ImagePath)) {
    Write-Host "❌ Image not found at: $ImagePath" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Found image: $ImagePath`n" -ForegroundColor Green

# Check if cwebp is installed
$cwebp = Get-Command cwebp -ErrorAction SilentlyContinue

if (-not $cwebp) {
    Write-Host "❌ cwebp not found. Please install libwebp first:" -ForegroundColor Red
    Write-Host ""
    Write-Host "   Windows (Chocolatey):" -ForegroundColor Yellow
    Write-Host "   choco install libwebp"
    Write-Host ""
    Write-Host "   Or download from:" -ForegroundColor Yellow
    Write-Host "   https://developers.google.com/speed/webp/download"
    Write-Host ""
    exit 1
}

Write-Host "✓ cwebp found`n" -ForegroundColor Green

# Create images directory if it doesn't exist
$imageDir = Split-Path $ImagePath
if (-not (Test-Path $imageDir)) {
    New-Item -ItemType Directory -Path $imageDir -Force | Out-Null
    Write-Host "✓ Created directory: $imageDir`n" -ForegroundColor Green
}

# Define output paths
$baseName = [System.IO.Path]::GetFileNameWithoutExtension($ImagePath)
$baseDir = Split-Path $ImagePath
$output640 = Join-Path $baseDir "$baseName-640w.webp"
$output1280 = Join-Path $baseDir "$baseName-1280w.webp"
$output1920 = Join-Path $baseDir "$baseName-1920w.webp"

Write-Host "Converting to WebP (this may take a minute)...`n" -ForegroundColor Cyan

# 640px - Mobile
Write-Host "📱 Generating 640px (mobile)..." -ForegroundColor Yellow
cwebp -q 80 -resize 640 0 $ImagePath -o $output640
if ($LASTEXITCODE -eq 0) {
    $size640 = (Get-Item $output640).Length / 1KB
    Write-Host "✓ hero-building-640w.webp ($([Math]::Round($size640))KB)`n" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to generate 640px version`n" -ForegroundColor Red
    exit 1
}

# 1280px - Tablet
Write-Host "📲 Generating 1280px (tablet)..." -ForegroundColor Yellow
cwebp -q 82 -resize 1280 0 $ImagePath -o $output1280
if ($LASTEXITCODE -eq 0) {
    $size1280 = (Get-Item $output1280).Length / 1KB
    Write-Host "✓ hero-building-1280w.webp ($([Math]::Round($size1280))KB)`n" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to generate 1280px version`n" -ForegroundColor Red
    exit 1
}

# 1920px - Desktop
Write-Host "🖥️  Generating 1920px (desktop)..." -ForegroundColor Yellow
cwebp -q 85 -resize 1920 0 $ImagePath -o $output1920
if ($LASTEXITCODE -eq 0) {
    $size1920 = (Get-Item $output1920).Length / 1KB
    Write-Host "✓ hero-building-1920w.webp ($([Math]::Round($size1920))KB)`n" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to generate 1920px version`n" -ForegroundColor Red
    exit 1
}

# Summary
Write-Host "=========================================`n" -ForegroundColor Cyan
Write-Host "✅ Hero image setup complete!`n" -ForegroundColor Green

$jpegSize = (Get-Item $ImagePath).Length / 1KB
Write-Host "📊 File Summary:" -ForegroundColor Yellow
Write-Host "   hero-building.jpg           $([Math]::Round($jpegSize))KB"
Write-Host "   hero-building-640w.webp     $([Math]::Round($size640))KB"
Write-Host "   hero-building-1280w.webp    $([Math]::Round($size1280))KB"
Write-Host "   hero-building-1920w.webp    $([Math]::Round($size1920))KB`n"

Write-Host "🚀 Next steps:" -ForegroundColor Cyan
Write-Host "   1. Run: npm run dev"
Write-Host "   2. Open http://localhost:5173"
Write-Host "   3. Verify hero loads with image, zoom animation, and overlays"
Write-Host "   4. Test on mobile and desktop`n"

Write-Host "✨ The hero is ready to shine!`n" -ForegroundColor Green
