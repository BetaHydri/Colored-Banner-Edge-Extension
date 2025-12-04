#Requires -Version 5.1
<#
.SYNOPSIS
    Creates a signed CRX package for the Internet Farm Edge Extension.

.DESCRIPTION
    This script automates the process of packaging and signing the Edge extension.
    It validates the manifest, checks the private key, and creates a new CRX file.

.PARAMETER Version
    Optional. Automatically update the version number in manifest.json before packaging.

.PARAMETER OutputPath
    Optional. Custom output path for the CRX file. Default: bin\RedBanner.crx

.EXAMPLE
    .\create-release.ps1
    Creates a new CRX package with current version

.EXAMPLE
    .\create-release.ps1 -Version "3.2.0"
    Updates version to 3.2.0 and creates new CRX package

.NOTES
    Author: Internet Farm Extension Team
    Requires: Edge or Chrome browser installed
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory=$false)]
    [string]$Version,
    
    [Parameter(Mandatory=$false)]
    [string]$OutputPath = ".\bin\RedBanner.crx"
)

# Script configuration
$ErrorActionPreference = "Stop"
$extensionDir = Split-Path $PSScriptRoot -Parent
$manifestPath = Join-Path $extensionDir "manifest.json"
$pemPath = Join-Path $extensionDir "bin\RedBanner.pem"

# Color output functions
function Write-Success { param($Message) Write-Host "✓ $Message" -ForegroundColor Green }
function Write-Info { param($Message) Write-Host "ℹ $Message" -ForegroundColor Cyan }
function Write-Warning { param($Message) Write-Host "⚠ $Message" -ForegroundColor Yellow }
function Write-Failure { param($Message) Write-Host "✗ $Message" -ForegroundColor Red }

# Header
Write-Host "`n═══════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host "  Internet Farm Extension - Release Packager" -ForegroundColor Magenta
Write-Host "═══════════════════════════════════════════════════`n" -ForegroundColor Magenta

# Step 1: Validate files exist
Write-Info "Validating required files..."

if (-not (Test-Path $manifestPath)) {
    Write-Failure "manifest.json not found at: $manifestPath"
    exit 1
}
Write-Success "Found manifest.json"

if (-not (Test-Path $pemPath)) {
    Write-Failure "Private key (PEM) not found at: $pemPath"
    Write-Warning "The PEM file is required for signing the extension."
    exit 1
}
Write-Success "Found private key (PEM file)"

# Step 2: Read and validate manifest
Write-Info "Reading manifest.json..."
try {
    $manifest = Get-Content $manifestPath -Raw | ConvertFrom-Json
    $currentVersion = $manifest.version
    Write-Success "Current version: $currentVersion"
    
    if (-not $manifest.key) {
        Write-Warning "No public key found in manifest.json"
        Write-Info "Extracting public key from PEM file..."
        
        # Extract public key
        $pemContent = Get-Content $pemPath -Raw
        $base64Key = $pemContent -replace "-----BEGIN PRIVATE KEY-----","" `
                                 -replace "-----END PRIVATE KEY-----","" `
                                 -replace "`n","" -replace "`r","" -replace " ",""
        
        $privateKeyBytes = [System.Convert]::FromBase64String($base64Key)
        $rsa = [System.Security.Cryptography.RSA]::Create()
        $rsa.ImportPkcs8PrivateKey($privateKeyBytes, [ref]$null)
        $publicKeyBytes = $rsa.ExportSubjectPublicKeyInfo()
        $publicKeyBase64 = [System.Convert]::ToBase64String($publicKeyBytes)
        
        # Add key to manifest
        $manifest | Add-Member -NotePropertyName "key" -NotePropertyValue $publicKeyBase64 -Force
        $manifest | ConvertTo-Json -Depth 10 | Set-Content $manifestPath
        Write-Success "Added public key to manifest.json"
    } else {
        Write-Success "Public key present in manifest.json"
    }
} catch {
    Write-Failure "Failed to read manifest.json: $_"
    exit 1
}

# Step 3: Update version if specified
if ($Version) {
    Write-Info "Updating version to $Version..."
    try {
        $manifest.version = $Version
        $manifest | ConvertTo-Json -Depth 10 | Set-Content $manifestPath
        Write-Success "Version updated to $Version"
        $currentVersion = $Version
    } catch {
        Write-Failure "Failed to update version: $_"
        exit 1
    }
}

# Step 4: Find Chrome or Edge executable
Write-Info "Locating Chrome/Edge browser..."

$chromePaths = @(
    "${env:ProgramFiles}\Google\Chrome\Application\chrome.exe",
    "${env:ProgramFiles(x86)}\Google\Chrome\Application\chrome.exe",
    "${env:LocalAppData}\Google\Chrome\Application\chrome.exe",
    "${env:ProgramFiles}\Microsoft\Edge\Application\msedge.exe",
    "${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe"
)

$browserPath = $null
foreach ($path in $chromePaths) {
    if (Test-Path $path) {
        $browserPath = $path
        $browserName = if ($path -match "chrome") { "Chrome" } else { "Edge" }
        Write-Success "Found $browserName at: $path"
        break
    }
}

if (-not $browserPath) {
    Write-Failure "Chrome or Edge not found. Please install one of these browsers."
    Write-Info "Attempted paths:"
    $chromePaths | ForEach-Object { Write-Host "  - $_" -ForegroundColor Gray }
    exit 1
}

# Step 5: Create bin directory if it doesn't exist
$binDir = Join-Path $extensionDir "bin"
if (-not (Test-Path $binDir)) {
    Write-Info "Creating bin directory..."
    New-Item -ItemType Directory -Path $binDir | Out-Null
    Write-Success "Created bin directory"
}

# Step 6: Create clean build directory
Write-Info "Creating clean build directory..."
$buildDir = Join-Path $extensionDir "build_temp"

# Clean up old build directory if it exists
if (Test-Path $buildDir) {
    Remove-Item $buildDir -Recurse -Force
}
New-Item -ItemType Directory -Path $buildDir | Out-Null

# Files to include in the extension package
$filesToInclude = @(
    "manifest.json",
    "background.js",
    "content.js",
    "options.html",
    "options.js",
    "sidepanel.html",
    "icons"
)

# Copy files to build directory
Write-Info "Copying extension files to build directory..."
foreach ($file in $filesToInclude) {
    $sourcePath = Join-Path $extensionDir $file
    if (Test-Path $sourcePath) {
        if ((Get-Item $sourcePath) -is [System.IO.DirectoryInfo]) {
            Copy-Item $sourcePath -Destination $buildDir -Recurse -Force
        } else {
            Copy-Item $sourcePath -Destination $buildDir -Force
        }
        Write-Host "  ✓ $file" -ForegroundColor Gray
    } else {
        Write-Warning "File not found: $file"
    }
}
Write-Success "Build directory prepared"

# Step 7: Package the extension
Write-Info "Packaging extension..."
Write-Host "  Build dir: $buildDir" -ForegroundColor Gray
Write-Host "  Key: $pemPath" -ForegroundColor Gray

try {
    # Clean up old CRX files
    $tempCrx = Join-Path $extensionDir "build_temp.crx"
    if (Test-Path $tempCrx) {
        Remove-Item $tempCrx -Force
    }
    
    # Run Chrome/Edge to pack the extension
    $packArgs = @(
        "--pack-extension=`"$buildDir`"",
        "--pack-extension-key=`"$pemPath`""
    )
    
    Write-Info "Running packager..."
    $process = Start-Process -FilePath $browserPath -ArgumentList $packArgs -Wait -PassThru -NoNewWindow
    
    if ($process.ExitCode -ne 0) {
        Write-Warning "Packager returned exit code: $($process.ExitCode)"
    }
    
    # Wait a moment for file to be written
    Start-Sleep -Milliseconds 1000
    
    # Check if CRX was created
    if (Test-Path $tempCrx) {
        # Move to output location
        Move-Item $tempCrx $OutputPath -Force
        Write-Success "Extension packaged successfully"
    } else {
        Write-Failure "CRX file was not created."
        Write-Info "Trying alternative packaging method..."
        
        # Alternative: Manual CRX creation would go here
        # For now, we'll just report the error
        Write-Failure "Please try packaging manually in Edge: edge://extensions/ -> Pack extension"
        
        # Clean up build directory
        Remove-Item $buildDir -Recurse -Force
        exit 1
    }
    
    # Clean up build directory
    Write-Info "Cleaning up build directory..."
    Remove-Item $buildDir -Recurse -Force
    Write-Success "Build directory cleaned"
    
} catch {
    Write-Failure "Packaging error: $_"
    if (Test-Path $buildDir) {
        Remove-Item $buildDir -Recurse -Force
    }
    exit 1
}

# Step 8: Verify the output
Write-Info "Verifying package..."
if (Test-Path $OutputPath) {
    $crxInfo = Get-Item $OutputPath
    Write-Success "CRX created: $OutputPath"
    Write-Host "  Size: $([math]::Round($crxInfo.Length / 1KB, 2)) KB" -ForegroundColor Gray
    Write-Host "  Modified: $($crxInfo.LastWriteTime)" -ForegroundColor Gray
} else {
    Write-Failure "Output file not found: $OutputPath"
    exit 1
}

# Step 9: Calculate Extension ID (for reference)
Write-Info "Calculating Extension ID..."
try {
    $pemContent = Get-Content $pemPath -Raw
    $base64Key = $pemContent -replace "-----BEGIN PRIVATE KEY-----","" `
                             -replace "-----END PRIVATE KEY-----","" `
                             -replace "`n","" -replace "`r","" -replace " ",""
    
    $privateKeyBytes = [System.Convert]::FromBase64String($base64Key)
    $rsa = [System.Security.Cryptography.RSA]::Create()
    $rsa.ImportPkcs8PrivateKey($privateKeyBytes, [ref]$null)
    $publicKeyBytes = $rsa.ExportSubjectPublicKeyInfo()
    
    # Calculate SHA256 hash and convert to extension ID format
    $sha256 = [System.Security.Cryptography.SHA256]::Create()
    $hash = $sha256.ComputeHash($publicKeyBytes)
    
    # Take first 16 bytes and convert to base32-like ID (a-p)
    $idChars = for ($i = 0; $i -lt 16; $i++) {
        [char](97 + ($hash[$i] % 16))  # a-p (97-112 in ASCII)
    }
    $extensionId = -join $idChars
    
    Write-Success "Extension ID: $extensionId"
    Write-Host "  (Verify this matches in edge://extensions/)" -ForegroundColor Gray
    
} catch {
    Write-Warning "Could not calculate Extension ID: $_"
}

# Summary
Write-Host "`n═══════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host "  Release Package Created Successfully!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host "`nVersion: " -NoNewline -ForegroundColor Cyan
Write-Host $currentVersion -ForegroundColor Yellow
Write-Host "Output:  " -NoNewline -ForegroundColor Cyan
Write-Host $OutputPath -ForegroundColor Yellow

Write-Host "`nNext Steps:" -ForegroundColor Cyan
Write-Host "  1. Test the CRX in Edge (drag onto edge://extensions/)" -ForegroundColor White
Write-Host "  2. Deploy to network share or distribution location" -ForegroundColor White
Write-Host "  3. Update deployment documentation with new version" -ForegroundColor White

Write-Host "`nDeployment Paths:" -ForegroundColor Cyan
Write-Host "  - Network Share: \\server\share\EdgeExtensions\InternetFarm\" -ForegroundColor Gray
Write-Host "  - Group Policy: See DEPLOYMENT.md for configuration" -ForegroundColor Gray

Write-Host ""
