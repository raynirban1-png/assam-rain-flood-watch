/**
 * --- 1. THE RISK ALGORITHM ---
 * This class takes rainfall and river discharge data to calculate a risk level.
 */
class RiskCalculator {
  constructor() {
    // Adjustable thresholds based on Assam's geographical needs
    this.rainThreshold = 100; // 100mm of rain in 24h as a baseline for severe impact
    this.dischargeThreshold = 5000; // Example CWC danger level discharge (cumecs)
  }

  /**
   * Calculates a weighted risk score.
   * @param {number} rain24h - Forecasted rain in the next 24 hours (mm).
   * @param {number} riverDischarge - Current river discharge metrics.
   * @returns {Object} An object containing the status, score, and UI color.
   */
  getRiskStatus(rain24h, riverDischarge) {
    // Calculate weights (50% rain, 50% river level)
    const rainWeight = Math.min((rain24h / this.rainThreshold) * 50, 50);
    const dischargeWeight = Math.min((riverDischarge / this.dischargeThreshold) * 50, 50);
    
    const totalScore = Math.round(rainWeight + dischargeWeight);

    // Determine the color-coded status based on your requirements
    if (totalScore >= 75) {
      return { status: "SEVERE", score: totalScore, color: "#d32f2f" }; // Red
    } else if (totalScore >= 50) {
      return { status: "WARNING", score: totalScore, color: "#f57c00" }; // Orange
    } else if (totalScore >= 25) {
      return { status: "WATCH", score: totalScore, color: "#fbc02d" }; // Yellow
    } else {
      return { status: "NORMAL", score: totalScore, color: "#388e3c" }; // Green
    }
  }
}

/**
 * --- 2. THE LOCALIZATION SYSTEM ---
 * This handles switching the interface between English and Assamese.
 */
class LocalizationManager {
  constructor() {
    this.currentLanguage = 'en'; // Default to English
    
    // Our translation dictionary
    this.dictionary = {
      en: {
        appTitle: "Rain & Flood Watch",
        subtitle: "Brahmaputra basin · Assam · live",
        riskAggregate: "Aggregate risk",
        statusNormal: "NORMAL",
        statusWatch: "WATCH",
        statusWarning: "WARNING",
        statusSevere: "SEVERE",
        officialSources: "Official sources"
      },
      as: {
        appTitle: "বৰষুণ আৰু বানপানী নিৰীক্ষণ", // Rain & Flood Watch
        subtitle: "ব্ৰহ্মপুত্ৰ উপত্যকা · অসম · পোনপটীয়া", // Brahmaputra basin · Assam · live
        riskAggregate: "মুঠ বিপদশংকা", // Aggregate risk
        statusNormal: "স্বাভাৱিক", // NORMAL
        statusWatch: "নিৰীক্ষণ", // WATCH
        statusWarning: "সতৰ্কবাণী", // WARNING
        statusSevere: "ভয়াবহ", // SEVERE
        officialSources: "চৰকাৰী সূত্ৰ" // Official sources
      }
    };
  }

  /**
   * Toggles the current language and returns the new dictionary.
   */
  toggleLanguage() {
    this.currentLanguage = this.currentLanguage === 'en' ? 'as' : 'en';
    return this.dictionary[this.currentLanguage];
  }

  /**
   * Retrieves a specific translated phrase.
   * @param {string} key - The dictionary key you want to translate.
   */
  getText(key) {
    return this.dictionary[this.currentLanguage][key] || key;
  }
}

// Example usage to test our code:
const riskEngine = new RiskCalculator();
console.log("Current Risk:", riskEngine.getRiskStatus(65, 3000)); 
// Output: { status: 'WARNING', score: 62, color: '#f57c00' }

const languageEngine = new LocalizationManager();
console.log("Assamese Title:", languageEngine.getText('appTitle')); 
// Output: Rain & Flood Watch (Default)
languageEngine.toggleLanguage();
console.log("Assamese Title After Toggle:", languageEngine.getText('appTitle'));
// Output: বৰষুণ আৰু বানপানী নিৰীক্ষণ
