# Launch default Edge WITHOUT banner extension
# This uses the default profile without the extension

param(
    [string]$Url = "about:blank"
)

# Launch Edge with default profile (no extension loaded)
Start-Process "msedge.exe" -ArgumentList @(
    "--profile-directory=Default",
    "--no-first-run",
    $Url
)

Write-Host "Launched DEFAULT Edge Browser (no branding)" -ForegroundColor Gray
