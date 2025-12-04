# RedBanner Extension for Microsoft Edge

A highly customizable Microsoft Edge extension that displays a visible banner on every webpage. Perfect for Terminal Server environments where you need to visually distinguish between different published Edge applications with full configuration options.

![Version](https://img.shields.io/badge/version-3.1.0-red)
![License](https://img.shields.io/badge/license-MIT-blue)
![Edge](https://img.shields.io/badge/Edge-Chromium-blue)

## 🎯 Use Case

Designed for **Terminal Server / RemoteApp environments** where multiple Edge instances are published with different purposes:
- **Production Environment** (Red Banner - Top)
- **Testing Environment** (Blue Banner - Bottom)
- **Development Environment** (Green Banner - Left Side)
- **UAT Environment** (Yellow Banner - Right Side)

Users can instantly identify which browser instance they're using based on the customized banner appearance.

## ✨ Features

### Core Features
- ✅ **Automatic Banner Display** - Appears on all websites without user interaction
- ✅ **Customizable Size & Position** - Top, bottom, left, or right side placement
- ✅ **Lightweight** - No background processes, minimal resources
- ✅ **Enterprise-Ready** - Deployable via Group Policy, registry, or file share
- ✅ **Profile-Isolated** - Different Edge profiles maintain separate configurations

### 🎨 NEW: Advanced Customization (v3.1.0)
- ✨ **Multi-Color Templates** - 10 pre-built color schemes (Red, Orange, Yellow, Green, Blue, Purple, Pink, Teal, Navy, Gray)
- ✨ **Configuration UI** - Easy-to-use options page with live preview
- ✨ **Multiple Positions** - Place banner at top, bottom, left side, or right side
- ✨ **Visibility Toggle** - Show/hide banner without losing settings
- ✨ **Custom Logo Support** - Upload your own logo (PNG, JPG, SVG)
- ✨ **Custom Text** - Personalize banner text for each environment
- ✨ **Custom Colors** - Use color picker for unlimited color combinations
- ✨ **Live Preview** - See changes before saving

## 📸 Screenshot

```
┌─────────────────────────────────────────────────────────────┐
│  ● 🔴 RED BROWSER - PRODUCTION APP                         │ ← Red Banner
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Your Website Content Here                                  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 Quick Start

### For Development/Testing

1. **Download or clone this repository**
   ```bash
   git clone https://github.com/BetaHydri/RedBanner-Extension.git
   ```

2. **Open Edge and navigate to** `edge://extensions/`

3. **Enable "Developer mode"** (toggle in bottom-left corner)

4. **Click "Load unpacked"** and select the extension folder

5. **Visit any website** - the red banner appears automatically!

## 📦 Installation Methods

### Method 1: Manual Load (Development)

1. Extract extension files to a folder
2. Go to `edge://extensions/`
3. Enable Developer mode
4. Click "Load unpacked"
5. Select the folder

### Method 2: Registry Deployment (Enterprise)

**Run as Administrator:**

```powershell
.\deploy-registry.ps1
```

This copies the extension to `C:\ProgramData\EdgeExtensions\InternetFarm\` and configures registry for automatic installation.

### Method 3: Group Policy Deployment

1. Copy extension to network share: `\\server\share\EdgeExtensions\RedBanner\`
2. Open Group Policy Management Console
3. Navigate to: **Computer Configuration → Administrative Templates → Microsoft Edge → Extensions**
4. Configure: **"Configure the list of force-installed extensions"**
5. Add the extension path

### Method 4: File Share Deployment

Deploy from network share without local copy:

```powershell
$regPath = "HKLM:\Software\Policies\Microsoft\Edge\ExtensionInstallForcelist"
Set-ItemProperty -Path $regPath -Name "1" -Value "\\server\share\RedBanner"
```

## 🖥️ Terminal Server Setup

### Publishing Multiple Edge Apps with Different Banners

**Scenario:** Publish two Edge apps - one with RED banner, one without.

#### Step 1: Deploy Extension Files

```powershell
# Run as Administrator
.\deploy-published-app.ps1 -AppName "Internet Farm (Red)" -CreateShortcut
```

#### Step 2: Configure Published Apps

**RED Edge App:**
- **Name:** Internet Farm (Red)
- **Path:** `C:\ProgramData\EdgeExtensions\launch-red-edge.bat`
- **Icon:** `C:\ProgramData\EdgeExtensions\InternetFarm\icons\icon128.png`

**Default Edge App:**
- **Name:** Microsoft Edge
- **Path:** `C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe`
- **Arguments:** `--profile-directory=Default`

#### Step 3: Users See Two Apps

- **Click "Internet Farm (Red)"** → Edge opens with red banner
- **Click "Microsoft Edge"** → Edge opens without banner

Each app uses a separate profile, so extensions don't interfere with each other.

## 🎨 Customization

### Easy Configuration UI (Recommended)

1. **Open Options Page**
   - Right-click extension icon → Options
   - Or navigate to `edge://extensions/` → Find extension → Details → Extension options

2. **Choose a Color Template**
   - Select from 10 pre-built templates (Red Alert, Orange Warning, Yellow Caution, etc.)
   - Or create custom colors with color picker

3. **Set Banner Position**
   - Top (default)
   - Bottom
   - Left Side (vertical)
   - Right Side (vertical)

4. **Customize Text**
   - Enter custom banner text (e.g., "PRODUCTION", "TESTING", "DEV")

5. **Upload Logo (Optional)**
   - Click "Upload logo" to add custom branding
   - Recommended size: 40x40px
   - Formats: PNG, JPG, SVG (max 100KB)

6. **Toggle Visibility**
   - Hide/show banner without losing your configuration

7. **Preview & Save**
   - View live preview before saving
## 📁 File Structure

```
RedBanner-Extension/
├── manifest.json                  # Extension configuration
├── content.js                     # Dynamic banner injection script
├── background.js                  # Background service worker & settings init
├── options.html                   # Configuration UI (NEW in v3.1.0)
├── options.js                     # Options page logic (NEW in v3.1.0)
├── sidepanel.html                # Side panel UI (optional)
├── icons/                        # Extension icons
│   ├── icon16.png
│   ├── icon32.png
│   ├── icon48.png
│   └── icon128.png
├── deploy-registry.ps1           # Automated deployment script
├── deploy-published-app.ps1      # Terminal Server setup
├── launch-red-edge.ps1           # Launch with extension
├── launch-default-edge.ps1       # Launch without extension
├── uninstall.ps1                 # Removal script
├── DEPLOYMENT.md                 # Enterprise deployment guide
├── TERMINAL-SERVER-SETUP.md      # Terminal Server configuration
├── MULTI-APP-CONFIGURATION.md    # Multi-app profile setup (NEW)
└── README.md                     # This file
```──────────────────────────────┐
│  ● PRODUCTION - RED           │ ← Banner
├────────────────────────────────┤
│  Website content              │
│                               │
└────────────────────────────────┘
```

**Bottom Position**
```
┌────────────────────────────────┐
│  Website content              │
│                               │
├────────────────────────────────┤
│  ● TESTING - BLUE             │ ← Banner
└────────────────────────────────┘
```

**Left Side Position**
```
┌──┬────────────────────────────┐
│ D│                            │
│ E│  Website content           │
│ V│                            │
│ ●│                            │
└──┴────────────────────────────┘
  ↑ Banner
```

**Right Side Position**
```
┌────────────────────────────┬──┐
│                            │U │
│  Website content           │A │
│                            │T │
│                            │● │
└────────────────────────────┴──┘
                            ↑ Banner
```

### Advanced Customization (Manual)

If you prefer to edit code directly, you can modify `content.js` for programmatic customization. However, the Options UI is recommended for most users.

## 📁 File Structure

```
RedBanner-Extension/
├── manifest.json              # Extension configuration
├── content.js                 # Banner injection script
├── background.js              # Background service worker
├── sidepanel.html            # Side panel UI (optional)
├── icons/                    # Extension icons
│   ├── icon16.png
│   ├── icon32.png
│   ├── icon48.png
│   └── icon128.png
├── deploy-registry.ps1       # Automated deployment script
├── deploy-published-app.ps1  # Terminal Server setup
├── launch-red-edge.ps1       # Launch with extension
├── launch-default-edge.ps1   # Launch without extension
├── uninstall.ps1            # Removal script
├── DEPLOYMENT.md            # Enterprise deployment guide
├── TERMINAL-SERVER-SETUP.md # Terminal Server configuration
└── README.md                # This file
```
### manifest.json

```json
{
  "manifest_version": 3,
  "name": "Internet Farm",
  "version": "3.1.0",
  "description": "Highly customizable banner for terminal server published Edge applications",
  "permissions": ["storage"],
  "options_page": "options.html",
  "content_scripts": [{
    "matches": ["<all_urls>"],
    "js": ["content.js"],
    "run_at": "document_start"
  }]
}
```

### content.js

Dynamically injects a customizable banner with features:
- Multiple color schemes (from user settings)
- Multiple positions (top, bottom, left, right)
- Custom text and logo support
- Visibility toggle
- Auto-adjusts body margin to prevent content overlap
- Real-time settings updates

### options.html & options.js

Provides a user-friendly configuration interface:
- 10 pre-built color templates
- Custom color picker
- Position selector (4 positions)
- Banner text customization
- Logo upload and preview
- Visibility toggle
- Live preview panel
- Save/reset functionality
- Blinking green indicator
- Custom text
- Auto-adjusts body margin to prevent content overlap

## 🛠️ Deployment Scripts

### deploy-registry.ps1
- Copies extension to `C:\ProgramData\EdgeExtensions\InternetFarm\`
- Configures registry for force installation
- Requires Administrator privileges

### deploy-published-app.ps1
- Creates batch launchers for Terminal Server
- Generates desktop shortcuts
- Configures RemoteApp settings

### launch-red-edge.ps1
- Launches Edge with RED banner using dedicated profile
- Useful for testing and RemoteApp publishing

### launch-default-edge.ps1
- Launches Edge WITHOUT banner using default profile
- Standard Edge experience

### uninstall.ps1
- Removes registry entries
- Deletes local extension files
- Clean uninstallation

## 📋 Requirements

- Microsoft Edge (Chromium-based) version 88 or later
- Windows 10/11 or Windows Server 2016+
- For enterprise deployment: Administrator privileges

## 🔒 Security

- ✅ No external network requests
- ✅ No data collection or telemetry
- ✅ Minimal permissions (only "storage")
- ✅ Open source - review the code yourself
### Extension appears in wrong Edge instance

1. Verify using different profiles (`--profile-directory` parameter)
2. Check registry deployment targets correct profile
3. Use separate batch launchers for each app
4. **See MULTI-APP-CONFIGURATION.md for detailed multi-app setup**

### Different published apps share the same banner settings

✅ **This should NOT happen!** Each Edge profile has isolated storage.

**Solution:**
1. Ensure each published app uses a different `--profile-directory`
2. Example: `--profile-directory="InternetFarm-Red"` vs `--profile-directory="InternetFarm-Blue"`
3. Configure each profile separately via the Options page
4. Refer to **MULTI-APP-CONFIGURATION.md** for complete setup guide

### Banner overlaps with website header

1. Change banner position via Options page (try bottom or side positions)
2. Adjust z-index if needed (rare)
3. Some websites with fixed headers may need custom CSS

### Settings not saving

1. Check browser console for errors (F12)
2. Verify storage permissions in manifest.json
3. Try clearing browser cache and reloading extension
4. Check if storage quota is exceeded (unlikely with small settings)
### Extension not auto-installing (Enterprise)

1. Verify file permissions (users need READ access)
2. Check Group Policy applied: `gpresult /r`
3. View applied policies: `edge://policy/`
4. Ensure registry path correct: `HKLM\Software\Policies\Microsoft\Edge\ExtensionInstallForcelist`

### Extension appears in wrong Edge instance

1. Verify using different profiles (`--profile-directory` parameter)
2. Check registry deployment targets correct profile
3. Use separate batch launchers for each app

### Banner overlaps with website header

1. Adjust banner z-index in `content.js`
2. Modify body margin-top value
3. Some websites with fixed headers may need custom CSS

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
## 🗺️ Roadmap

- [x] Multi-color template generator ✅ v3.1.0
- [x] Configuration UI for easy customization ✅ v3.1.0
- [x] Additional banner positions (bottom, side) ✅ v3.1.0
- [x] Banner hide/show toggle ✅ v3.1.0
- [x] Custom logo support ✅ v3.1.0
- [ ] Banner animation options
- [ ] Export/Import configuration
- [ ] Keyboard shortcut to toggle banner
- [ ] Multiple banner profiles per Edge profile

## 📊 Version History

### v3.1.0 (Current - December 2025)
- ✨ **NEW:** Configuration UI with options page
- ✨ **NEW:** 10 pre-built color templates
- ✨ **NEW:** Multiple banner positions (top, bottom, left, right)
- ✨ **NEW:** Visibility toggle
- ✨ **NEW:** Custom logo upload support
- ✨ **NEW:** Custom text and color picker
- ✨ **NEW:** Live preview functionality
- 🔧 Improved: Profile-isolated storage for multi-app scenarios
- 📚 Documentation: Added MULTI-APP-CONFIGURATION.md

### v3.0.0
- Red banner overlay implementation
- Automatic injection on all pages
- Terminal Server deployment scripts
- Enterprise deployment guides

### v2.1.0
- Side panel implementation
- Auto-open on startup

### v2.0.0
- Initial release
- Basic theme switchingtoggle
- [ ] Custom logo support
- [ ] Banner animation options

## 📊 Version History

### v3.0.0 (Current)
- Red banner overlay implementation
- Automatic injection on all pages
- Terminal Server deployment scripts
- Enterprise deployment guides

### v2.1.0
- Side panel implementation
- Auto-open on startup

### v2.0.0
- Initial release
- Basic theme switching

---

**Made with ❤️ for Terminal Server administrators**

**⭐ If this extension helped you, please give it a star!**
