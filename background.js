// Background service worker
chrome.runtime.onInstalled.addListener(async (details) => {
  console.log('Banner Extension installed/updated');
  
  // Initialize default settings on first install
  if (details.reason === 'install') {
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
      
      // Open options page on first install
      chrome.runtime.openOptionsPage();
    } catch (error) {
      console.error('Error initializing settings:', error);
    }
  }
});
