# Terminal Server Configuration Guide

## Problem: Multiple Published Edge Apps Sharing Configuration

When running multiple published Edge apps on a terminal server (e.g., "Red Edge", "Blue Edge", "Green Edge"), you need **separate banner configurations** for each app.

## Solution: Edge Profile Isolation

✅ **Good News**: `chrome.storage.local` is **automatically isolated per Edge profile**!

Each Edge profile (`--profile-directory`) gets its own storage, so:
- `--profile-directory="InternetFarm-Red"` → Has its own `bannerSettings`
- `--profile-directory="InternetFarm-Blue"` → Has its own `bannerSettings`
- `--profile-directory="Default"` → Has its own `bannerSettings`

---

## Recommended Setup for Terminal Server

### 1. Create Launcher Scripts for Each Published App

#### Red Edge Launcher (`launch-red-edge.bat`)
```batch
@echo off
REM Launch Red Edge with dedicated profile
start msedge.exe ^
  --profile-directory="InternetFarm-Red" ^
  --load-extension="C:\ProgramData\EdgeExtensions\InternetFarm" ^
  --no-first-run ^
  --app=https://yourapp.com
```

#### Blue Edge Launcher (`launch-blue-edge.bat`)
```batch
@echo off
REM Launch Blue Edge with dedicated profile
start msedge.exe ^
  --profile-directory="InternetFarm-Blue" ^
  --load-extension="C:\ProgramData\EdgeExtensions\InternetFarm" ^
  --no-first-run ^
  --app=https://yourapp.com
```

#### Green Edge Launcher (`launch-green-edge.bat`)
```batch
@echo off
REM Launch Green Edge with dedicated profile
start msedge.exe ^
  --profile-directory="InternetFarm-Green" ^
  --load-extension="C:\ProgramData\EdgeExtensions\InternetFarm" ^
  --no-first-run ^
  --app=https://yourapp.com
```

---

### 2. Configure Each Profile's Banner

**First Launch of Each App:**

1. **Launch Red Edge** → Right-click extension → Options
   - Set Primary Color: Red (#ff0000)
   - Set Banner Text: "PRODUCTION - RED"
   - Save Settings

2. **Launch Blue Edge** → Right-click extension → Options
   - Set Primary Color: Blue (#0066ff)
   - Set Banner Text: "TESTING - BLUE"
   - Save Settings

3. **Launch Green Edge** → Right-click extension → Options
   - Set Primary Color: Green (#00cc00)
   - Set Banner Text: "DEVELOPMENT - GREEN"
   - Save Settings

**Each configuration is saved to its own profile and will persist!**

---

### 3. Pre-Configure Settings (Advanced)

To deploy pre-configured settings for each profile, you can set the storage values directly:

#### PowerShell Script: Pre-Configure Red Profile
```powershell
# Define settings for RED Edge
$redSettings = @{
    visible = $true
    primaryColor = "#ff0000"
    secondaryColor = "#cc0000"
    position = "top"
    bannerText = "PRODUCTION - RED"
    logoData = $null
    selectedTemplate = "Red Alert"
} | ConvertTo-Json

# Set in registry or use Edge APIs
# Note: This requires additional manifest permissions for enterprise deployment
```

---

## Testing Configuration Isolation

### Test 1: Verify Separate Profiles
```powershell
# Launch Red Edge
Start-Process msedge.exe -ArgumentList "--profile-directory=InternetFarm-Red", "--load-extension=C:\ProgramData\EdgeExtensions\InternetFarm"

# Launch Blue Edge  
Start-Process msedge.exe -ArgumentList "--profile-directory=InternetFarm-Blue", "--load-extension=C:\ProgramData\EdgeExtensions\InternetFarm"
```

Configure Red Edge → Should NOT affect Blue Edge ✓

### Test 2: Check Profile Storage Locations
Each profile stores data here:
```
%LOCALAPPDATA%\Microsoft\Edge\User Data\InternetFarm-Red\
%LOCALAPPDATA%\Microsoft\Edge\User Data\InternetFarm-Blue\
%LOCALAPPDATA%\Microsoft\Edge\User Data\InternetFarm-Green\
```

Storage is **completely isolated** between profiles.

---

## Alternative: Environment Variable Override (Optional)

If you need additional control beyond profiles, you can use environment variables in your launcher scripts:

```batch
@echo off
REM Set custom environment variable before launching
set EDGE_BANNER_CONFIG=RED-PRODUCTION
start msedge.exe --profile-directory="InternetFarm-Red" --load-extension="C:\ProgramData\EdgeExtensions\InternetFarm"
```

*(This would require code changes to read environment variables - not currently implemented)*

---

## Summary

✅ **No Code Changes Required!**

The extension already supports multiple configurations through Edge's **profile isolation**:

1. Use different `--profile-directory` for each published app
2. Configure each profile's banner separately via Options page
3. Settings are automatically isolated per profile

**Each published Edge app = Different profile = Different configuration** 🎉

---

## Quick Reference Table

| Published App Name | Profile Directory | Banner Color | Banner Text |
|-------------------|-------------------|--------------|-------------|
| Internet Farm Red | `InternetFarm-Red` | Red #ff0000 | PRODUCTION - RED |
| Internet Farm Blue | `InternetFarm-Blue` | Blue #0066ff | TESTING - BLUE |
| Internet Farm Green | `InternetFarm-Green` | Green #00cc00 | DEVELOPMENT - GREEN |
| Standard Edge | `Default` | (No extension) | - |

