# Terminal Server Setup - Multiple Edge Apps

## Scenario: Two Published Edge Apps
1. **"Internet Farm (Red)"** - With red banner extension
2. **"Microsoft Edge (Default)"** - Standard Edge without extension

---

## Method 1: Separate User Profiles (Recommended)

### Setup Steps:

#### 1. Deploy Extension Files
```powershell
# Run as Administrator
.\deploy-registry.ps1
```
This copies extension to: `C:\ProgramData\EdgeExtensions\InternetFarm\`

#### 2. Create RED Edge Launcher
```batch
@echo off
REM Launches Edge with RED branding using dedicated profile
start msedge.exe --profile-directory="InternetFarm-Red" --load-extension="C:\ProgramData\EdgeExtensions\InternetFarm" --no-first-run https://yourapp.com
```
Save as: `C:\ProgramData\EdgeExtensions\launch-red-edge.bat`

#### 3. Create DEFAULT Edge Launcher
```batch
@echo off
REM Launches Edge WITHOUT extension using default profile
start msedge.exe --profile-directory="Default" --no-first-run https://yourapp.com
```
Save as: `C:\ProgramData\EdgeExtensions\launch-default-edge.bat`

#### 4. Publish Both Apps in RemoteApp

**RED Edge App:**
- Name: `Internet Farm (Red)`
- Path: `C:\ProgramData\EdgeExtensions\launch-red-edge.bat`
- Icon: `C:\ProgramData\EdgeExtensions\InternetFarm\icons\icon128.png`

**Default Edge App:**
- Name: `Microsoft Edge`
- Path: `C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe`
- Arguments: `--profile-directory=Default`

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

### Launch RED Edge:
```powershell
.\launch-red-edge.ps1 -Url "https://google.com"
```
✓ Should show red banner at top

### Launch DEFAULT Edge:
```powershell
.\launch-default-edge.ps1 -Url "https://google.com"
```
✓ Should NOT show red banner

---

## Published App Configuration

### RemoteApp Manager Settings:

| Setting | RED Edge | Default Edge |
|---------|----------|--------------|
| **Display Name** | Internet Farm (Red) | Microsoft Edge |
| **Path** | `C:\ProgramData\EdgeExtensions\launch-red-edge.bat` | `C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe` |
| **Arguments** | *(in batch file)* | `--profile-directory=Default` |
| **Icon** | `C:\ProgramData\EdgeExtensions\InternetFarm\icons\icon128.png` | Default Edge icon |
| **User Assignment** | Production Users | All Users |

---

## Key Points

✅ **Different profiles = Different extensions**
- Profile "InternetFarm-Red" → Has extension
- Profile "Default" → No extension

✅ **Users see two separate apps** in RemoteApp
- Click "Internet Farm (Red)" → Red banner appears
- Click "Microsoft Edge" → Standard Edge

✅ **No interference** between apps
- Extensions are profile-specific
- Settings don't overlap

✅ **Easy management**
- Update extension files in `C:\ProgramData\EdgeExtensions\InternetFarm\`
- All RED Edge instances auto-update

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
