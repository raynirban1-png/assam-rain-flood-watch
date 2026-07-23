/**
 * --- 1. LOCALIZATION SYSTEM (Expanded for Dynamic Risk) ---
 */
class LocalizationManager {
  constructor() {
    this.currentLanguage = 'en'; 
    
    this.dictionary = {
      en: {
        appTitle: "Rain & Flood Watch",
        subtitle: "Brahmaputra basin · Assam · live",
        riskAggregate: "Aggregate risk",
        tickNormal: "NORMAL",
        tickWatch: "WATCH",
        tickWarning: "WARNING",
        tickSevere: "SEVERE",
        langBtn: "অসমীয়া",
        // Dynamic Risk Descriptions
        riskSevere: "Act now: dangerous flooding conditions may develop quickly.",
        riskWarning: "Prepare: flooding is possible as rain and river conditions worsen.",
        riskWatch: "Watch closely: local flooding or a later river rise is possible.",
        riskNormal: "Currently low risk: no strong flood signal is visible."
      },
      as: {
        appTitle: "বৰষুণ আৰু বানপানী নিৰীক্ষণ", 
        subtitle: "ব্ৰহ্মপুত্ৰ উপত্যকা · অসম · পোনপটীয়া",
        riskAggregate: "মুঠ বিপদশংকা",
        tickNormal: "স্বাভাৱিক",
        tickWatch: "নিৰীক্ষণ",
        tickWarning: "সতৰ্কবাণী",
        tickSevere: "ভয়াবহ",
        langBtn: "English",
        // Dynamic Risk Descriptions in Assamese
        riskSevere: "সাৱধান হওক: ভয়াবহ বানপানীৰ পৰিস্থিতি দ্ৰুতগতিত সৃষ্টি হ'ব পাৰে।",
        riskWarning: "প্ৰস্তুত থাকক: বৰষুণ আৰু নদীৰ জলস্তৰ বৃদ্ধিৰ ফলত বানপানীৰ সম্ভাৱনা আছে।",
        riskWatch: "তীক্ষ্ণ নিৰীক্ষণ কৰক: স্থানীয় বানপানী বা নদীৰ জলস্তৰ বৃদ্ধি পোৱাৰ সম্ভাৱনা আছে।",
        riskNormal: "বৰ্তমান বিপদ কম: বানপানীৰ কোনো তীব্ৰ সংকেত দেখা পোৱা নাই।"
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
    const titleEl = document.querySelector('.hdr-title');
    if(titleEl) titleEl.innerHTML = `${this.getText('appTitle')}<small>${this.getText('subtitle')}</small>`;

    const aggregateLabel = document.querySelector('.gauge-label-row span:first-child');
    if(aggregateLabel) aggregateLabel.textContent = this.getText('riskAggregate');

    const ticks = document.querySelectorAll('.gauge-tick');
    if(ticks.length === 4) {
      ticks[0].textContent = this.getText('tickNormal');
      ticks[1].textContent = this.getText('tickWatch');
      ticks[2].textContent = this.getText('tickWarning');
      ticks[3].textContent = this.getText('tickSevere');
    }

    const langBtn = document.getElementById('langToggleBtn');
    if(langBtn) langBtn.textContent = this.getText('langBtn');

    if(window.renderAll) {
      window.renderAll();
    }
  }
}

const langManager = new LocalizationManager();
window.langManager = langManager;

/**
 * --- 2. DATA FETCHING: CWC Primary with GloFAS Fallback ---
 */
class DataFetcher {
  /**
   * Fetches river data, attempting CWC first, falling back to GloFAS.
   */
  static async fetchRiverData(lat, lon, stationCode) {
    // 1. Try CWC via a free CORS proxy (Replace with your own proxy later for production)
    const cwcUrl = `https://corsproxy.io/?https://ffs.india-water.gov.in/iam/api/new-map-data/station/${stationCode}`;
    
    try {
      console.log("Attempting to fetch primary CWC data...");
      const cwcResponse = await fetch(cwcUrl, { timeout: 5000 });
      if (cwcResponse.ok) {
        const cwcData = await cwcResponse.json();
        console.log("CWC Data successful!");
        return this.formatCWCData(cwcData);
      }
    } catch (error) {
      console.warn("CWC Fetch failed or timed out. Falling back to GloFAS...");
    }

    // 2. Fallback to Open-Meteo GloFAS
    const glofasUrl = `https://flood-api.open-meteo.com/v1/flood?latitude=${lat}&longitude=${lon}&daily=river_discharge&past_days=7&forecast_days=5&timezone=auto`;
    try {
      const glofasResponse = await fetch(glofasUrl);
      const glofasData = await glofasResponse.json();
      console.log("GloFAS Backup successful!");
      return this.formatGloFASData(glofasData);
    } catch (error) {
      console.error("Both CWC and GloFAS failed.");
      return null;
    }
  }

  static formatCWCData(data) {
    // Logic to parse CWC's specific JSON structure into your app's format
    // Returning dummy formatted data for the structural example
    return { source: "CWC", currentDischarge: data.currentLevel || 5000 /* Parse real cumecs */ };
  }

  static formatGloFASData(data) {
    // Existing GloFAS parsing logic
    return { source: "GloFAS", currentDischarge: data.daily.river_discharge[7] };
  }
}

/**
 * --- 3. INTERACTIVE CHART.JS UPGRADE ---
 * Replaces the static SVG with an interactive, touch-friendly graph.
 */
class InteractiveChartManager {
  /**
   * Builds a multi-axis Chart.js graph.
   * @param {string} canvasId - The ID of the <canvas> element.
   * @param {Object} data - Forecast data containing dates, rain, river flow, and dam release.
   */
  static renderChart(canvasId, data) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    // Destroy existing chart if it exists so it doesn't overlap on refresh
    if (window.floodChartInstance) {
      window.floodChartInstance.destroy();
    }

    window.floodChartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.dates, // e.g., ['Jul 10', 'Jul 11', 'Jul 12', 'Jul 13']
        datasets: [
          {
            label: 'River Discharge (m³/s)',
            data: data.riverDischarge,
            borderColor: '#1E6E7A',
            backgroundColor: 'rgba(30, 110, 122, 0.1)',
            yAxisID: 'yRiver',
            fill: true,
            tension: 0.4
          },
          {
            label: 'Dam Release (m³/s)',
            data: data.damRelease, // Example: Sudden spikes
            borderColor: '#B23345',
            borderDash: [5, 5], // Dashed red line to indicate sudden danger
            yAxisID: 'yRiver',
            fill: false,
            tension: 0.1
          },
          {
            label: 'Rainfall (mm)',
            data: data.rainfall,
            type: 'bar', // Mixing a bar chart in the line chart
            backgroundColor: '#3F7FB5',
            yAxisID: 'yRain',
            borderRadius: 4
          }
        ]
      },
      options: {
        responsive: true,
        interaction: {
          mode: 'index',
          intersect: false, // Shows tooltip for all metrics on the same day when hovered
        },
        scales: {
          yRiver: {
            type: 'linear',
            display: true,
            position: 'left',
            title: { display: true, text: 'Discharge (m³/s)' }
          },
          yRain: {
            type: 'linear',
            display: true,
            position: 'right',
            title: { display: true, text: 'Rainfall (mm)' },
            grid: { drawOnChartArea: false } // Prevent gridlines from overlapping
          }
        }
      }
    });
  }
}

// Ensure the language button is setup on load
document.addEventListener('DOMContentLoaded', () => {
  const statusRow = document.querySelector('.hdr-status-row');
  if(statusRow && !document.getElementById('langToggleBtn')) {
    const langBtn = document.createElement('button');
    langBtn.id = 'langToggleBtn';
    langBtn.className = 'refresh-btn';
    langBtn.style.marginLeft = '8px';
    langBtn.textContent = langManager.getText('langBtn');
    langBtn.addEventListener('click', () => { langManager.toggleLanguage(); });
    statusRow.appendChild(langBtn);
  }
});
