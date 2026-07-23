/**
 * THE LOCALIZATION SYSTEM
 * Handles switching the interface between English and Assamese.
 */
class LocalizationManager {
  constructor() {
    this.currentLanguage = 'en'; 
    
    // Translation dictionary targeting your specific UI elements
    this.dictionary = {
      en: {
        appTitle: "Rain & Flood Watch",
        subtitle: "Brahmaputra basin · Assam · live",
        riskAggregate: "Aggregate risk",
        tickNormal: "NORMAL",
        tickWatch: "WATCH",
        tickWarning: "WARNING",
        tickSevere: "SEVERE",
        langBtn: "অসমীয়া" // Button shows the language you can switch TO
      },
      as: {
        appTitle: "বৰষুণ আৰু বানপানী নিৰীক্ষণ", 
        subtitle: "ব্ৰহ্মপুত্ৰ উপত্যকা · অসম · পোনপটীয়া",
        riskAggregate: "মুঠ বিপদশংকা",
        tickNormal: "স্বাভাৱিক",
        tickWatch: "নিৰীক্ষণ",
        tickWarning: "সতৰ্কবাণী",
        tickSevere: "ভয়াবহ",
        langBtn: "English"
      }
    };
  }

  toggleLanguage() {
    this.currentLanguage = this.currentLanguage === 'en' ? 'as' : 'en';
    this.applyTranslations();
  }

  getText(key) {
    return this.dictionary[this.currentLanguage][key] || key;
  }

  applyTranslations() {
    // 1. Update Header
    const titleEl = document.querySelector('.hdr-title');
    if(titleEl) {
      titleEl.innerHTML = `${this.getText('appTitle')}<small>${this.getText('subtitle')}</small>`;
    }

    // 2. Update Gauge Labels
    const aggregateLabel = document.querySelector('.gauge-label-row span:first-child');
    if(aggregateLabel) aggregateLabel.textContent = this.getText('riskAggregate');

    // 3. Update Gauge Ticks (Normal, Watch, Warning, Severe)
    const ticks = document.querySelectorAll('.gauge-tick');
    if(ticks.length === 4) {
      ticks[0].textContent = this.getText('tickNormal');
      ticks[1].textContent = this.getText('tickWatch');
      ticks[2].textContent = this.getText('tickWarning');
      ticks[3].textContent = this.getText('tickSevere');
    }

    // 4. Update the Language Button Text
    const langBtn = document.getElementById('langToggleBtn');
    if(langBtn) {
      langBtn.textContent = this.getText('langBtn');
    }
  }
}

// Initialize the Localization Manager
const langManager = new LocalizationManager();

/**
 * Setup function to inject the language button into your existing header
 */
function setupLanguageUI() {
  // Find the header status row where the refresh button lives
  const statusRow = document.querySelector('.hdr-status-row');
  
  if(statusRow && !document.getElementById('langToggleBtn')) {
    // Create the button
    const langBtn = document.createElement('button');
    langBtn.id = 'langToggleBtn';
    langBtn.className = 'refresh-btn'; // Reusing your existing CSS class for styling
    langBtn.style.marginLeft = '8px';
    langBtn.textContent = langManager.getText('langBtn');
    
    // Add click event to toggle language
    langBtn.addEventListener('click', () => {
      langManager.toggleLanguage();
    });

    // Append it to the header
    statusRow.appendChild(langBtn);
  }
}

// Wait for the DOM to load, then setup the language UI
document.addEventListener('DOMContentLoaded', () => {
  setupLanguageUI();
});
