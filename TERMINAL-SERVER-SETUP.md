# Terminal Server Setup - Multiple Edge Apps

## Version 3.1.0 Features

✨ **NEW:** Each published app can have completely different banner configurations:
- Different colors (10 templates + custom)
- Different positions (top, bottom, left, right)
- Different text and logos
- Show/hide individually
- All configured via easy-to-use Options UI

## Scenario: Multiple Published Edge Apps with Different Banners

Examples:
1. **"Production (Red)"** - Red banner at top, "PRODUCTION" text
2. **"Testing (Blue)"** - Blue banner at bottom, "TESTING" text  
3. **"Development (Green)"** - Green banner on left side, "DEV" text
4. **"Microsoft Edge (Default)"** - Standard Edge without extension

**Key Concept:** Each app uses a different `--profile-directory`, and settings are automatically isolated per profile.

---

## Method 1: Separate User Profiles (Recommended)

### Setup Steps:

#### 1. Deploy Extension Files
```powershell
# Run as Administrator
.\deploy-registry.ps1
```
This copies extension to: `C:\ProgramData\EdgeExtensions\InternetFarm\`

#### 2. Create Launcher Scripts for Each App

**RED Production Launcher:**
```batch
@echo off
REM Launches Edge with RED banner (Production)
start msedge.exe --profile-directory="InternetFarm-Red" --load-extension="C:\ProgramData\EdgeExtensions\InternetFarm" --no-first-run https://yourapp.com
```
Save as: `C:\ProgramData\EdgeExtensions\launch-red-edge.bat`

**BLUE Testing Launcher:**
```batch
@echo off
REM Launches Edge with BLUE banner (Testing)
start msedge.exe --profile-directory="InternetFarm-Blue" --load-extension="C:\ProgramData\EdgeExtensions\InternetFarm" --no-first-run https://yourapp.com
```
Save as: `C:\ProgramData\EdgeExtensions\launch-blue-edge.bat`

**GREEN Development Launcher:**
```batch
@echo off
REM Launches Edge with GREEN banner (Development)
start msedge.exe --profile-directory="InternetFarm-Green" --load-extension="C:\ProgramData\EdgeExtensions\InternetFarm" --no-first-run https://yourapp.com
```
Save as: `C:\ProgramData\EdgeExtensions\launch-green-edge.bat`

**DEFAULT Edge Launcher (No Extension):**
```batch
@echo off
REM Launches Edge WITHOUT extension using default profile
start msedge.exe --profile-directory="Default" --no-first-run https://yourapp.com
```
Save as: `C:\ProgramData\EdgeExtensions\launch-default-edge.bat`

#### 3. Configure Each Profile's Banner

**IMPORTANT:** Run this setup once to configure each profile:

1. Launch Red Edge manually:
   ```powershell
   C:\ProgramData\EdgeExtensions\launch-red-edge.bat
   ```
   - Right-click extension icon → **Options**
   - Select **"Red Alert"** template
   - Set text: **"PRODUCTION"**
   - Choose position: **Top**
   - Save settings

2. Launch Blue Edge manually:
   ```powershell
   C:\ProgramData\EdgeExtensions\launch-blue-edge.bat
   ```
   - Right-click extension icon → **Options**
   - Select **"Blue Info"** template
   - Set text: **"TESTING"**
   - Choose position: **Bottom**
   - Save settings

3. Launch Green Edge manually:
   ```powershell
   C:\ProgramData\EdgeExtensions\launch-green-edge.bat
   ```
   - Right-click extension icon → **Options**
   - Select **"Green Safe"** template
   - Set text: **"DEVELOPMENT"**
   - Choose position: **Left Side**
   - Save settings

**Settings persist automatically!** Each profile maintains its own configuration.

#### 4. Publish Apps in RemoteApp

**Production Edge (Red):**
- Name: `Production Browser (Red)`
- Path: `C:\ProgramData\EdgeExtensions\launch-red-edge.bat`
- Icon: `C:\ProgramData\EdgeExtensions\InternetFarm\icons\icon128.png`
- User Assignment: Production users

**Testing Edge (Blue):**
- Name: `Testing Browser (Blue)`
- Path: `C:\ProgramData\EdgeExtensions\launch-blue-edge.bat`
- Icon: `C:\ProgramData\EdgeExtensions\InternetFarm\icons\icon128.png`
- User Assignment: QA/Test users

**Development Edge (Green):**
- Name: `Development Browser (Green)`
- Path: `C:\ProgramData\EdgeExtensions\launch-green-edge.bat`
- Icon: `C:\ProgramData\EdgeExtensions\InternetFarm\icons\icon128.png`
- User Assignment: Developers

**Default Edge (No Extension):**
- Name: `Microsoft Edge`
- Path: `C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe`
- Arguments: `--profile-directory=Default`
- User Assignment: All users

---

## Method 2: Profile-Based Group Policy (Advanced)

### Use Windows Profiles to Target Extensions

#### For RED Edge users:
**Group Policy for Group "InternetFarm-Users":**
```
Computer Configuration → Policies → Administrative Templates → Microsoft Edge → Extensions
→ Configure the list of force-installed extensions
Add: C:\ProgramData\EdgeExtensions\InternetFarm
```

#### For Default Edge users:
**Group Policy for Group "Standard-Users":**
- No extension policy configured
- Standard Edge experience

---

## Method 3: Registry-Based Per-Profile Extension

### Deploy extension only for specific profile:

```powershell
# Force extension ONLY for profile "InternetFarm-Red"
$profilePath = "$env:LOCALAPPDATA\Microsoft\Edge\User Data\InternetFarm-Red"
$regPath = "HKCU:\Software\Microsoft\Edge\Extensions"

# Users in "InternetFarm-Red" profile get extension
# Users in "Default" profile don't
```

---

## Quick Deploy Script

Run the automated deployment:
```powershell
.\deploy-published-app.ps1 -AppName "Internet Farm (Red)" -StartUrl "https://yourapp.com" -CreateShortcut
```

---

## Testing

### Launch Production (Red) Edge:
```powershell
C:\ProgramData\EdgeExtensions\launch-red-edge.bat
```
✓ Should show **red banner at top** with "PRODUCTION"

### Launch Testing (Blue) Edge:
```powershell
C:\ProgramData\EdgeExtensions\launch-blue-edge.bat
```
✓ Should show **blue banner at bottom** with "TESTING"

### Launch Development (Green) Edge:
```powershell
C:\ProgramData\EdgeExtensions\launch-green-edge.bat
```
✓ Should show **green banner on left side** with "DEVELOPMENT"

### Launch Default Edge:
```powershell
C:\ProgramData\EdgeExtensions\launch-default-edge.bat
```
✓ Should **NOT show any banner**

### Verify Configuration Isolation:
1. Open Red Edge → Configure via Options → Change to Yellow
2. Open Blue Edge → Should still be Blue (not affected)
3. Each profile maintains its own settings ✓

---

## Published App Configuration

### RemoteApp Manager Settings:

| Setting | Production (Red) | Testing (Blue) | Development (Green) | Default Edge |
|---------|------------------|----------------|---------------------|-------------|
| **Display Name** | Production Browser (Red) | Testing Browser (Blue) | Development Browser (Green) | Microsoft Edge |
| **Path** | `launch-red-edge.bat` | `launch-blue-edge.bat` | `launch-green-edge.bat` | `msedge.exe` |
| **Profile** | InternetFarm-Red | InternetFarm-Blue | InternetFarm-Green | Default |
| **Banner Color** | Red (#ff0000) | Blue (#0066ff) | Green (#00cc00) | None |
| **Banner Position** | Top | Bottom | Left Side | N/A |
| **Banner Text** | PRODUCTION | TESTING | DEVELOPMENT | N/A |
| **Icon** | icon128.png | icon128.png | icon128.png | Default |
| **User Assignment** | Production Users | QA/Testers | Developers | All Users |

---

## Key Points

✓ **Different profiles = Different configurations**
- Profile "InternetFarm-Red" → Red banner (top)
- Profile "InternetFarm-Blue" → Blue banner (bottom)
- Profile "InternetFarm-Green" → Green banner (left)
- Profile "Default" → No extension

✓ **Users see multiple apps** in RemoteApp
- Click "Production Browser (Red)" → Red banner at top
- Click "Testing Browser (Blue)" → Blue banner at bottom
- Click "Development Browser (Green)" → Green banner on left
- Click "Microsoft Edge" → Standard Edge

✓ **Complete configuration isolation** (NEW in v3.1.0)
- Each profile stores its own settings
- Colors, positions, text, logos all independent
- Visibility toggle per profile
- No interference between apps

✓ **Easy customization**
- Right-click extension → Options → Configure
- 10 color templates available
- Custom colors and logos supported
- Changes take effect immediately

✓ **Centralized management**
- Update extension files in `C:\ProgramData\EdgeExtensions\InternetFarm\`
- All profiles use same extension code
- Only settings differ per profile

---

## Troubleshooting

**Extension appears in both Edge instances:**
- Check that default Edge uses `--profile-directory=Default` 
- Verify RED Edge uses `--load-extension` parameter

**Extension not loading in RED Edge:**
- Verify path: `C:\ProgramData\EdgeExtensions\InternetFarm\`
- Check permissions (users need READ access)
- Test launcher manually before publishing

**Users can't see published app:**
- Verify user/group assignment in RemoteApp
- Check RDS licensing
- Verify batch file executes correctly
