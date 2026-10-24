<div align="center">

  <img src="icons/icon128.png" alt="MindfulBarrier Logo" width="100" height="100" />

  # 🛑 MindfulBarrier
  ### *A High-Friction Cognitive Circuit Breaker to Permanently Cure Social Media Addiction*

  [![Manifest V3](https://img.shields.io/badge/Chrome_Extension-Manifest_V3-3b82f6?style=for-the-badge&logo=googlechrome&logoColor=white)](#)
  [![License: MIT](https://img.shields.io/badge/License-MIT-10b981?style=for-the-badge)](#)
  [![Privacy: 100% Local](https://img.shields.io/badge/Privacy-100%25_Offline_%26_Local-emerald?style=for-the-badge&logo=shield&logoColor=white)](#)
  [![Platform: Chrome | Brave | Edge](https://img.shields.io/badge/Browser-Chrome_|_Brave_|_Edge-f59e0b?style=for-the-badge)](#)
  [![PRs Welcome](https://img.shields.io/badge/PRs-Welcome-purple?style=for-the-badge)](#)

  <p align="center">
    <b>MindfulBarrier</b> is an open-source browser extension engineered to break unconscious muscle-memory browsing by introducing <b>10 unskippable, cognitive friction gates</b> between you and distracting platforms like Facebook, YouTube, and Instagram.
  </p>

  <p align="center">
    <a href="#-the-problem--solution">The Problem</a> •
    <a href="#-key-features">Key Features</a> •
    <a href="#-the-10-cognitive-friction-gates">The 10 Gates</a> •
    <a href="#-anti-disable-architecture">Anti-Disable System</a> •
    <a href="#-installation-guide">Installation</a> •
    <a href="#-license">License</a>
  </p>

</div>

---

## 🌪️ The Problem & The Solution

| The Dopamine Trap (Default Browsing) | The MindfulBarrier Solution |
| :--- | :--- |
| **Instant gratification:** Typing `f` + `Enter` opens Facebook in 0.2 seconds. | **Cognitive Friction:** 10 mandatory deliberate gates break automaticity. |
| **Relapse via OTP:** Even after logging out, OTP login takes just 15 seconds. | **Friction Overload:** Your prefrontal cortex wakes up, killing impulsive cravings. |
| **Infinite Scrolling:** Losing 2–3 hours without realizing where time went. | **Hard Time-Boxing:** Strict 5–15 min session with a floating live timer & instant lockout. |
| **Effortless Uninstallation:** Addicts remove normal blockers in 1 click. | **20-Minute Delay Lock:** Removing the extension requires a 20-min cooling cooldown. |

---

## ✨ Key Features

- 🧠 **10-Step Cognitive Friction Engine:** Forces mindful awareness through breathing, justification, cognitive math, physical resets, and reflection.
- 🚫 **Anti-Gibberish & Spam-Detection Algorithm:** Smart dictionary verification rejects keyboard smashing (e.g. `asdfasdfasdf` or random mash like `amdi adfhai...`).
- 🎨 **Real-Time Color-Coded Typo Highlighter:** Instant feedback on typing commitments:
  - 🟢 **Green:** Correctly typed words.
  - 🔴 **Red:** Immediate typo detection with exact word correction helper.
  - 🔵 **Cyan:** Current active word in focus.
- 🎯 **Preset Matrix & Universal URL Blocker:**
  - One-click presets for **Facebook**, **YouTube**, **Instagram**, **LinkedIn**, **Twitter/X**, **Reddit**, **TikTok**, and **Netflix**.
  - Block **ANY custom URL or domain** (e.g., `news.ycombinator.com`, `pinterest.com`, etc.).
- ⏳ **Floating Draggable Session Timer:** A sleek in-page HUD widget showing remaining seconds with an instant lockout curtain on expiry.
- 🛡️ **Single-Extension Enterprise Policy Lock (Windows):** Prevents instant disabling or removal on `chrome://extensions` while keeping all your other extensions 100% accessible!
- 🔒 **100% Private & Offline:** Zero external server calls, zero tracking, zero telemetry. Everything runs on your machine.

---

## 🧗‍♂️ The 10 Cognitive Friction Gates

Whenever you visit a blocked site, MindfulBarrier intercepts the navigation and presents the 10 gates in order:

```
[Target URL Request] ──> [Gate 1: Cooldown] ──> [Gate 2: Real Reason] ──> [Gate 3: Oath]
                                                                                │
[Gate 7: Cost Calc] <── [Gate 6: Time-Box] <── [Gate 5: Physical] <── [Gate 4: Math Puzzles]
         │
         └──> [Gate 8: Reverse Typing] ──> [Gate 9: Hero Exit] ──> [Gate 10: 10s Countdown] ──> [Access with HUD Timer]
```

1. **🧘 Step 1: Mindful Breathing (30s Unskippable Cooldown)**  
   Visual breathing animation (Inhale 4s, Hold 4s, Exhale 4s) to reset your nervous system.
2. **✍️ Step 2: Meaningful Intent Declaration**  
   Type at least 35 characters explaining *why* you must enter. Monitored by our phonotactic & dictionary engine (no keyboard mashing allowed).
3. **📜 Step 3: Anti-Dopamine Commitment Oath**  
   Type the commitment oath with live MonkeyType-style color-coded typo detection:
   > *"I consciously acknowledge that social media algorithms are designed to hijack my time. I will not lose control of my life."*
4. **🧠 Step 4: Cognitive Brain Activation (Math & Logic)**  
   3 dynamically generated algebraic puzzles (e.g. `(28 × 4) - 52 = ?`) to shift your brain from emotional craving to analytical reasoning.
5. **🚶 Step 5: Physical Movement & Off-Screen Break (60s)**  
   Stand up, drink a glass of water, or look 20 feet away to break screen trance.
6. **⏱️ Step 6: Strict Time-Box Selection**  
   Lock yourself into **5 min** (recommended), **10 min**, or maximum **15 min**.
7. **💸 Step 7: Opportunity Cost Reflection**  
   Calculates your yearly financial loss based on your hourly rate (e.g. $15,000+ lost per year).
8. **🧩 Step 8: Reverse Cognitive Typing**  
   Type a phrase in reverse word order to shatter subconscious muscle memory:  
   `success to keys are patience and focus`
9. **🛡️ Step 9: The Hero Decision Gate**  
   A prominent green **"No! I will not waste my time — Close Tab"** escape hatch vs a tiny faded link.
10. **🔓 Step 10: Final 10-Second Lockdown & Unlock**  
    A final 10-second countdown before unlocking the target site with an active in-page HUD countdown timer.

---

## 🛡️ Anti-Disable Architecture

Most blockers fail because an addict simply goes to `chrome://extensions` and clicks **"Remove"** or flips the switch in 1 second. 

MindfulBarrier solves this through **Windows Chrome Enterprise Policy**:

```
                                  [Try to Remove MindfulBarrier?]
                                                │
                     ┌──────────────────────────┴──────────────────────────┐
                     ▼                                                     ▼
      [Directly on chrome://extensions]                      [Authorized 20-Min Unlock]
                     │                                                     │
           🚫 REMOVE BUTTON GONE!                             ⏳ Run 20-Min Cooldown
           🚫 TOGGLE SWITCH GREYED OUT!                       (Minimize & continue your work)
           ✅ OTHER EXTENSIONS WORK NORMALLY!                              │
                                                                           ▼
                                                              ✅ 15-Minute Temporary Grace Window
```

- **Lock Script (`MindfulBarrier - Lock.lnk`):** Adds the extension's ID to Chrome's `ExtensionInstallForcelist`. Chrome marks it as *"Installed by your administrator"*. The **Remove button disappears** and the **Toggle switch is disabled**.
- **20-Minute Unlocker (`MindfulBarrier - 20Min Unlock.lnk`):** Need to remove it? Run the unlocker, minimize the window, and go back to your work. Exactly 20 minutes later, it grants a 15-minute temporary unlock window!

---

## 🚀 Installation Guide

### Option A: One-Click Master Setup (Windows)

1. Clone or download this repository:
   ```bash
   git clone https://github.com/abuabddullah/mindful-barrier.git
   ```
2. Double-click **`SETUP.bat`** (located inside the repository folder).
3. Type **`1`** and hit Enter:
   - It automatically copies the extension folder path to your clipboard.
   - It opens `chrome://extensions` in Chrome.
   - It enables the Enterprise Policy lock.
   - It generates Desktop shortcuts!
4. In Chrome, enable **"Developer mode"** (top right) -> Click **"Load unpacked"** -> Paste (`Ctrl+V`) -> Select folder.
5. Done! 🎉

---

### Option B: Manual Chrome Setup (Any OS)

1. Open your Chromium browser (Chrome, Brave, Edge).
2. Navigate to:
   ```text
   chrome://extensions
   ```
3. Toggle on **Developer mode** in the top-right corner.
4. Click **Load unpacked** in the top-left corner.
5. Select the **`mindful-barrier`** directory.
6. Pin **MindfulBarrier** (🛑) to your browser toolbar!

> **💡 Pro-Tip:** Click *Details* on MindfulBarrier in `chrome://extensions` and toggle **"Allow in Incognito"** to prevent incognito bypassing.

---

## 📁 Repository Structure

```text
mindful-barrier/
├── icons/                      # High-res vector & PNG extension icons (16, 32, 48, 128)
│   ├── icon16.png
│   ├── icon32.png
│   ├── icon48.png
│   ├── icon128.png
│   └── icon.svg                # Fully scalable vector source
├── scripts/                    # Windows Enterprise Lock & 20-Min Delay scripts
│   ├── Lock-MindfulBarrier-Extension.bat
│   └── Unlock-MindfulBarrier-20Min.bat
├── background.js               # Manifest V3 service worker & domain interceptor
├── content.js                  # In-page draggable HUD countdown timer & lockout curtain
├── content.css                 # HUD timer styling
├── gate.html                   # 10-Step Access Gate interface
├── gate.js                     # 10-Step logic & Anti-Gibberish validation engine
├── gate.css                    # Dark focused aesthetic
├── disable-gate.html           # 10-Step Deactivation Protocol interface
├── disable-gate.js             # Deactivation gauntlet logic
├── popup.html                  # Quick Settings, Stats & Checkbox Matrix
├── popup.js                    # Domain toggle controller
├── popup.css                   # Popup styling
├── manifest.json               # Manifest V3 configuration
├── SETUP-MINDFUL-BARRIER.bat   # 1-Click Master Control Hub
└── README.md                   # This documentation
```

---

## 🤝 Contributing

Contributions are warmly welcomed! If you have ideas for new cognitive friction challenges, additional platform presets, or improved phonotactic language models:

1. Fork the Project.
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`).
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the Branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.

---

<div align="center">
  <sub>Engineered with focus and discipline for a healthier digital life. If this project helped you reclaim your time, consider starring ⭐ the repository!</sub>
</div>
