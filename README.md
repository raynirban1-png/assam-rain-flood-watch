# Assam Rain & Flood Watch

A fast, zero-backend, mobile-first crisis web app for the Brahmaputra basin in Assam.
Single `index.html` — open it and it works. No build step, no server code.

**Live site:** https://raynirban1-png.github.io/assam-rain-flood-watch/

## What it does

- **Watched locations (tap to expand)** — each location card opens a detail view with:
  - a plain-language **danger assessment** (LOW / MODERATE / HIGH / SEVERE) with crisis guidance
  - **river discharge now vs its 7-day average**, peak forecast discharge and day
  - **max rain rate (mm/h)** expected in the next 24 h
  - a **dual-axis chart comparing daily river discharge (GloFAS) against daily rain**,
    5 days back to 5 days ahead, forecast dashed
- **Live radar + satellite IR** loop (RainViewer) over Assam with flicker-free preloaded frames
- **Aggregate risk gauge** for the whole watch list
- **Official sources one tap away** — ASDMA, CWC Flood Forecast, IMD, SOS 112, District 1077
- Add any town/village (Open-Meteo geocoding), pin a spot by tapping the map, or use GPS
- Adjustable alert thresholds + optional browser notifications

## Data (fetched directly from the visitor's browser — no server, no lag)

| Data | Source |
|---|---|
| Rain now / hourly forecast | Open-Meteo Forecast API (GFS/ICON) |
| River discharge, past + forecast | Open-Meteo Flood API (GloFAS) |
| Radar & satellite mosaic | RainViewer |
| Place search | Open-Meteo Geocoding |

## Reliability design

- 12 s fetch timeouts with one automatic retry
- Last-good data cached in `localStorage` — page paints instantly, marks stale copies
- River section keeps working even if the weather API is unreachable (partial-failure mode)
- Auto-refresh: data every 10 min, radar every 5 min, and whenever the tab regains focus

## Deploy (GitHub Pages)

Already enabled on this repo: **Settings → Pages → Deploy from branch `main` / (root)**.
Any push to `main` redeploys within a minute.

## Disclaimer

Global models used as an early indicator — **not a substitute for official bulletins**.
In an emergency call **112** (national) or **1077** (district control room), and follow
[ASDMA](https://asdma.assam.gov.in/) and [CWC Flood Forecast](https://ffs.india-water.gov.in/).
