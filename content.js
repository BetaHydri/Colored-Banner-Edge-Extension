/**
 * Content Script for Red Banner Edge Extension
 * 
 * This script is injected into all web pages and manages:
 * - Dynamic banner creation and injection
 * - Banner styling based on user settings
 * - Page margin adjustments to prevent content overlap
 * - Real-time updates when settings change
 * - Support for multiple banner positions (top, bottom, left, right)
 */

// Self-executing function to avoid polluting global namespace
(function() {
  /**
   * Reference to the current banner element in the DOM
   * @type {HTMLElement|null}
   */
  let bannerElement = null;
  
  /**
   * Current banner settings loaded from Chrome storage
   * @type {object|null}
   */
  let settings = null;

  /**
   * Default banner configuration used as fallback
   * @type {object}
   * @property {boolean} visible - Whether banner should be displayed
   * @property {string} primaryColor - Primary gradient color
   * @property {string} secondaryColor - Secondary gradient color
   * @property {string} position - Banner position on page
   * @property {string} bannerText - Text to display in banner
   * @property {string|null} logoData - Base64 encoded logo image
   */
  const defaultSettings = {
    visible: true,
    primaryColor: '#ff0000',
    secondaryColor: '#cc0000',
    position: 'top',
    bannerText: 'Internet Farm',
    logoData: null
  };

  /**
   * Initializes the banner system
   * Loads settings from Chrome storage and creates banner if visible
   * Falls back to default settings if loading fails
   * This is the main entry point called on page load
   * 
   * @async
   * @function init
   * @returns {Promise<void>}
   */
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

  /**
   * Creates and configures the banner DOM element
   * Removes any existing banner before creating a new one
   * Applies styling based on current settings
   * Injects the banner into the page
   * 
   * @function createBanner
   * @returns {void}
   */
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

  /**
   * Generates complete CSS styles for the banner
   * Combines base styles with position-specific styles
   * Handles all four positions: top, bottom, left, right
   * 
   * @function getBannerStyles
   * @returns {object} Object containing style strings for banner elements
   * @returns {string} returns.banner - Complete CSS for banner container
   * @returns {string} returns.logo - CSS for logo image element
   * @returns {string} returns.indicator - CSS for animated status indicator dot
   * @returns {string} returns.text - CSS for banner text
   * @returns {string} returns.animation - CSS keyframe animations
   */
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

  /**
   * Generates CSS to adjust page body margins based on banner position
   * Prevents banner from covering page content
   * Adds appropriate margin (40px) on the side where banner appears
   * 
   * @function getBodyStyles
   * @returns {string} CSS string with body margin adjustment
   */
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

  /**
   * Darkens a hex color by reducing RGB component values
   * Used to create darker borders that complement the banner colors
   * Reduces each RGB component by 40, ensuring values stay >= 0
   * 
   * @function darkenColor
   * @param {string} color - Hex color string (e.g., '#ff0000')
   * @returns {string} Darkened hex color string
   */
  function darkenColor(color) {
    // Simple darkening by reducing RGB values
    const hex = color.replace('#', '');
    const r = Math.max(0, parseInt(hex.substr(0, 2), 16) - 40);
    const g = Math.max(0, parseInt(hex.substr(2, 2), 16) - 40);
    const b = Math.max(0, parseInt(hex.substr(4, 2), 16) - 40);
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }

  /**
   * Injects the banner element into the page DOM
   * Waits for document.body to exist before injecting
   * Retries every 10ms if body is not yet available
   * Inserts banner as first child of body to ensure visibility
   * 
   * @function inject
   * @returns {void}
   */
  function inject() {
    if (document.body) {
      document.body.insertBefore(bannerElement, document.body.firstChild);
    } else {
      setTimeout(inject, 10);
    }
  }

  /**
   * Listens for changes to banner settings in Chrome storage
   * Automatically updates or removes banner when settings change
   * Handles visibility toggle by adding/removing banner
   * Resets body margin when banner is hidden
   * 
   * @function
   * @param {object} changes - Object with changed storage keys
   * @param {object} changes.bannerSettings - Updated banner settings
   * @param {object} changes.bannerSettings.newValue - New settings value
   * @param {string} areaName - Storage area name ('local', 'sync', etc.)
   * @returns {void}
   */
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
