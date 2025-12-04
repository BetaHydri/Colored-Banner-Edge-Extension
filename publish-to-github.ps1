# Initialize git repository and publish to GitHub

Write-Host "RedBanner Extension - GitHub Publishing Script" -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Green
Write-Host ""

# Check if git is installed
try {
    git --version | Out-Null
} catch {
    Write-Host "ERROR: Git is not installed. Please install Git first." -ForegroundColor Red
    Write-Host "Download from: https://git-scm.com/download/win" -ForegroundColor Yellow
    exit 1
}

# Initialize git repository
Write-Host "Initializing Git repository..." -ForegroundColor Yellow
git init

# Create .gitignore
Write-Host "Creating .gitignore..." -ForegroundColor Yellow
@"
# Windows
Thumbs.db
Desktop.ini

# macOS
.DS_Store

# Temporary files
*.tmp
*.temp
*.log

# ZIP packages
*.zip

# Optional: Exclude PowerShell execution logs
*.ps1.log
"@ | Out-File -FilePath ".gitignore" -Encoding UTF8

# Add all files
Write-Host "Adding files to git..." -ForegroundColor Yellow
git add .

# Create initial commit
Write-Host "Creating initial commit..." -ForegroundColor Yellow
git commit -m "Initial commit - RedBanner Extension v3.0.0

Features:
- Red banner overlay on all webpages
- Terminal Server deployment scripts
- Enterprise Group Policy support
- Multiple profile configuration
- Automated installation scripts
"

Write-Host ""
Write-Host "Git repository initialized successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps to publish to GitHub:" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Create a new repository on GitHub:" -ForegroundColor White
Write-Host "   - Go to https://github.com/new" -ForegroundColor Gray
Write-Host "   - Repository name: RedBanner-Extension" -ForegroundColor Gray
Write-Host "   - Description: Edge extension for visual browser differentiation in Terminal Server" -ForegroundColor Gray
Write-Host "   - Make it Public (or Private if preferred)" -ForegroundColor Gray
Write-Host "   - DON'T initialize with README (we already have one)" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Copy your GitHub repository URL (shown after creation)" -ForegroundColor White
Write-Host ""
Write-Host "3. Run these commands:" -ForegroundColor White
Write-Host "" 
Write-Host "   git remote add origin https://github.com/BetaHydri/RedBanner-Extension.git" -ForegroundColor Yellow
Write-Host "   git branch -M main" -ForegroundColor Yellow
Write-Host "   git push -u origin main" -ForegroundColor Yellow
Write-Host ""
Write-Host "4. (Optional) Create a release:" -ForegroundColor White
Write-Host "   - Go to your repository on GitHub" -ForegroundColor Gray
Write-Host "   - Click 'Releases' → 'Create a new release'" -ForegroundColor Gray
Write-Host "   - Tag: v3.0.0" -ForegroundColor Gray
Write-Host "   - Title: RedBanner Extension v3.0.0" -ForegroundColor Gray
Write-Host "   - Attach the ZIP file: Internet-Farm-Extension.zip" -ForegroundColor Gray
Write-Host ""
Write-Host "Repository is ready to push!" -ForegroundColor Green
