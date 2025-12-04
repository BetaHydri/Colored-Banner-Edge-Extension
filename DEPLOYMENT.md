# Enterprise Deployment Guide - Internet Farm Extension

## Overview

This guide covers deploying the Internet Farm extension to **domain-joined terminal servers** using Group Policy. This is the recommended approach for enterprise environments.

**Current Version:** 3.1.0

**Key Features:**
- ✨ 10 pre-built color templates
- ✨ Configuration UI (options page)
- ✨ Multiple banner positions (top, bottom, left, right)
- ✨ Visibility toggle
- ✨ Custom logo support
- ✨ Custom text and colors
- ✨ Profile-isolated storage for multi-app scenarios

---

## Prerequisites

### For Initial Deployment:
- ✅ Domain-joined terminal servers (Windows Server)
- ✅ Group Policy Management Console access
- ✅ Network file share accessible by all servers
- ✅ Signed CRX file (`bin\RedBanner.crx`)
- ✅ Extension ID: Get from manifest or first install

### For Updates:
- ✅ New signed CRX file (created with `create-release.ps1`)
- ✅ Access to network share
- ✅ Version number incremented in manifest.json

---

## Initial Deployment (First Time Setup)

### Step 1: Prepare Network Share

1. **Create network share structure:**
   ```
   \\your-server\EdgeExtensions\
   └── InternetFarm\
       └── RedBanner.crx
   ```

2. **Copy the signed CRX to network share:**
   ```powershell
   # From your development machine
   Copy-Item ".\bin\RedBanner.crx" "\\your-server\EdgeExtensions\InternetFarm\" -Force
   ```

3. **Set permissions:**
   - **Domain Computers**: Read access
   - **Domain Users**: Read access
   - **IT Admins**: Full control

### Step 2: Get Extension ID

First, load the extension on a test machine to get the Extension ID:

1. **On a test machine**, open Edge and go to `edge://extensions/`
2. Enable **Developer mode**
3. Drag `RedBanner.crx` onto the page
4. Click **Details** on the installed extension
5. **Copy the Extension ID** (looks like: `abcdefghijklmnopqrstuvwxyz`)
6. Keep this ID for the Group Policy configuration

### Step 3: Configure Group Policy

#### Method A: Using Group Policy Management Console (GUI)

1. **Open Group Policy Management Console** (`gpmc.msc`)

2. **Navigate to your Terminal Servers OU:**
   - Right-click → **Create a GPO** → Name it "Edge - Internet Farm Extension"

3. **Edit the GPO:**
   - Right-click → **Edit**

4. **Navigate to:**
   ```
   Computer Configuration
   └── Policies
       └── Administrative Templates
           └── Microsoft Edge
               └── Extensions
   ```

5. **Configure "Configure the list of force-installed extensions":**
   - **Enable** the policy
   - Click **Show...**
   - Add a new entry with format:
     ```
     YOUR_EXTENSION_ID;file:///\\your-server\EdgeExtensions\InternetFarm\RedBanner.crx
     ```
   - Example:
     ```
     abcdefghijklmnopqrstuvwxyz;file:///\\your-server\EdgeExtensions\InternetFarm\RedBanner.crx
     ```
   - Click **OK**

6. **Link the GPO** to your Terminal Servers OU

7. **Test on one server first:**
   ```powershell
   gpupdate /force
   # Close all Edge windows
   # Restart Edge
   # Extension should install automatically
   ```

#### Method B: Using Registry (Direct Configuration)

If you prefer registry configuration or for testing:

```powershell
# Run on terminal server as Administrator
$extensionId = "YOUR_EXTENSION_ID_HERE"
$crxPath = "\\your-server\EdgeExtensions\InternetFarm\RedBanner.crx"

# Create registry path
$regPath = "HKLM:\Software\Policies\Microsoft\Edge\ExtensionInstallForcelist"
New-Item -Path $regPath -Force | Out-Null

# Set the extension to force install
$regValue = "${extensionId};file:///${crxPath}"
Set-ItemProperty -Path $regPath -Name "1" -Value $regValue -Type String

Write-Host "Extension configured. Restart Edge to apply."
```

### Step 4: Verify Deployment

1. **On a terminal server**, check Group Policy:
   ```powershell
   # Verify policy is applied
   gpresult /r
   
   # Check Edge policies
   # Open Edge → edge://policy/
   ```

2. **Launch Edge** and go to `edge://extensions/`
   - Extension should appear as **"Installed by policy"**
   - Toggle should be ON and grayed out (users can't disable it)
   - **No warning messages** should appear

3. **Test functionality:**
   - Banner appears on websites
   - Right-click extension icon → Options works
   - Settings can be customized

---

## Deploying Updates (New Versions)

When you release a new version of the extension:

### Step 1: Create New Signed CRX

On your development machine:

```powershell
# Update version in manifest.json first (e.g., 3.1.0 → 3.2.0)

# Create new signed CRX
.\create-release.ps1 -Version "3.2.0"

# Verify the CRX was created
Get-Item ".\bin\RedBanner.crx"
```

### Step 2: Replace CRX on Network Share

```powershell
# Backup old version (optional but recommended)
Copy-Item "\\your-server\EdgeExtensions\InternetFarm\RedBanner.crx" `
          "\\your-server\EdgeExtensions\InternetFarm\RedBanner_v3.1.0_backup.crx"

# Deploy new version
Copy-Item ".\bin\RedBanner.crx" `
          "\\your-server\EdgeExtensions\InternetFarm\RedBanner.crx" -Force

Write-Host "New version deployed to network share"
```

### Step 3: Extension Auto-Updates

**Important:** Edge automatically updates extensions. No Group Policy changes needed!

- Edge checks for updates periodically (typically every few hours)
- Next time users restart Edge, the new version installs automatically
- User settings are preserved during updates

**To force immediate update on a terminal server:**
```powershell
# Close all Edge processes
Get-Process msedge -ErrorAction SilentlyContinue | Stop-Process -Force

# Restart Edge - extension updates automatically
Start-Process msedge
```

### Step 4: Verify Update Rollout

1. **Check version on terminal servers:**
   - Go to `edge://extensions/`
   - Click **Details** on Internet Farm extension
   - Verify version number matches new release

2. **Test new features** to ensure update was successful

3. **Monitor for issues** - keep backup CRX for quick rollback if needed

---

## Rolling Back to Previous Version

If the new version has issues:

```powershell
# Restore backup version
Copy-Item "\\your-server\EdgeExtensions\InternetFarm\RedBanner_v3.1.0_backup.crx" `
          "\\your-server\EdgeExtensions\InternetFarm\RedBanner.crx" -Force

# Force extension reload on servers
# Users need to restart Edge for rollback to apply
```

---

## Pre-Configuration for Different Environments

### Scenario: Multiple Published Apps (Production/Testing/Dev)

For Terminal Server with multiple published Edge apps (Production/Testing/Dev), each app should use a different profile with pre-configured settings.

**See:** `MULTI-APP-CONFIGURATION.md` for complete setup guide.

### Quick Pre-Configuration Steps:

1. **Launch each profile manually once:**
   ```powershell
   # Production (Red)
   msedge.exe --profile-directory="InternetFarm-Red" --load-extension="C:\ProgramData\EdgeExtensions\InternetFarm"
   
   # Testing (Blue)
   msedge.exe --profile-directory="InternetFarm-Blue" --load-extension="C:\ProgramData\EdgeExtensions\InternetFarm"
   
   # Development (Green)
   msedge.exe --profile-directory="InternetFarm-Green" --load-extension="C:\ProgramData\EdgeExtensions\InternetFarm"
   ```

2. **Configure each profile via Options page:**
   - Red Profile: Red Alert template, "PRODUCTION"
   - Blue Profile: Blue Info template, "TESTING"
   - Green Profile: Green Safe template, "DEVELOPMENT"

3. **Settings are stored per-profile automatically**
   - Located in: `%LOCALAPPDATA%\Microsoft\Edge\User Data\[ProfileName]\`
   - Persists across sessions
   - Isolated between profiles

### Available Customization Options:

| Feature | Options |
|---------|--------|
| **Color Templates** | Red Alert, Orange Warning, Yellow Caution, Green Safe, Blue Info, Purple Production, Pink Test, Teal Dev, Navy Corporate, Gray Neutral |
| **Banner Position** | Top, Bottom, Left Side, Right Side |
| **Custom Text** | Any text (e.g., "PRODUCTION", "TEST", "DEV") |
| **Logo** | Upload PNG/JPG/SVG (max 100KB) |
| **Visibility** | Show/Hide toggle |
| **Custom Colors** | Full color picker for unlimited combinations |

---

## Option 4: Microsoft Edge Add-ons Store (Best for Production)

### Steps:
1. **Create Microsoft Partner Center account**
2. **Upload your extension** to Edge Add-ons
3. **Mark as "Private"** (only users with link can install)
4. **Deploy via Group Policy:**
   ```
   HKLM\Software\Policies\Microsoft\Edge\ExtensionInstallForcelist
   1 = "extension_id_from_store"
   ```

---

## Recommended Approach for Terminal Server:

### Using ExtensionInstallForcelist Registry

**PowerShell deployment script:**
```powershell
# Copy extension to terminal server
$extensionPath = "C:\ProgramData\EdgeExtensions\InternetFarm"
Copy-Item "\\server\share\InternetFarm" -Destination $extensionPath -Recurse -Force

# Force install for all users
$regPath = "HKLM:\Software\Policies\Microsoft\Edge\ExtensionInstallForcelist"
if (!(Test-Path $regPath)) {
    New-Item -Path $regPath -Force | Out-Null
}
Set-ItemProperty -Path $regPath -Name "1" -Value $extensionPath
```

Users will see the extension automatically installed when they launch Edge.

---

## Update Management

### For file share deployment:
1. Update files on network share
2. Extension auto-updates when Edge restarts

### For Add-ons Store:
1. Upload new version to store
2. Edge auto-updates within 5 hours

---

## Troubleshooting

### Extension Not Installing

**Check Group Policy status:**
```powershell
# Verify policy is applied
gpresult /r | Select-String -Pattern "Edge"

# Force policy update
gpupdate /force
```

**Check Edge policy status:**
1. Open Edge
2. Go to `edge://policy/`
3. Search for "ExtensionInstallForcelist"
4. Verify your extension ID is listed

**Common issues:**
- **Path format**: Must use `file:///` (three slashes) with forward slashes
- **Extension ID wrong**: Must match exactly from first install
- **Permissions**: Terminal servers need READ access to network share
- **Firewall**: Check SMB ports are open (445)

### Extension Shows "Corrupted" or Won't Load

**Solution:**
```powershell
# Re-create the CRX with proper signing
.\create-release.ps1

# Replace on network share
Copy-Item ".\bin\RedBanner.crx" "\\your-server\EdgeExtensions\InternetFarm\" -Force
```

### Extension Shows Warning Despite Policy

**Possible causes:**
- Server is not domain-joined (check with `systeminfo`)
- Policy not applied (run `gpupdate /force`)
- Wrong extension ID in policy

**Verify:**
```powershell
# Check if domain-joined
(Get-WmiObject Win32_ComputerSystem).PartOfDomain

# Check policy registry
Get-ItemProperty "HKLM:\Software\Policies\Microsoft\Edge\ExtensionInstallForcelist" -ErrorAction SilentlyContinue
```

### Updates Not Applying

**Force update:**
```powershell
# Stop Edge completely
Get-Process msedge -ErrorAction SilentlyContinue | Stop-Process -Force

# Clear Edge cache (optional, preserves settings)
Remove-Item "$env:LOCALAPPDATA\Microsoft\Edge\User Data\Default\Extensions\*" -Recurse -Force -ErrorAction SilentlyContinue

# Restart Edge
Start-Process msedge
```

### User Settings Reset After Update

This shouldn't happen - settings are stored separately from the extension code.

**If it does happen:**
- Settings are in: `%LOCALAPPDATA%\Microsoft\Edge\User Data\[Profile]\Local Extension Settings\[ExtensionID]`
- Check if profile path changed
- Verify extension ID remained the same

---

## Best Practices

### ✅ DO:
- **Use Group Policy** for domain-joined terminal servers
- **Test updates** on one server before full deployment
- **Backup old CRX** before deploying updates
- **Document extension ID** in deployment notes
- **Set READ permissions** on network share
- **Monitor edge://policy/** on terminal servers

### ❌ DON'T:
- Don't use local registry on unmanaged PCs (won't work)
- Don't change extension ID between versions
- Don't forget to update version number in manifest.json
- Don't deploy without testing first
- Don't remove the "key" field from manifest.json

---

## Quick Reference Commands

### Create New Release:
```powershell
.\create-release.ps1 -Version "3.2.0"
```

### Deploy to Network Share:
```powershell
Copy-Item ".\bin\RedBanner.crx" "\\your-server\EdgeExtensions\InternetFarm\" -Force
```

### Verify Deployment:
```powershell
# Check policy on terminal server
gpresult /r

# Check in Edge
# Go to: edge://policy/ and edge://extensions/
```

### Force Extension Update:
```powershell
Get-Process msedge -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Process msedge
```

---

## Support Information

### File Locations:

| Item | Location |
|------|----------|
| Extension CRX | `\\your-server\EdgeExtensions\InternetFarm\RedBanner.crx` |
| Group Policy | Computer Configuration → Edge → Extensions |
| Registry (if used) | `HKLM:\Software\Policies\Microsoft\Edge\ExtensionInstallForcelist` |
| User Settings | `%LOCALAPPDATA%\Microsoft\Edge\User Data\[Profile]\Local Extension Settings\` |
| Edge Policies | `edge://policy/` |
| Extensions Page | `edge://extensions/` |

### Version History Template:

| Version | Date | Changes | Deployed By |
|---------|------|---------|-------------|
| 3.1.0 | 2024-12-04 | Initial release with templates | IT Admin |
| 3.2.0 | TBD | [Your changes here] | |

---

## Additional Configuration

See these documents for advanced scenarios:
- **MULTI-APP-CONFIGURATION.md** - Different settings per published app
- **TERMINAL-SERVER-SETUP.md** - Terminal server specific setup
- **RELEASE.md** - Creating new versions and releases  
