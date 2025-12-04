# Release Guide - Creating and Signing New CRX Packages

## Overview

This guide explains how to create a new signed CRX package for the Internet Farm extension after making changes to the code.

---

## Prerequisites

- **Private Key (PEM file)**: `bin\RedBanner.pem` - Keep this secure and never distribute it
- **Chrome/Edge**: Installed on your development machine
- **PowerShell**: Version 5.1 or higher

---

## Quick Release Process

### Using the Automated PowerShell Script

```powershell
# Run the release script
.\create-release.ps1
```

This script will:
1. ✅ Validate that the public key in manifest.json matches your PEM file
2. ✅ Package the extension into a new CRX file
3. ✅ Sign it with your private key
4. ✅ Save it to `bin\RedBanner.crx`
5. ✅ Display the Extension ID for verification

---

## Manual Release Process

### Step 1: Update Version Number

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

### Step 2: Test Your Changes

1. Load the unpacked extension in Edge:
   - Navigate to `edge://extensions/`
   - Enable **Developer mode**
   - Click **Load unpacked**
   - Select your extension folder
   - Test all functionality

2. Verify the extension works correctly

### Step 3: Package and Sign the Extension

#### Option A: Using Chrome/Edge (Recommended)

**In Edge:**
```
1. Go to edge://extensions/
2. Enable Developer mode
3. Click "Pack extension"
4. Extension root directory: Browse to your extension folder
5. Private key file: Browse to bin\RedBanner.pem
6. Click "Pack Extension"
```

Edge will create:
- `RedBanner.crx` - The packaged extension
- Save this to your `bin` folder

#### Option B: Using PowerShell Script (Automated)

Run the included script:
```powershell
.\create-release.ps1
```

#### Option C: Using Chrome Command Line

```powershell
# Set paths
$chromePath = "C:\Program Files\Google\Chrome\Application\chrome.exe"
$extensionDir = "C:\Users\janti\OneDrive\Develop\Edge\RedBanner"
$pemFile = "C:\Users\janti\OneDrive\Develop\Edge\RedBanner\bin\RedBanner.pem"
$outputCrx = "C:\Users\janti\OneDrive\Develop\Edge\RedBanner\bin\RedBanner.crx"

# Package the extension
& $chromePath --pack-extension="$extensionDir" --pack-extension-key="$pemFile"

# Move the CRX to bin folder
Move-Item "RedBanner.crx" "$outputCrx" -Force
```

### Step 4: Verify the Package

1. Check that `bin\RedBanner.crx` was created
2. Verify file size is reasonable (should be a few KB)
3. Test install the CRX in a clean Edge profile:
   ```
   - Drag and drop RedBanner.crx onto edge://extensions/
   - Verify it installs without errors
   - Test functionality
   ```

---

## Deployment Checklist

Before deploying to production:

- [ ] Version number updated in `manifest.json`
- [ ] All changes tested in unpacked mode
- [ ] CRX file created and signed with `bin\RedBanner.pem`
- [ ] CRX tested in clean browser profile
- [ ] Extension ID matches previous releases (check with `extract-public-key.ps1`)
- [ ] Release notes documented
- [ ] CRX file copied to deployment location (network share, etc.)

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

## Updating the Deployment

After creating a new CRX:

### Option 1: Group Policy Deployment

1. Copy new CRX to network share:
   ```powershell
   Copy-Item "bin\RedBanner.crx" "\\server\share\EdgeExtensions\InternetFarm\" -Force
   ```

2. Update version in update manifest if using auto-updates

### Option 2: Manual Distribution

1. Distribute new CRX file to administrators
2. Install via drag-and-drop or Group Policy
3. Old version will be automatically updated

### Option 3: Development/Testing

1. Remove old version from Edge
2. Install new CRX by dragging onto `edge://extensions/`

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

```powershell
# Extract/verify public key
.\extract-public-key.ps1

# Create new release
.\create-release.ps1

# Test in Edge
start msedge --load-extension="C:\Users\janti\OneDrive\Develop\Edge\RedBanner"

# Check Edge extensions
start msedge edge://extensions/
```
