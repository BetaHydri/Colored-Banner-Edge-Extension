/**
 * Background Service Worker for Red Banner Edge Extension
 * 
 * This service worker handles:
 * - Extension installation and initialization
 * - Setting up default configuration on first install
 * - Opening the options page for new users
 * - Future background tasks (currently minimal)
 */

/**
 * Event listener for extension installation and updates
 * 
 * Triggered when:
 * - Extension is first installed (details.reason === 'install')
 * - Extension is updated to a new version (details.reason === 'update')
 * - Chrome is updated (details.reason === 'chrome_update')
 * 
 * On first install:
 * 1. Creates default banner settings
 * 2. Saves settings to Chrome local storage
 * 3. Opens the options page for user configuration
 * 
 * @async
 * @function
 * @param {object} details - Installation details object
 * @param {string} details.reason - Reason for installation ('install', 'update', 'chrome_update', etc.)
 * @param {object} [details.previousVersion] - Previous extension version (only for 'update')
 * @returns {Promise<void>}
 */
chrome.runtime.onInstalled.addListener(async (details) => {
  console.log('Banner Extension installed/updated');
  
  // Initialize default settings on first install
  if (details.reason === 'install') {
    /**
     * Default configuration for the banner extension
     * Applied only on first installation
     * 
     * @type {object}
     * @property {boolean} visible - Banner visibility (true by default)
     * @property {string} primaryColor - Primary gradient color (Red Alert theme)
     * @property {string} secondaryColor - Secondary gradient color (Red Alert theme)
     * @property {string} position - Banner position ('top', 'bottom', 'left', 'right')
     * @property {string} bannerText - Default text shown in banner
     * @property {string|null} logoData - Base64 logo data (null = no logo)
     * @property {string} selectedTemplate - Name of the default color template
     */
    const defaultSettings = {
      visible: true,
      primaryColor: '#ff0000',
      secondaryColor: '#cc0000',
      position: 'top',
      bannerText: 'Internet Farm',
      logoData: null,
      selectedTemplate: 'Red Alert'
    };
    
    try {
      await chrome.storage.local.set({ bannerSettings: defaultSettings });
      console.log('Default banner settings initialized');
      
      // Open options page on first install to guide user
      chrome.runtime.openOptionsPage();
    } catch (error) {
      console.error('Error initializing settings:', error);
    }
  }
});
