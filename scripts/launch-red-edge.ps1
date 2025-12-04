# Launch Edge with customizable banner (Internet Farm Extension)
# Configure colors via: Right-click extension icon -> Options
# This creates a dedicated profile that includes the extension

param(
    [string]$Url = "about:blank",
    [string]$ProfileName = "InternetFarm-Red"
)

$profilePath = "$env:LOCALAPPDATA\Microsoft\Edge\Profiles\$ProfileName"
$extensionPath = "$env:ProgramData\EdgeExtensions\InternetFarm"

# Launch Edge with dedicated profile and force-load extension
Start-Process "msedge.exe" -ArgumentList @(
    "--profile-directory=`"$ProfileName`"",
    "--load-extension=`"$extensionPath`"",
    "--no-first-run",
    "--no-default-browser-check",
    $Url
)

Write-Host "Launched RED Edge Browser (Internet Farm)" -ForegroundColor Red
