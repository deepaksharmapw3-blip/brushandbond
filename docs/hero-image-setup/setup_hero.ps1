# =====================================================
# Brush and Bond - Hero Image Setup
# This script will help you integrate the college building image
# =====================================================

Write-Host "🎨 Brush and Bond - Hero Image Setup" -ForegroundColor Cyan
Write-Host "====================================`n" -ForegroundColor Cyan

# Step 1: Check if image exists
$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
$imagePath = Join-Path $repoRoot "public\images\hero-building.jpg"

if (-not (Test-Path $imagePath)) {
    Write-Host "📸 Step 1: Save the college building image`n" -ForegroundColor Yellow
    Write-Host "Location: $imagePath`n"
    Write-Host "Instructions:" -ForegroundColor Green
    Write-Host "1. Open: $repoRoot\public\images"
    Write-Host "2. Save your college building photo as: hero-building.jpg`n"
    Write-Host "Press ENTER once you've saved the image..." -ForegroundColor Cyan
    Read-Host
    
    # Check again
    if (-not (Test-Path $imagePath)) {
        Write-Host "❌ Image not found. Please save it first." -ForegroundColor Red
        exit 1
    }
}

Write-Host "`n✓ Image found: $imagePath`n" -ForegroundColor Green

# Step 2: Run Python optimizer
Write-Host "🔄 Optimizing image to WebP formats..." -ForegroundColor Cyan
Write-Host "(This will automatically generate 640px, 1280px, and 1920px versions)`n"

# Check if Python is available
$python = Get-Command python -ErrorAction SilentlyContinue

if (-not $python) {
    Write-Host "❌ Python not found. Please install Python first.`n" -ForegroundColor Red
    Write-Host "Download from: https://www.python.org/downloads/`n"
    exit 1
}

Write-Host "✓ Python found: $(python --version)`n" -ForegroundColor Green

# Run optimizer
python (Join-Path $PSScriptRoot "optimize_hero.py")

$lastExitCode = $LASTEXITCODE

if ($lastExitCode -eq 0) {
    Write-Host "✅ Setup complete!`n" -ForegroundColor Green
    Write-Host "Browser Instructions:" -ForegroundColor Yellow
    Write-Host "1. Go to: http://localhost:5173"
    Write-Host "2. Refresh the page (Ctrl+R or Cmd+R)"
    Write-Host "3. The hero image should load with zoom animation`n"
    Write-Host "Enjoy! 🎨`n" -ForegroundColor Green
} else {
    Write-Host "`n❌ Setup failed. Please check the errors above." -ForegroundColor Red
    exit 1
}
