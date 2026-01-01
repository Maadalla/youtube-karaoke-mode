# 🎤 YouTube Karaoke Mode

> **A Chromium Extension that transforms YouTube into a synchronized Karaoke machine.** > Features a "Netflix-style" overlay, smart metadata detection, and drag-and-drop UI.

![Version](https://img.shields.io/badge/version-4.2.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## 📸 Screenshots

<p align="center">
  <img src="screenshots/preview.png" alt="Extension Preview" width="700">
</p>

## ✨ Features

- **Synced Lyrics:** Fetches real-time synchronized lyrics using the [Lrclib](https://lrclib.net/) API.
- **Smart Metadata Engine:**
  - **Tier 1:** Uses the `MediaSession API` for 100% accurate Artist/Title detection.
  - **Tier 2:** Fallback DOM scraper with regex sanitization (Removes "Official Video", "ft.", "VEVO", " - Topic").
- **Smart Sync:** Uses fuzzy duration matching to prevent "Radio Edit" vs "Extended Mix" mismatches.
- **Dual Display Modes:**
  - **Classic:** Minimalist floating text.
  - **Karaoke:** Semi-transparent "Netflix-style" container.
- **Pro Control Panel:**
  - Drag & Drop positioning (Coordinates saved to Storage).
  - Adjustable Sync Offset (±10s).
  - Custom Font Size & Cinema Color Presets.
- **Instrumental Detection:** Automatically detects non-vocal tracks.

## 🛠️ Installation (Developer Mode)

Since this is a portfolio project, you can install it manually:

1.  Clone this repository:
    ```bash
    git clone [https://github.com/Maadalla/youtube-karaoke-mode.git](https://github.com/Maadalla/youtube-karaoke-mode.git)
    ```
2.  Open Chrome and navigate to `chrome://extensions`.
3.  Toggle **Developer mode** (top right).
4.  Click **Load unpacked**.
5.  Select the folder where you cloned this repo.
6.  Go to YouTube and play a song!

## 🧩 Architecture

- **Manifest V3:** Compliant with the latest Chrome Extension standards.
- **Content Scripts:** Handles DOM injection and MutationObservers for SPA navigation support.
- **Background Service Worker:** Manages onboarding and installation events.
- **Storage API:** Persists user preferences (Position, Color, Mode) across sessions.

## 🚀 Roadmap

- [x] Initial Release
- [x] Drag & Drop UI
- [x] "Topic" Channel Bug Fix
- [ ] Spotify Integration
- [ ] Multi-language translation

## 👨‍💻 Author

**Maadalla**
- [GitHub Profile](https://github.com/Maadalla)

---
*Disclaimer: This extension is for educational purposes. Lyrics are provided by Lrclib.net.*