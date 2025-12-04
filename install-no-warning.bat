@echo off
:: Force Install Extension via Registry (Eliminates Warning)
:: This file will request Administrator privileges

echo.
echo ===================================================
echo   Installing Internet Farm Extension via Policy
echo ===================================================
echo.

:: Check for admin rights
net session >nul 2>&1
if %errorLevel% == 0 (
    echo Running as Administrator... OK
    goto :RunScript
) else (
    echo Requesting Administrator privileges...
    powershell -Command "Start-Process '%~f0' -Verb RunAs"
    exit /b
)

:RunScript
:: Run PowerShell script as Administrator
powershell.exe -ExecutionPolicy Bypass -Command ^
"$extensionId = 'bigapindokddagclojiehmhlhfdbp'; ^
$crxPath = Join-Path '%~dp0' 'bin\RedBanner.crx'; ^
if (-not (Test-Path $crxPath)) { Write-Host 'CRX not found!' -ForegroundColor Red; pause; exit 1 }; ^
$systemCrxPath = \"$env:ProgramData\EdgeExtensions\InternetFarm\RedBanner.crx\"; ^
$systemDir = Split-Path $systemCrxPath -Parent; ^
if (-not (Test-Path $systemDir)) { New-Item -ItemType Directory -Path $systemDir -Force | Out-Null }; ^
Copy-Item $crxPath -Destination $systemCrxPath -Force; ^
Write-Host 'CRX copied to system location' -ForegroundColor Green; ^
$regPath = 'HKLM:\Software\Policies\Microsoft\Edge\ExtensionInstallForcelist'; ^
if (-not (Test-Path $regPath)) { New-Item -Path $regPath -Force | Out-Null }; ^
$fileUrl = \"file:///$(($systemCrxPath -replace '\\', '/'))\"; ^
$regValue = \"${extensionId};${fileUrl}\"; ^
Set-ItemProperty -Path $regPath -Name '1' -Value $regValue -Type String; ^
Write-Host ''; ^
Write-Host '=================================================' -ForegroundColor Green; ^
Write-Host '  Installation Complete!' -ForegroundColor Green; ^
Write-Host '=================================================' -ForegroundColor Green; ^
Write-Host ''; ^
Write-Host 'Next steps:' -ForegroundColor Cyan; ^
Write-Host '1. Close ALL Edge windows' -ForegroundColor White; ^
Write-Host '2. Restart Edge' -ForegroundColor White; ^
Write-Host '3. Extension will auto-install (no warning)' -ForegroundColor White; ^
Write-Host ''; ^
pause"

exit /b
