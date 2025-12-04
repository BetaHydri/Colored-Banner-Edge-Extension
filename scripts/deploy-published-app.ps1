# Deploy RED Edge as published app on Terminal Server
# Run as Administrator

param(
    [string]$AppName = "Internet Farm (Red)",
    [string]$StartUrl = "https://intranet.company.com",
    [switch]$CreateShortcut
)

Write-Host "Deploying RED Edge Published App..." -ForegroundColor Green

$extensionPath = "$env:ProgramData\EdgeExtensions\InternetFarm"
$profileName = "InternetFarm-Red"

# Create batch file to launch RED Edge
$batchContent = @"
@echo off
start msedge.exe --profile-directory="$profileName" --load-extension="$extensionPath" --no-first-run --no-default-browser-check "$StartUrl"
"@

$batchPath = "$env:ProgramData\EdgeExtensions\launch-red-edge.bat"
$batchContent | Out-File -FilePath $batchPath -Encoding ASCII

Write-Host "✓ Created launcher: $batchPath" -ForegroundColor Green

if ($CreateShortcut) {
    # Create desktop shortcut
    $WshShell = New-Object -ComObject WScript.Shell
    $shortcutPath = "$env:Public\Desktop\$AppName.lnk"
    $Shortcut = $WshShell.CreateShortcut($shortcutPath)
    $Shortcut.TargetPath = $batchPath
    $Shortcut.IconLocation = "$extensionPath\icons\icon128.png,0"
    $Shortcut.Description = "Edge Browser with Customizable Banner"
    $Shortcut.Save()
    
    Write-Host "✓ Created desktop shortcut: $shortcutPath" -ForegroundColor Green
}

Write-Host ""
Write-Host "Deployment complete!" -ForegroundColor Green
Write-Host ""
Write-Host "To publish in RemoteApp/Terminal Server:" -ForegroundColor Cyan
Write-Host "1. Open Server Manager → Remote Desktop Services → Collections" -ForegroundColor White
Write-Host "2. Select your collection → Published RemoteApp Programs" -ForegroundColor White
Write-Host "3. Click 'Publish RemoteApp Programs'" -ForegroundColor White
Write-Host "4. Add custom program:" -ForegroundColor White
Write-Host "   Path: $batchPath" -ForegroundColor Yellow
Write-Host "   Name: $AppName" -ForegroundColor Yellow
Write-Host "   Icon: $extensionPath\icons\icon128.png" -ForegroundColor Yellow
Write-Host ""
Write-Host "For DEFAULT Edge (no branding):" -ForegroundColor Cyan
Write-Host "   Path: C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" -ForegroundColor Yellow
Write-Host "   Arguments: --profile-directory=Default" -ForegroundColor Yellow
