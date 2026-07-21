# Changelog

## [2.0.0] — 2026-07-21 · Public early-warning redesign

### Added
- Plain-language warning summary per location: headline, reasons, and estimated response window (hours after peak rainfall).
- Three-hazard risk breakdown so users see *which kind* of flooding threatens them: **River flood · Sudden/flash flood · Local waterlogging**, each rated Low/Moderate/High/Severe.
- Rain → River → Local impact cause-flow strip explaining how forecast rain drives river response.
- "What this means" and "What to do now" action panels tuned per risk level (aligned with ASDMA-style guidance).
- **Flood-stress timeline chart built from real data**: actual GloFAS river discharge normalized against the river's own 7-day normal (solid past / dashed forecast), real Open-Meteo daily rain bars, color-coded danger dots, red shading where flow enters danger territory, and RAIN PEAK / RIVER PEAK markers with a computed rain-to-river lag caption.
- **Observed rain→river coupling analytics** (`rainRiverCoupling`): pairs each observed rainy day with the next day's discharge change to derive a local elasticity — surfaces "≈ +X% river rise per 10 mm of rain" and "~Y% of the forecast river rise explained by rain." Falls back to a clearly-labeled heuristic estimate when fewer than 3 valid day-pairs exist.
- One-line plain-language risk summary on each collapsed location card.
- Collapsible "View scientific data and original graph" section preserving the full technical river-vs-rain chart and metric grid for expert users.
- Model-limitation note clarifying that the rainfall-influence figure is an explainable estimate, not a hydrological conversion, and that CWC/ASDMA thresholds take priority.

### Changed
- Location detail view now leads with the public summary and hazard trio; technical metrics moved behind the expert disclosure.
- Card tap hint and notification body now use the plain-language summary.
- Calibrated the waterlogging score (raised 6-h rain and rain-rate denominators) so moderate rain reads **High** rather than **Severe** — reduces over-alarming and preserves trust in genuine Severe warnings.

### Fixed
- Replaced a fabricated "danger timeline" chart (hardcoded curve and fixed-shape rain bars) with the real-data flood-stress chart described above.
- Chart degrades gracefully with a friendly message when river discharge data is unavailable, instead of rendering misleading values.

### Notes
- Data sources unchanged: Open-Meteo (GFS/ICON) rain, Open-Meteo Flood API (GloFAS) discharge, RainViewer radar/satellite. These are global early-indicator models — **not a substitute for official ASDMA / CWC bulletins.**
