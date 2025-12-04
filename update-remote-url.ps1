# Update Git Remote URL to RedBanner-Extension

Write-Host "Updating Git remote URL to RedBanner-Extension..." -ForegroundColor Yellow

# Update the remote URL
git remote set-url origin https://github.com/BetaHydri/Colored-Banner-Edge-Extension.git

# Verify the change
Write-Host ""
Write-Host "Updated remote URLs:" -ForegroundColor Green
git remote -v

Write-Host ""
Write-Host "Repository renamed successfully!" -ForegroundColor Green
Write-Host "You can now use: git push, git pull as normal" -ForegroundColor Cyan
