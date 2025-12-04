# Uninstall Internet Farm Extension from Enterprise Deployment
# Run as Administrator

Write-Host "Internet Farm Extension - Uninstall" -ForegroundColor Yellow
Write-Host "====================================" -ForegroundColor Yellow

# Check if running as administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (!$isAdmin) {
    Write-Host "ERROR: This script must be run as Administrator!" -ForegroundColor Red
    exit 1
}

$regPath = "HKLM:\Software\Policies\Microsoft\Edge\ExtensionInstallForcelist"
$localPath = "$env:ProgramData\EdgeExtensions\InternetFarm"

# Remove registry entry
Write-Host "Removing registry entry..." -ForegroundColor Yellow
try {
    if (Test-Path $regPath) {
        Remove-ItemProperty -Path $regPath -Name "1" -ErrorAction SilentlyContinue
        Write-Host "✓ Registry entry removed" -ForegroundColor Green
    } else {
        Write-Host "! Registry entry not found (already removed)" -ForegroundColor Gray
    }
} catch {
    Write-Host "WARNING: Could not remove registry entry: $_" -ForegroundColor Yellow
}

# Remove local files
Write-Host "Removing local files..." -ForegroundColor Yellow
try {
    if (Test-Path $localPath) {
        Remove-Item $localPath -Recurse -Force
        Write-Host "✓ Local files removed" -ForegroundColor Green
    } else {
        Write-Host "! Local files not found (already removed)" -ForegroundColor Gray
    }
} catch {
    Write-Host "WARNING: Could not remove local files: $_" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Uninstall completed!" -ForegroundColor Green
Write-Host "Users need to restart Edge for changes to take effect." -ForegroundColor Cyan
