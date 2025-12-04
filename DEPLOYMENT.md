# Enterprise Deployment Guide - Internet Farm Extension

## Overview

**Version 3.1.0** includes advanced customization features:
- ✨ 10 pre-built color templates
- ✨ Configuration UI (options page)
- ✨ Multiple banner positions (top, bottom, left, right)
- ✨ Visibility toggle
- ✨ Custom logo support
- ✨ Custom text and colors
- ✨ Profile-isolated storage for multi-app scenarios

### Initial Configuration

After deployment, users (or administrators) can configure the banner:
1. Right-click extension icon → **Options**
2. Choose color template and position
3. Customize text and upload logo (optional)
4. Save settings (automatically per-profile)

---

## Option 1: Group Policy Deployment (Recommended for Enterprise)

### Step 1: Prepare the Extension
1. Keep your extension folder on a network share: `\\server\share\EdgeExtensions\InternetFarm\`
2. Ensure all users have READ access to this location

### Step 2: Deploy via Group Policy
1. Open **Group Policy Management Console**
2. Create/Edit a GPO
3. Navigate to:
   - **Computer Configuration** → **Administrative Templates** → **Microsoft Edge** → **Extensions**
4. Configure these policies:

#### Force Install Extension:
- Policy: **Configure extension management settings**
- Settings:
```json
{
  "extension_id": {
    "installation_mode": "force_installed",
    "update_url": "file://\\\\server\\share\\EdgeExtensions\\InternetFarm\\updates.xml"
  }
}
```

OR use:
- Policy: **Configure the list of force-installed extensions**
- Add: Extension ID + local path

### Step 3: Registry-Based Deployment (Alternative)
Deploy via registry key:

**Registry Path:**
```
HKLM\Software\Policies\Microsoft\Edge\ExtensionInstallForcelist
```

**Value:**
```
1 = "extension_id;file://\\server\share\EdgeExtensions\InternetFarm"
```

---

## Option 2: Self-Signed Certificate Deployment

### Requirements:
- Code signing certificate (from your enterprise CA or third-party)
- Users trust your certificate authority

### Steps:

#### 1. Create a CRX package (signed extension)
Edge doesn't easily support custom CRX signing anymore. Microsoft recommends:

#### 2. Use Edge Add-ons Store (Private)
- Upload to **Microsoft Edge Add-ons** as a private/unlisted extension
- Configure Group Policy to force-install from the store

---

## Option 3: Network Share + Manual Load (Development/Testing)

### Setup:
1. **Share the extension folder:**
   ```
   \\server\share\EdgeExtensions\InternetFarm\
   ```

2. **Create installation script** (PowerShell):
   ```powershell
   # Copy extension to local machine
   $localPath = "$env:ProgramData\EdgeExtensions\InternetFarm"
   Copy-Item "\\server\share\EdgeExtensions\InternetFarm" -Destination $localPath -Recurse -Force
   
   # Add registry key to force install
   $regPath = "HKLM:\Software\Policies\Microsoft\Edge\ExtensionInstallForcelist"
   New-Item -Path $regPath -Force
   Set-ItemProperty -Path $regPath -Name "1" -Value "$localPath"
   ```

3. **Deploy via login script or SCCM**

---

## Pre-Configuration for Different Environments

### Scenario: Deploy Different Settings Per Published App

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

**Extension not loading:**
- Check file permissions (users need READ access)
- Verify Group Policy is applied: `gpresult /r`
- Check Edge logs: `edge://policy/`

**Registry not working:**
- Ensure using HKLM (machine-wide) not HKCU
- Restart Edge browser
- Check: `edge://extensions/` → Developer mode → Check loaded extensions

---

## Security Considerations

✓ Extensions from file shares are trusted by default  
✓ No certificate signing required for internal deployment  
✓ Use Group Policy for centralized management  
✓ Restrict file share permissions to prevent tampering  
