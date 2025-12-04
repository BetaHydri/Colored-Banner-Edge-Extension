// Color templates
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

// Default settings
const defaultSettings = {
  visible: true,
  primaryColor: '#ff0000',
  secondaryColor: '#cc0000',
  position: 'top',
  bannerText: 'Internet Farm',
  logoData: null,
  selectedTemplate: 'Red Alert'
};

// DOM elements
const visibilityToggle = document.getElementById('visibilityToggle');
const visibilityLabel = document.getElementById('visibilityLabel');
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

let currentSettings = { ...defaultSettings };

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  await loadSettings();
  renderTemplates();
  setupEventListeners();
  updatePreview();
});

// Load settings from storage
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

// Apply loaded settings to UI
function applySettingsToUI() {
  // Visibility toggle
  visibilityToggle.classList.toggle('active', currentSettings.visible);
  visibilityLabel.textContent = currentSettings.visible ? 'Banner Visible' : 'Banner Hidden';
  
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

// Render color templates
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

// Select a template
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

// Setup event listeners
function setupEventListeners() {
  // Visibility toggle
  visibilityToggle.addEventListener('click', () => {
    currentSettings.visible = !currentSettings.visible;
    visibilityToggle.classList.toggle('active');
    visibilityLabel.textContent = currentSettings.visible ? 'Banner Visible' : 'Banner Hidden';
    updatePreview();
  });
  
  // Color inputs
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

// Handle logo upload
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

// Update preview
function updatePreview() {
  if (!currentSettings.visible) {
    previewBanner.style.opacity = '0.3';
    previewBanner.innerHTML = '<span style="font-style: italic;">Banner is currently hidden</span>';
    return;
  }
  
  previewBanner.style.opacity = '1';
  previewBanner.style.background = `linear-gradient(90deg, ${currentSettings.primaryColor} 0%, ${currentSettings.secondaryColor} 100%)`;
  
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

// Save settings
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

// Reset settings
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

// Show toast notification
function showToast(message, isError = false) {
  toast.textContent = message;
  toast.style.background = isError ? '#f44336' : '#4CAF50';
  toast.classList.add('show');
  
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}
