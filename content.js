// Dynamic banner injection with customizable settings
(function() {
  let bannerElement = null;
  let settings = null;

  // Default settings
  const defaultSettings = {
    visible: true,
    primaryColor: '#ff0000',
    secondaryColor: '#cc0000',
    position: 'top',
    bannerText: 'Internet Farm',
    logoData: null
  };

  // Load settings and create banner
  async function init() {
    try {
      const result = await chrome.storage.local.get('bannerSettings');
      settings = result.bannerSettings || defaultSettings;
      
      if (settings.visible) {
        createBanner();
      }
    } catch (error) {
      console.error('Error loading banner settings:', error);
      settings = defaultSettings;
      createBanner();
    }
  }

  // Create banner element
  function createBanner() {
    if (bannerElement) {
      bannerElement.remove();
    }

    const banner = document.createElement('div');
    banner.id = 'custom-edge-banner';
    
    const styles = getBannerStyles();
    const bodyStyles = getBodyStyles();
    
    banner.innerHTML = `
      <div style="${styles.banner}">
        ${settings.logoData ? `<img src="${settings.logoData}" style="${styles.logo}" alt="Logo">` : ''}
        <span style="${styles.indicator}"></span>
        <span style="${styles.text}">${settings.bannerText}</span>
      </div>
      <style>
        ${styles.animation}
        ${bodyStyles}
      </style>
    `;
    
    bannerElement = banner;
    inject();
  }

  // Get banner styles based on position
  function getBannerStyles() {
    const baseStyles = {
      common: `
        position: fixed;
        background: linear-gradient(90deg, ${settings.primaryColor} 0%, ${settings.secondaryColor} 100%);
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
        font-size: 16px;
        font-weight: 700;
        z-index: 2147483647;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        letter-spacing: 2px;
        text-transform: uppercase;
      `,
      logo: `
        max-height: 30px;
        max-width: 40px;
        margin-right: 12px;
        object-fit: contain;
      `,
      indicator: `
        display: inline-block;
        width: 12px;
        height: 12px;
        background: #00ff00;
        border-radius: 50%;
        margin-right: 12px;
        animation: blink 1.5s ease-in-out infinite;
        box-shadow: 0 0 10px #00ff00;
      `,
      text: `
        display: inline-block;
      `,
      animation: `
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `
    };

    let positionStyles;
    switch (settings.position) {
      case 'top':
        positionStyles = `
          top: 0;
          left: 0;
          right: 0;
          height: 40px;
          border-bottom: 3px solid ${darkenColor(settings.secondaryColor)};
        `;
        break;
      case 'bottom':
        positionStyles = `
          bottom: 0;
          left: 0;
          right: 0;
          height: 40px;
          border-top: 3px solid ${darkenColor(settings.secondaryColor)};
        `;
        break;
      case 'left':
        positionStyles = `
          top: 0;
          left: 0;
          bottom: 0;
          width: 40px;
          flex-direction: column;
          writing-mode: vertical-rl;
          border-right: 3px solid ${darkenColor(settings.secondaryColor)};
          font-size: 14px;
          padding: 10px 0;
        `;
        break;
      case 'right':
        positionStyles = `
          top: 0;
          right: 0;
          bottom: 0;
          width: 40px;
          flex-direction: column;
          writing-mode: vertical-rl;
          border-left: 3px solid ${darkenColor(settings.secondaryColor)};
          font-size: 14px;
          padding: 10px 0;
        `;
        break;
      default:
        positionStyles = `
          top: 0;
          left: 0;
          right: 0;
          height: 40px;
          border-bottom: 3px solid ${darkenColor(settings.secondaryColor)};
        `;
    }

    return {
      banner: baseStyles.common + positionStyles,
      logo: baseStyles.logo,
      indicator: baseStyles.indicator,
      text: baseStyles.text,
      animation: baseStyles.animation
    };
  }

  // Get body margin styles based on banner position
  function getBodyStyles() {
    switch (settings.position) {
      case 'top':
        return 'body { margin-top: 40px !important; }';
      case 'bottom':
        return 'body { margin-bottom: 40px !important; }';
      case 'left':
        return 'body { margin-left: 40px !important; }';
      case 'right':
        return 'body { margin-right: 40px !important; }';
      default:
        return 'body { margin-top: 40px !important; }';
    }
  }

  // Darken color for borders
  function darkenColor(color) {
    // Simple darkening by reducing RGB values
    const hex = color.replace('#', '');
    const r = Math.max(0, parseInt(hex.substr(0, 2), 16) - 40);
    const g = Math.max(0, parseInt(hex.substr(2, 2), 16) - 40);
    const b = Math.max(0, parseInt(hex.substr(4, 2), 16) - 40);
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }

  // Wait for body to exist and inject
  function inject() {
    if (document.body) {
      document.body.insertBefore(bannerElement, document.body.firstChild);
    } else {
      setTimeout(inject, 10);
    }
  }

  // Listen for settings changes
  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === 'local' && changes.bannerSettings) {
      settings = changes.bannerSettings.newValue || defaultSettings;
      
      if (settings.visible) {
        createBanner();
      } else if (bannerElement) {
        bannerElement.remove();
        bannerElement = null;
        // Reset body margin
        const style = document.createElement('style');
        style.textContent = 'body { margin: 0 !important; }';
        document.head.appendChild(style);
      }
    }
  });

  // Initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
