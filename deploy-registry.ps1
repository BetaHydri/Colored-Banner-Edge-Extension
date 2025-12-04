# Enterprise Deployment Script for Internet Farm Extension
# Run as Administrator on Terminal Server or via Group Policy

param(
    [string]$SourcePath = "\\server\share\EdgeExtensions\InternetFarm",
    [string]$LocalPath = "$env:ProgramData\EdgeExtensions\InternetFarm"
)

Write-Host "Internet Farm Extension - Enterprise Deployment" -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Green

# Check if running as administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (!$isAdmin) {
    Write-Host "ERROR: This script must be run as Administrator!" -ForegroundColor Red
    exit 1
}

# Create local directory if it doesn't exist
if (!(Test-Path $LocalPath)) {
    Write-Host "Creating local extension directory: $LocalPath" -ForegroundColor Yellow
    New-Item -ItemType Directory -Path $LocalPath -Force | Out-Null
}

# Copy extension files
Write-Host "Copying extension files..." -ForegroundColor Yellow
try {
    Copy-Item "$PSScriptRoot\*" -Destination $LocalPath -Recurse -Force -Exclude "*.ps1", "*.md", "*.zip"
    Write-Host "✓ Files copied successfully" -ForegroundColor Green
}
catch {
    Write-Host "ERROR: Failed to copy files: $_" -ForegroundColor Red
    exit 1
}

# Configure registry for force installation
$regPath = "HKLM:\Software\Policies\Microsoft\Edge\ExtensionInstallForcelist"
Write-Host "Configuring registry for force installation..." -ForegroundColor Yellow

try {
    # Create registry path if it doesn't exist
    if (!(Test-Path $regPath)) {
        New-Item -Path $regPath -Force | Out-Null
    }
    
    # Add extension to force install list
    # Format: index = "path_to_extension"
    Set-ItemProperty -Path $regPath -Name "1" -Value $LocalPath -Type String
    Write-Host "✓ Registry configured successfully" -ForegroundColor Green
}
catch {
    Write-Host "ERROR: Failed to configure registry: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Deployment completed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Users need to restart Microsoft Edge" -ForegroundColor White
Write-Host "2. Extension will be automatically installed and enabled" -ForegroundColor White
Write-Host "3. Red banner will appear on all websites" -ForegroundColor White
Write-Host ""
Write-Host "To verify installation:" -ForegroundColor Cyan
Write-Host "- Open Edge and go to edge://extensions/" -ForegroundColor White
Write-Host "- Check edge://policy/ for applied policies" -ForegroundColor White
Write-Host ""
Write-Host "To uninstall:" -ForegroundColor Cyan
Write-Host "Remove-ItemProperty -Path '$regPath' -Name '1'" -ForegroundColor White
