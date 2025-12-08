/**
 * Options Page Controller for Red Banner Edge Extension
 * 
 * This file manages the user interface for configuring banner settings including:
 * - Color templates and custom colors
 * - Banner position (top, bottom, left, right)
 * - Banner text customization
 * - Logo upload and management
 * - Visibility toggle
 * - Live preview of changes
 */

/**
 * Predefined color templates for quick banner styling
 * Each template provides primary and secondary colors for gradient backgrounds
 * 
 * @type {Array<{name: string, primary: string, secondary: string}>}
 */
const colorTemplates = [
  { name: 'Red Alert', primary: '#ff0000', secondary: '#cc0000' },
  { name: 'Orange Warning', primary: '#ff6600', secondary: '#cc5200' },
  { name: 'Yellow Caution', primary: '#ffd700', secondary: '#ccac00' },
  { name: 'Green Safe', primary: '#00cc00', secondary: '#009900' },
  { name: 'Blue Info', primary: '#0066ff', secondary: '#0052cc' },
  { name: 'Purple Production', primary: '#9933ff', secondary: '#7a29cc' },
  { name: 'Pink Test', primary: '#ff1493', secondary: '#cc1076' },
  { name: 'Teal Dev', primary: '#00cccc', secondary: '#00a3a3' },
  { name: 'Navy Corporate', primary: '#003366', secondary: '#002952' },
  { name: 'Gray Neutral', primary: '#666666', secondary: '#4d4d4d' }
];

/**
 * Default banner settings used for initialization and reset functionality
 * 
 * @type {object}
 * @property {boolean} visible - Whether the banner is visible on pages
 * @property {string} primaryColor - Primary gradient color in hex format
 * @property {string} secondaryColor - Secondary gradient color in hex format
 * @property {string} position - Banner position ('top', 'bottom', 'left', 'right')
 * @property {string} bannerText - Text displayed in the banner
 * @property {string|null} logoData - Base64 encoded logo image data
 * @property {string} selectedTemplate - Name of the selected color template
 * @property {boolean} animationEnabled - Whether color animation is active
 * @property {string} animationSpeed - Animation speed ('slow', 'medium', 'fast')
 */
const defaultSettings = {
  visible: true,
  primaryColor: '#ff0000',
  secondaryColor: '#cc0000',
  position: 'top',
  bannerText: 'Internet Farm',
  logoData: null,
  selectedTemplate: 'Red Alert',
  animationEnabled: false,
  animationSpeed: 'medium'
};

// DOM elements
const visibilityToggle = document.getElementById('visibilityToggle');
const visibilityLabel = document.getElementById('visibilityLabel');
const animationToggle = document.getElementById('animationToggle');
const animationLabel = document.getElementById('animationLabel');
const animationSpeedSelect = document.getElementById('animationSpeed');
const templatesContainer = document.getElementById('templates');
const primaryColorInput = document.getElementById('primaryColor');
const secondaryColorInput = document.getElementById('secondaryColor');
const positionSelect = document.getElementById('position');
const bannerTextInput = document.getElementById('bannerText');
const logoInput = document.getElementById('logoInput');
const logoPreview = document.getElementById('logoPreview');
const logoImage = document.getElementById('logoImage');
const clearLogoBtn = document.getElementById('clearLogo');
const previewBanner = document.getElementById('previewBanner');
const previewText = document.getElementById('previewText');
const previewLogo = document.getElementById('previewLogo');
const saveBtn = document.getElementById('saveBtn');
const resetBtn = document.getElementById('resetBtn');
const toast = document.getElementById('toast');

/**
 * Current banner settings being edited
 * Initialized as a copy of defaultSettings to avoid mutation
 * 
 * @type {object}
 */
let currentSettings = { ...defaultSettings };

/**
 * Initialize the options page when DOM is ready
 * Loads saved settings, renders template options, sets up event listeners, and shows preview
 * 
 * @async
 * @returns {Promise<void>}
 */
document.addEventListener('DOMContentLoaded', async () => {
  await loadSettings();
  renderTemplates();
  setupEventListeners();
  updatePreview();
});

/**
 * Loads banner settings from Chrome local storage
 * Merges loaded settings with defaults to ensure all properties exist
 * Falls back to default settings if loading fails
 * 
 * @async
 * @function loadSettings
 * @returns {Promise<void>}
 * @throws Will log error to console if storage access fails
 */
async function loadSettings() {
  try {
    const result = await chrome.storage.local.get('bannerSettings');
    if (result.bannerSettings) {
      currentSettings = { ...defaultSettings, ...result.bannerSettings };
    }
    applySettingsToUI();
  } catch (error) {
    console.error('Error loading settings:', error);
  }
}

/**
 * Applies the current settings to all UI form elements
 * Updates toggles, input values, selects, and preview elements to reflect loaded settings
 * 
 * @function applySettingsToUI
 * @returns {void}
 */
function applySettingsToUI() {
  // Visibility toggle
  visibilityToggle.classList.toggle('active', currentSettings.visible);
  visibilityLabel.textContent = currentSettings.visible ? 'Banner Visible' : 'Banner Hidden';
  
  // Animation toggle
  animationToggle.classList.toggle('active', currentSettings.animationEnabled);
  animationLabel.textContent = currentSettings.animationEnabled ? 'Animation Enabled' : 'Animation Disabled';
  animationSpeedSelect.value = currentSettings.animationSpeed || 'medium';
  
  // Colors
  primaryColorInput.value = currentSettings.primaryColor;
  secondaryColorInput.value = currentSettings.secondaryColor;
  
  // Position
  positionSelect.value = currentSettings.position;
  
  // Text
  bannerTextInput.value = currentSettings.bannerText;
  
  // Logo
  if (currentSettings.logoData) {
    logoImage.src = currentSettings.logoData;
    logoPreview.style.display = 'block';
  } else {
    logoPreview.style.display = 'none';
  }
}

/**
 * Renders all color template cards in the UI
 * Creates clickable gradient cards for each predefined template
 * Marks the currently selected template with 'selected' class
 * 
 * @function renderTemplates
 * @returns {void}
 */
function renderTemplates() {
  templatesContainer.innerHTML = '';
  colorTemplates.forEach(template => {
    const card = document.createElement('div');
    card.className = 'template-card';
    card.style.background = `linear-gradient(135deg, ${template.primary} 0%, ${template.secondary} 100%)`;
    card.style.color = 'white';
    card.textContent = template.name;
    
    if (currentSettings.selectedTemplate === template.name) {
      card.classList.add('selected');
    }
    
    card.addEventListener('click', () => {
      selectTemplate(template);
    });
    
    templatesContainer.appendChild(card);
  });
}

/**
 * Selects a color template and applies its colors to current settings
 * Updates both the settings object and UI inputs
 * Clears previous selection and marks new template as selected
 * 
 * @function selectTemplate
 * @param {object} template - The template object to select
 * @param {string} template.name - Display name of the template
 * @param {string} template.primary - Primary hex color value
 * @param {string} template.secondary - Secondary hex color value
 * @returns {void}
 */
function selectTemplate(template) {
  currentSettings.selectedTemplate = template.name;
  currentSettings.primaryColor = template.primary;
  currentSettings.secondaryColor = template.secondary;
  
  primaryColorInput.value = template.primary;
  secondaryColorInput.value = template.secondary;
  
  // Update selected state
  document.querySelectorAll('.template-card').forEach(card => {
    card.classList.remove('selected');
    if (card.textContent === template.name) {
      card.classList.add('selected');
    }
  });
  
  updatePreview();
}

/**
 * Sets up all event listeners for interactive UI elements
 * Handles:
 * - Visibility toggle clicks
 * - Animation toggle clicks
 * - Animation speed changes
 * - Color picker changes (switches to 'Custom' template)
 * - Position dropdown changes
 * - Banner text input
 * - Logo file upload
 * - Logo removal
 * - Save and reset buttons
 * 
 * @function setupEventListeners
 * @returns {void}
 */
function setupEventListeners() {
  // Visibility toggle
  visibilityToggle.addEventListener('click', () => {
    currentSettings.visible = !currentSettings.visible;
    visibilityToggle.classList.toggle('active');
    visibilityLabel.textContent = currentSettings.visible ? 'Banner Visible' : 'Banner Hidden';
    updatePreview();
  });
  
  // Animation toggle
  animationToggle.addEventListener('click', () => {
    currentSettings.animationEnabled = !currentSettings.animationEnabled;
    animationToggle.classList.toggle('active');
    animationLabel.textContent = currentSettings.animationEnabled ? 'Animation Enabled' : 'Animation Disabled';
    updatePreview();
  });
  
  // Animation speed
  animationSpeedSelect.addEventListener('change', (e) => {
    currentSettings.animationSpeed = e.target.value;
    updatePreview();
  });
  
  // Color inputs - switching to custom template when colors are manually changed
  primaryColorInput.addEventListener('input', (e) => {
    currentSettings.primaryColor = e.target.value;
    currentSettings.selectedTemplate = 'Custom';
    document.querySelectorAll('.template-card').forEach(card => card.classList.remove('selected'));
    updatePreview();
  });
  
  secondaryColorInput.addEventListener('input', (e) => {
    currentSettings.secondaryColor = e.target.value;
    currentSettings.selectedTemplate = 'Custom';
    document.querySelectorAll('.template-card').forEach(card => card.classList.remove('selected'));
    updatePreview();
  });
  
  // Position
  positionSelect.addEventListener('change', (e) => {
    currentSettings.position = e.target.value;
    updatePreview();
  });
  
  // Banner text
  bannerTextInput.addEventListener('input', (e) => {
    currentSettings.bannerText = e.target.value || 'Internet Farm';
    updatePreview();
  });
  
  // Logo upload
  logoInput.addEventListener('change', handleLogoUpload);
  
  // Clear logo
  clearLogoBtn.addEventListener('click', () => {
    currentSettings.logoData = null;
    logoPreview.style.display = 'none';
    logoInput.value = '';
    updatePreview();
  });
  
  // Save button
  saveBtn.addEventListener('click', saveSettings);
  
  // Reset button
  resetBtn.addEventListener('click', resetSettings);
}

/**
 * Handles logo file upload with validation and conversion
 * Validates file size (max 100KB) before processing
 * Converts image to base64 data URL for storage
 * Updates preview with uploaded image
 * 
 * @function handleLogoUpload
 * @param {Event} e - File input change event
 * @param {FileList} e.target.files - Selected file(s) from input
 * @returns {void}
 */
function handleLogoUpload(e) {
  const file = e.target.files[0];
  if (!file) return;
  
  // Check file size (max 100KB)
  if (file.size > 100 * 1024) {
    alert('Logo file is too large. Please use an image under 100KB.');
    logoInput.value = '';
    return;
  }
  
  const reader = new FileReader();
  reader.onload = (event) => {
    currentSettings.logoData = event.target.result;
    logoImage.src = event.target.result;
    logoPreview.style.display = 'block';
    updatePreview();
  };
  reader.readAsDataURL(file);
}

/**
 * Updates the live preview banner to reflect current settings
 * Shows how the banner will appear on web pages
 * Displays grayed out message if banner is hidden
 * Includes position hint in preview text
 * 
 * @function updatePreview
 * @returns {void}
 */
function updatePreview() {
  if (!currentSettings.visible) {
    previewBanner.style.opacity = '0.3';
    previewBanner.innerHTML = '<span style="font-style: italic;">Banner is currently hidden</span>';
    return;
  }
  
  previewBanner.style.opacity = '1';
  
  // Apply animation if enabled
  if (currentSettings.animationEnabled) {
    const speeds = {
      slow: '10s',
      medium: '5s',
      fast: '3s'
    };
    const duration = speeds[currentSettings.animationSpeed] || '5s';
    
    previewBanner.style.background = `linear-gradient(90deg, ${currentSettings.primaryColor}, ${currentSettings.secondaryColor}, ${currentSettings.primaryColor})`;
    previewBanner.style.backgroundSize = '200% 100%';
    previewBanner.style.animation = `gradientCycle ${duration} ease infinite`;
  } else {
    previewBanner.style.background = `linear-gradient(90deg, ${currentSettings.primaryColor} 0%, ${currentSettings.secondaryColor} 100%)`;
    previewBanner.style.backgroundSize = 'auto';
    previewBanner.style.animation = 'none';
  }
  
  // Update logo
  if (currentSettings.logoData) {
    previewLogo.src = currentSettings.logoData;
    previewLogo.style.display = 'block';
  } else {
    previewLogo.style.display = 'none';
  }
  
  // Update text
  previewText.textContent = currentSettings.bannerText;
  
  // Position indicator (just visual hint in preview)
  const positionHints = {
    top: '(appears at top of page)',
    bottom: '(appears at bottom of page)',
    left: '(appears on left side)',
    right: '(appears on right side)'
  };
  
  previewText.textContent = `${currentSettings.bannerText} ${positionHints[currentSettings.position]}`;
}

/**
 * Saves current settings to Chrome storage and applies them to all tabs
 * Reloads all open tabs to apply the new banner settings
 * Shows success/error toast notification based on result
 * Ignores reload errors for restricted pages (chrome://, etc.)
 * 
 * @async
 * @function saveSettings
 * @returns {Promise<void>}
 * @throws Will show error toast if save operation fails
 */
async function saveSettings() {
  try {
    await chrome.storage.local.set({ bannerSettings: currentSettings });
    
    // Reload all tabs to apply changes
    const tabs = await chrome.tabs.query({});
    for (const tab of tabs) {
      try {
        await chrome.tabs.reload(tab.id);
      } catch (error) {
        // Ignore errors for tabs that can't be reloaded (chrome:// pages, etc.)
      }
    }
    
    showToast('Settings saved successfully!');
  } catch (error) {
    console.error('Error saving settings:', error);
    showToast('Error saving settings', true);
  }
}

/**
 * Resets all settings to factory defaults with user confirmation
 * Prompts user for confirmation before resetting
 * Updates UI, saves to storage, and shows confirmation toast
 * 
 * @async
 * @function resetSettings
 * @returns {Promise<void>}
 * @throws Will log error to console if reset operation fails
 */
async function resetSettings() {
  if (!confirm('Are you sure you want to reset all settings to default?')) {
    return;
  }
  
  currentSettings = { ...defaultSettings };
  applySettingsToUI();
  renderTemplates();
  updatePreview();
  
  try {
    await chrome.storage.local.set({ bannerSettings: currentSettings });
    showToast('Settings reset to default');
  } catch (error) {
    console.error('Error resetting settings:', error);
  }
}

/**
 * Displays a toast notification message to the user
 * Toast automatically disappears after 3 seconds
 * Supports success (green) and error (red) styling
 * 
 * @function showToast
 * @param {string} message - Message text to display in the toast
 * @param {boolean} [isError=false] - Whether this is an error message (changes background color)
 * @returns {void}
 */
function showToast(message, isError = false) {
  toast.textContent = message;
  toast.style.background = isError ? '#f44336' : '#4CAF50';
  toast.classList.add('show');
  
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}
