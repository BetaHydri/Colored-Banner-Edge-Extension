# RedBanner Extension for Microsoft Edge

A lightweight Microsoft Edge extension that displays a prominent red banner at the top of every webpage. Perfect for Terminal Server environments where you need to visually distinguish between different published Edge applications.

![Version](https://img.shields.io/badge/version-3.0.0-red)
![License](https://img.shields.io/badge/license-MIT-blue)
![Edge](https://img.shields.io/badge/Edge-Chromium-blue)

## 🎯 Use Case

Designed for **Terminal Server / RemoteApp environments** where multiple Edge instances are published with different purposes:
- **Production Environment** (Red Banner)
- **Testing Environment** (Blue Banner)
- **Development Environment** (Green Banner)
- **UAT Environment** (Yellow Banner)

Users can instantly identify which browser instance they're using based on the colored banner.

## ✨ Features

- ✅ **Automatic Banner Display** - Appears on all websites without user interaction
- ✅ **Minimal Space Usage** - Only 40px banner at top of page
- ✅ **Highly Visible** - Red gradient with blinking green indicator
- ✅ **Lightweight** - No background processes, minimal resources
- ✅ **Enterprise-Ready** - Deployable via Group Policy, registry, or file share
- ✅ **Profile-Based** - Different Edge profiles can have different configurations

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
   git clone https://github.com/YOUR_USERNAME/RedBanner-Extension.git
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

### Change Banner Color

Edit `content.js` and modify the background color:

```javascript
background: linear-gradient(90deg, #0000ff 0%, #0000cc 100%); // Blue
background: linear-gradient(90deg, #00ff00 0%, #00cc00 100%); // Green
background: linear-gradient(90deg, #ffff00 0%, #cccc00 100%); // Yellow
```

### Change Banner Text

Edit `content.js`:

```javascript
🔵 BLUE BROWSER - TESTING APP
🟢 GREEN BROWSER - DEVELOPMENT
🟡 YELLOW BROWSER - UAT
```

### Change Banner Height

Edit `content.js`:

```javascript
height: 60px; // Larger banner
height: 30px; // Smaller banner
```

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

## 🔧 Configuration Files

### manifest.json

```json
{
  "manifest_version": 3,
  "name": "Internet Farm",
  "version": "3.0.0",
  "description": "Highly visible red banner for terminal server published Edge applications",
  "permissions": ["storage"],
  "content_scripts": [{
    "matches": ["<all_urls>"],
    "js": ["content.js"],
    "run_at": "document_start"
  }]
}
```

### content.js

Injects a fixed-position red banner at the top of every page with:
- Red gradient background
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
- ✅ No certificate signing required for internal deployment

## 🐛 Troubleshooting

### Banner not appearing

1. Check extension is enabled: `edge://extensions/`
2. Verify extension loaded correctly (no errors)
3. Try reloading the webpage (Ctrl+F5)
4. Check browser console for JavaScript errors (F12)

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

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built for Terminal Server environments
- Designed for enterprise deployment scenarios
- Inspired by the need for visual browser differentiation

## 📞 Support

If you encounter any issues or have questions:
- Open an issue on GitHub
- Check existing issues for solutions
- Review the DEPLOYMENT.md and TERMINAL-SERVER-SETUP.md guides

## 🗺️ Roadmap

- [ ] Multi-color template generator
- [ ] Configuration UI for easy customization
- [ ] Additional banner positions (bottom, side)
- [ ] Banner hide/show toggle
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
