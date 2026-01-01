# Privacy Policy for YouTube Karaoke Mode

**Effective Date:** January 1, 2026

## 1. Introduction
YouTube Karaoke Mode ("the Extension") is an open-source browser extension developed by **Maadalla**. This Privacy Policy describes how the Extension collects, uses, and discloses information, and what choices you have with respect to the information.

## 2. Data Collection and Usage
We are committed to user privacy. **We do not collect, store, or sell any of your personal data.**

### A. Personal Information
The Extension **does not** collect any personally identifiable information (PII) such as your name, email address, IP address, or browsing history.

### B. Browsing Data
The Extension only accesses the `youtube.com` tab active in your browser to:
1.  Read the title of the video currently playing.
2.  Inject the lyrics overlay into the page.

This data is processed locally on your device and is **never** sent to our servers (because we do not have any servers).

### C. External API Usage (Lrclib.net)
To provide synchronized lyrics, the Extension sends the **Song Title** and **Artist Name** to a public, third-party API: **Lrclib.net**.
* **What is sent:** Only the search query (e.g., "The Weeknd - Blinding Lights").
* **Purpose:** To retrieve the synchronization data (timestamps and text) for the lyrics.
* **Privacy:** This interaction is anonymous. The Extension does not send any user identifiers to Lrclib.net.

## 3. Permissions Justification
The Extension requests the minimum permissions necessary to function:
* **`storage`**: Used solely to save your local preferences (Font size, text color, and the screen position of the lyrics box). This data stays on your Chrome profile and is not synced to us.
* **`scripting`**: Required to inject the visual overlay into the YouTube player.
* **Host Permissions (`youtube.com`, `lrclib.net`)**: Required to detect the video and fetch lyrics.

## 4. Changes to This Policy
We may update our Privacy Policy from time to time. Thus, you are advised to review this page periodically for any changes.

## 5. Contact Us
If you have any questions or suggestions about this Privacy Policy, do not hesitate to contact the developer via the [GitHub Repository Issues Page](https://github.com/Maadalla/youtube-karaoke-mode/issues).