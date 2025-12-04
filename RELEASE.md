# Release Guide - Creating and Signing New CRX Packages

## Overview

This guide explains the complete workflow for creating a new signed CRX package for the Internet Farm extension after making changes to the code.

---

## Prerequisites

- **Private Key (PEM file)**: `bin\RedBanner.pem` - Keep this secure and never distribute it
- **Chrome/Edge**: Installed on your development machine
- **PowerShell**: Version 5.1 or higher
- **Administrator Access**: Required for testing enterprise deployment

---

## Complete Release Workflow

### Step 1: Make Your Code Changes

Edit the extension files as needed:
- `background.js` - Background service worker
- `content.js` - Content script injected into pages
- `options.js` - Options page functionality
- `options.html` - Options page UI
- `manifest.json` - Extension configuration

### Step 2: Update Version Number

Edit `manifest.json` and increment the version:

```json
{
  "version": "3.2.0",  // Increment this
  ...
}
```

**Version Format:**
- **Major.Minor.Patch** (e.g., 3.1.0)
- **Major**: Breaking changes or major new features
- **Minor**: New features, backward compatible
- **Patch**: Bug fixes only

### Step 3: Test Your Changes Locally

1. Load the unpacked extension in Edge:
   ```
   - Navigate to edge://extensions/
   - Enable Developer mode (toggle on left)
   - Click "Load unpacked"
   - Select your extension folder
   ```

2. Test all functionality thoroughly
3. Verify banner appears and behaves correctly
4. Test options page changes

### Step 4: Create Signed CRX Package

#### Using the Automated PowerShell Script (Recommended)

```powershell
# Option A: Create release with current version
.\create-release.ps1

# Option B: Update version and create release in one step
.\create-release.ps1 -Version "3.2.0"

# Option C: Create release with custom output path
.\create-release.ps1 -OutputPath ".\releases\v3.2.0\RedBanner.crx"
```

**What the script does:**
1. ✅ Validates that manifest.json exists and is valid
2. ✅ Verifies the PEM file is present
3. ✅ Checks/adds the public key in manifest.json
4. ✅ Creates a clean build directory (excludes scripts, docs, etc.)
5. ✅ Copies only necessary extension files
6. ✅ Packages and signs the extension with your private key
7. ✅ Saves the signed CRX to `bin\RedBanner.crx`
8. ✅ Calculates and displays the Extension ID for verification
9. ✅ Cleans up temporary build files

**Expected Output:**
```
═══════════════════════════════════════════════════
  Internet Farm Extension - Release Packager
═══════════════════════════════════════════════════

ℹ Validating required files...
✓ Found manifest.json
✓ Found private key (PEM file)
ℹ Reading manifest.json...
✓ Current version: 3.2.0
✓ Public key present in manifest.json
ℹ Locating Chrome/Edge browser...
✓ Found Edge at: C:\Program Files\...\msedge.exe
ℹ Creating clean build directory...
ℹ Copying extension files to build directory...
  ✓ manifest.json
  ✓ background.js
  ✓ content.js
  ✓ options.html
  ✓ options.js
  ✓ sidepanel.html
  ✓ icons
✓ Build directory prepared
ℹ Packaging extension...
✓ Extension packaged successfully
ℹ Cleaning up build directory...
✓ Build directory cleaned
ℹ Verifying package...
✓ CRX created: .\bin\RedBanner.crx
  Size: 15.77 KB
  Modified: 12/04/2025 22:31:42
ℹ Calculating Extension ID...
✓ Extension ID: igldkdacljemlfdp

═══════════════════════════════════════════════════
  Release Package Created Successfully!
═══════════════════════════════════════════════════

Version: 3.2.0
Output:  .\bin\RedBanner.crx
```

### Step 5: Test the Signed CRX

1. **Remove old version** from Edge if installed
2. **Drag and drop** `bin\RedBanner.crx` onto `edge://extensions/`
3. **Accept** the installation prompt
4. **Test functionality** again to ensure packaging didn't break anything

### Step 6: Deploy to Production

Choose the appropriate deployment method for your environment:

#### Option A: Enterprise Deployment (Terminal Server/Group Policy)

**For testing locally:**
```powershell
# Run as Administrator
.\install-no-warning.bat
```

This will:
- Copy CRX to `C:\ProgramData\EdgeExtensions\InternetFarm\`
- Configure registry for force installation
- Eliminate all warning messages

**For production terminal servers:**
1. Copy `bin\RedBanner.crx` to network share
2. Use Group Policy to deploy (see DEPLOYMENT.md)
3. Or use the registry deployment script on each server

#### Option B: Manual Distribution

1. Distribute `bin\RedBanner.crx` to users
2. Users install by dragging to `edge://extensions/`
3. Note: Will show "unknown source" warning unless installed via policy

---

## Quick Release Process Summary

### For a typical release:

```powershell
# 1. Make your code changes
# 2. Update version in manifest.json

# 3. Create signed release
.\create-release.ps1 -Version "3.2.0"

# 4. Test the CRX
# Drag bin\RedBanner.crx to edge://extensions/

# 5. Deploy to production
# Copy to network share or use install-no-warning.bat
```

---

## Manual Release Process

If you prefer not to use the automated script, follow these manual steps:

### Option A: Using Edge Browser UI

1. **Open** `edge://extensions/`
2. **Enable** Developer mode (toggle on left sidebar)
3. **Click** "Pack extension" button
4. **Extension root directory**: Click Browse and select a clean folder containing ONLY:
   - manifest.json
   - background.js
   - content.js
   - options.html
   - options.js
   - sidepanel.html
   - icons/ folder
   
   ⚠️ **Important**: Do NOT include .ps1, .md, .git, or other development files
   
5. **Private key file**: Browse to `bin\RedBanner.pem`
6. **Click** "Pack Extension"
7. Edge creates the CRX file - move it to `bin\RedBanner.crx`

### Option B: Using Chrome/Edge Command Line

```powershell
# Create clean build directory first
$buildDir = ".\build_temp"
New-Item -ItemType Directory -Path $buildDir -Force

# Copy only necessary files
Copy-Item "manifest.json", "background.js", "content.js", "options.html", "options.js", "sidepanel.html" -Destination $buildDir
Copy-Item "icons" -Destination $buildDir -Recurse

# Package with Edge
$edgePath = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
& $edgePath --pack-extension="$buildDir" --pack-extension-key=".\bin\RedBanner.pem"

# Move CRX to bin folder
Move-Item "build_temp.crx" ".\bin\RedBanner.crx" -Force

# Clean up
Remove-Item $buildDir -Recurse -Force
```

### Verify the Package

After creating the CRX:

1. **Check file exists**: `bin\RedBanner.crx`
2. **Verify size**: Should be 15-20 KB typically
3. **Test installation**:
   - Drag `bin\RedBanner.crx` to `edge://extensions/`
   - Verify it installs without errors
   - Test all functionality
   - Check options page works
   - Verify banner appears on websites

---

## Pre-Deployment Checklist

Before deploying to production, verify:

- [ ] **Code changes tested** in unpacked mode (edge://extensions/)
- [ ] **Version number updated** in `manifest.json`
- [ ] **All functionality works**: banner displays, options save, logo uploads, etc.
- [ ] **CRX file created** using `create-release.ps1`
- [ ] **CRX signed** with `bin\RedBanner.pem` (automatic with script)
- [ ] **File size reasonable** (typically 15-20 KB)
- [ ] **CRX tested** in clean Edge profile (drag to edge://extensions/)
- [ ] **Extension ID consistent** - verify it's `igldkdacljemlfdp`
- [ ] **Public key present** in manifest.json
- [ ] **Release notes written** (document what changed)
- [ ] **Deployment location prepared** (network share ready)
- [ ] **Backup created** of previous version

## Post-Release Checklist

After deploying:

- [ ] **Extension installs successfully** on test machine
- [ ] **No errors** in edge://extensions/
- [ ] **Settings preserved** from previous version (if upgrade)
- [ ] **Banner appears** on test websites
- [ ] **Options page** opens and saves correctly
- [ ] **Logo displays** if configured
- [ ] **No console errors** (F12 Developer Tools)
- [ ] **Performance acceptable** (no slowdowns)
- [ ] **Tested on terminal server** (if applicable)
- [ ] **Group Policy deployment works** (if using)
- [ ] **Documentation updated** with new version number

---

## Important Notes

### About the Private Key (PEM file)

- **Keep Secure**: Never commit to Git, never share
- **Backup**: Store securely in multiple locations
- **Required For**: Signing all future updates
- **If Lost**: You'll need to create a new extension with a different Extension ID

### About the Public Key in manifest.json

- **Already Set**: The `"key"` field in manifest.json ensures consistent Extension ID
- **Don't Remove**: Keep this field in all releases
- **Extracted From**: The PEM file (run `.\extract-public-key.ps1` to verify)

### Extension ID

The Extension ID is derived from the public key and should remain constant across all versions:
- Check it with: `.\extract-public-key.ps1`
- Verify in Edge: `edge://extensions/` → Extension Details

---

## Troubleshooting

### "Cannot read private key" error

**Problem**: Edge/Chrome can't read the PEM file

**Solution**:
1. Verify the PEM file exists: `bin\RedBanner.pem`
2. Check file permissions (must be readable)
3. Ensure it's in PKCS#8 format

### "Extension ID changed" after packaging

**Problem**: Extension ID is different from previous release

**Solution**:
1. Ensure `manifest.json` contains the `"key"` field
2. Verify you're using the same PEM file
3. Run `.\extract-public-key.ps1` and confirm the key matches

### CRX file not created

**Problem**: Packaging completes but no CRX file

**Solution**:
1. Check Edge/Chrome output directory (usually same as extension folder)
2. Look for error messages in the packing dialog
3. Try manual command-line packaging

---

## Deployment Methods

After creating a new signed CRX, choose your deployment method:

### Method 1: Enterprise/Terminal Server (No Warnings)

**Using the automated script (recommended):**
```powershell
# Run as Administrator
.\install-no-warning.bat
```

**Or manually via PowerShell (as Administrator):**
```powershell
# Set variables
$extensionId = "bigapindokddagclojiehmhlhfdbp"
$systemPath = "$env:ProgramData\EdgeExtensions\InternetFarm"

# Copy CRX to system location
New-Item -ItemType Directory -Path $systemPath -Force
Copy-Item ".\bin\RedBanner.crx" -Destination "$systemPath\RedBanner.crx" -Force

# Configure registry for force install
New-Item -Path "HKLM:\Software\Policies\Microsoft\Edge\ExtensionInstallForcelist" -Force
Set-ItemProperty -Path "HKLM:\Software\Policies\Microsoft\Edge\ExtensionInstallForcelist" `
  -Name "1" `
  -Value "$extensionId;file:///$($systemPath.Replace('\', '/'))/RedBanner.crx" `
  -Type String

# Restart Edge
Write-Host "Close Edge completely and restart it"
```

**Result:**
- ✅ Extension installs automatically
- ✅ Shows "Installed by policy"
- ✅ NO warning messages
- ✅ Users cannot disable it

### Method 2: Group Policy Network Deployment

1. **Copy CRX to network share:**
   ```powershell
   Copy-Item "bin\RedBanner.crx" "\\server\share\EdgeExtensions\InternetFarm\" -Force
   ```

2. **Configure Group Policy:**
   - Open Group Policy Management Console
   - Navigate to: Computer Configuration → Administrative Templates → Microsoft Edge → Extensions
   - Configure "Configure extension management settings" or "Configure the list of force-installed extensions"
   - Add: `bigapindokddagclojiehmhlhfdbp;file://\\server\share\EdgeExtensions\InternetFarm\RedBanner.crx`

3. **Apply policy:**
   ```powershell
   gpupdate /force
   ```

### Method 3: Manual User Installation (Development/Testing)

**For testing:**
1. Open `edge://extensions/`
2. Enable Developer mode
3. Drag `bin\RedBanner.crx` onto the page
4. Click "Add extension"

**Note:** This method shows "unknown source" warning. Use Method 1 or 2 for production.

### Method 4: Update Existing Deployment

**If already deployed via registry/policy:**
1. Replace the CRX file:
   ```powershell
   Copy-Item "bin\RedBanner.crx" "C:\ProgramData\EdgeExtensions\InternetFarm\RedBanner.crx" -Force
   ```

2. Edge auto-updates the extension (no restart needed)

**If deployed via network share:**
1. Replace CRX on network share
2. Policy refresh updates all clients automatically

---

## Version History

Keep track of releases:

| Version | Date | Changes |
|---------|------|---------|
| 3.1.0 | 2024-12-04 | Added documentation, color templates, multi-position support |
| 3.0.0 | 2024-11-XX | Initial customizable version |

---

## Files Reference

| File | Purpose | Distribute? |
|------|---------|-------------|
| `bin/RedBanner.crx` | Packaged extension | ✅ Yes |
| `bin/RedBanner.pem` | Private key for signing | ❌ Never |
| `manifest.json` | Extension manifest (with public key) | ✅ Yes |
| `create-release.ps1` | Automated packaging script | 📦 Dev only |
| `extract-public-key.ps1` | Verify public key | 📦 Dev only |

---

## Quick Command Reference

### Development Commands

```powershell
# Extract/verify public key from PEM file
.\extract-public-key.ps1

# Create new signed release (basic)
.\create-release.ps1

# Create release and update version
.\create-release.ps1 -Version "3.2.0"

# Test unpacked extension in Edge
start msedge --load-extension="$PWD"

# Open Edge extensions page
start msedge edge://extensions/
```

### Deployment Commands

```powershell
# Install locally without warnings (run as Admin)
.\install-no-warning.bat

# Or manual registry deployment (as Admin)
$id = "bigapindokddagclojiehmhlhfdbp"
$path = "$env:ProgramData\EdgeExtensions\InternetFarm"
New-Item -ItemType Directory -Path $path -Force
Copy-Item "bin\RedBanner.crx" "$path\RedBanner.crx" -Force
New-Item -Path "HKLM:\Software\Policies\Microsoft\Edge\ExtensionInstallForcelist" -Force
Set-ItemProperty -Path "HKLM:\Software\Policies\Microsoft\Edge\ExtensionInstallForcelist" `
  -Name "1" -Value "$id;file:///$($path.Replace('\','/'))/RedBanner.crx" -Type String

# Check registry configuration
Get-ItemProperty "HKLM:\Software\Policies\Microsoft\Edge\ExtensionInstallForcelist"

# Remove policy deployment (uninstall)
Remove-ItemProperty -Path "HKLM:\Software\Policies\Microsoft\Edge\ExtensionInstallForcelist" -Name "1"
```

### Verification Commands

```powershell
# Verify CRX file exists and check size
Get-Item "bin\RedBanner.crx" | Select-Object Name, Length, LastWriteTime

# Check if extension is deployed via registry
Test-Path "HKLM:\Software\Policies\Microsoft\Edge\ExtensionInstallForcelist"

# View current registry deployment
Get-ItemProperty "HKLM:\Software\Policies\Microsoft\Edge\ExtensionInstallForcelist" -ErrorAction SilentlyContinue

# List all files that will be packaged
Get-ChildItem -File | Where-Object { $_.Extension -in '.js','.html','.json' } | Select-Object Name
```

---

## Workflow Summary Diagram

```
┌─────────────────────────────────────────────────────┐
│ 1. DEVELOPMENT                                       │
│    • Edit code (background.js, content.js, etc.)    │
│    • Update manifest.json version                   │
│    • Test with unpacked extension                   │
└─────────────────┬───────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────┐
│ 2. BUILD & SIGN                                      │
│    • Run: .\create-release.ps1                      │
│    • Creates: bin\RedBanner.crx (signed)            │
│    • Verifies: Extension ID matches                 │
└─────────────────┬───────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────┐
│ 3. TEST                                              │
│    • Drag CRX to edge://extensions/                 │
│    • Verify functionality                           │
│    • Test options, banner, logo                     │
└─────────────────┬───────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────┐
│ 4. DEPLOY                                            │
│    A) Enterprise: .\install-no-warning.bat          │
│    B) Terminal Server: Group Policy + Registry      │
│    C) Manual: Drag CRX to edge://extensions/        │
└─────────────────┬───────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────┐
│ 5. VERIFY                                            │
│    • Extension shows "Installed by policy"          │
│    • No warning messages                            │
│    • Banner appears on websites                     │
│    • Options page works                             │
└─────────────────────────────────────────────────────┘
```
