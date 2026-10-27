/**
 * MindfulBarrier - Popup Controller with Checkbox Matrix, Custom URL Blocking & Istighfar Reminder
 */

const PRESETS = [
  { id: 'fb', name: 'Facebook', domain: 'facebook.com', icon: '📘' },
  { id: 'yt', name: 'YouTube', domain: 'youtube.com', icon: '▶️' },
  { id: 'ig', name: 'Instagram', domain: 'instagram.com', icon: '📸' },
  { id: 'li', name: 'LinkedIn', domain: 'linkedin.com', icon: '💼' },
  { id: 'tw', name: 'X / Twitter', domain: 'x.com', altDomain: 'twitter.com', icon: '🐦' },
  { id: 'rd', name: 'Reddit', domain: 'reddit.com', icon: '🤖' },
  { id: 'tt', name: 'TikTok', domain: 'tiktok.com', icon: '🎵' },
  { id: 'nf', name: 'Netflix', domain: 'netflix.com', icon: '🍿' }
];

document.addEventListener('DOMContentLoaded', async () => {
  const statBlocked = document.getElementById('statBlocked');
  const statSaved = document.getElementById('statSaved');
  const presetGrid = document.getElementById('presetGrid');
  const customList = document.getElementById('customList');
  const customUrlInput = document.getElementById('customUrlInput');
  const btnAddCustomUrl = document.getElementById('btnAddCustomUrl');
  const btnSelectAll = document.getElementById('btnSelectAll');
  const btnTriggerDeactivate = document.getElementById('btnTriggerDeactivate');

  // Load from chrome.storage
  let { blockedDomains = ['facebook.com'], stats = {} } = await chrome.storage.local.get([
    'blockedDomains',
    'stats'
  ]);

  // Ensure initial default is ONLY facebook.com
  const defaultResetKey = 'mb_facebook_only_default_v1';
  if (!localStorage.getItem(defaultResetKey)) {
    blockedDomains = ['facebook.com'];
    await chrome.storage.local.set({ blockedDomains });
    localStorage.setItem(defaultResetKey, 'true');
  }

  statBlocked.textContent = (stats.totalBlockedAttempts || 0).toLocaleString('bn-BD');
  statSaved.textContent = (stats.totalAborted || 0).toLocaleString('bn-BD');

  // Helper to extract clean domain from URL or string
  function cleanDomainInput(input) {
    if (!input) return '';
    let str = input.trim().toLowerCase();
    try {
      if (!str.startsWith('http://') && !str.startsWith('https://')) {
        str = 'https://' + str;
      }
      const url = new URL(str);
      return url.hostname.replace(/^www\./, '').toLowerCase();
    } catch (e) {
      return str.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
    }
  }

  // Render Preset Cards
  function renderPresets() {
    presetGrid.innerHTML = '';

    PRESETS.forEach((preset) => {
      const isChecked = blockedDomains.includes(preset.domain) || 
        (preset.altDomain && blockedDomains.includes(preset.altDomain));

      const card = document.createElement('div');
      card.className = `preset-card ${isChecked ? 'checked' : ''}`;

      card.innerHTML = `
        <div class="preset-info">
          <span class="preset-icon">${preset.icon}</span>
          <span>${preset.name}</span>
        </div>
        <div class="custom-checkbox"></div>
      `;

      card.addEventListener('click', async () => {
        const currentlyChecked = card.classList.contains('checked');

        if (currentlyChecked) {
          // Unchecking requires the 10-Step Gauntlet!
          const confirmUncheck = confirm(
            `⚠️ "${preset.name}"-এর সুরক্ষা সরাসরি বন্ধ করা যাবে না!\n\nআবেগী মুহূর্তে সুরক্ষা তুলে নেওয়া ঠেকাতে এটি বন্ধ করতে হলে ১০-ধাপের কগনিটিভ গেট সম্পন্ন করতে হবে।\n\nআপনি কি ১০-ধাপের ভেরিফিকেশন গেট খুলতে চান?`
          );
          if (confirmUncheck) {
            chrome.tabs.create({
              url: chrome.runtime.getURL('disable-gate.html') + `?targetDomain=${encodeURIComponent(preset.domain)}`
            });
          }
          return;
        } else {
          if (!blockedDomains.includes(preset.domain)) {
            blockedDomains.push(preset.domain);
          }
          if (preset.altDomain && !blockedDomains.includes(preset.altDomain)) {
            blockedDomains.push(preset.altDomain);
          }
        }

        await chrome.storage.local.set({ blockedDomains });
        renderPresets();
        renderCustomList();
      });

      presetGrid.appendChild(card);
    });
  }

  // Render Custom Added Domains
  function renderCustomList() {
    customList.innerHTML = '';

    const presetDomains = new Set();
    PRESETS.forEach((p) => {
      presetDomains.add(p.domain);
      if (p.altDomain) presetDomains.add(p.altDomain);
    });

    const customDomains = blockedDomains.filter((d) => !presetDomains.has(d));

    if (customDomains.length === 0) {
      customList.innerHTML = '<div style="font-size: 11px; color: #64748b; text-align: center; padding: 6px;">কোনো কাস্টম ওয়েবসাইট যুক্ত নেই</div>';
      return;
    }

    customDomains.forEach((domain) => {
      const item = document.createElement('div');
      item.className = 'custom-item';

      item.innerHTML = `
        <span class="custom-item-name" title="${domain}">🌐 ${domain}</span>
        <div class="custom-item-actions">
          <button class="btn-del" title="মুছে ফেলুন">✕</button>
        </div>
      `;

      item.querySelector('.btn-del').addEventListener('click', async () => {
        const confirmDel = confirm(
          `⚠️ "${domain}"-এর ব্লকিং সরাসরি সরানো যাবে না!\n\nএটি সরাতে হলে ১০-ধাপের কগনিটিভ গেট সম্পন্ন করতে হবে।\n\nআপনি কি ১০-ধাপের গেট খুলতে চান?`
        );
        if (confirmDel) {
          chrome.tabs.create({
            url: chrome.runtime.getURL('disable-gate.html') + `?targetDomain=${encodeURIComponent(domain)}`
          });
        }
      });

      customList.appendChild(item);
    });
  }

  // Add Custom URL
  async function addCustomUrl() {
    const raw = customUrlInput.value;
    const domain = cleanDomainInput(raw);

    if (domain && !blockedDomains.includes(domain)) {
      blockedDomains.push(domain);
      await chrome.storage.local.set({ blockedDomains });
      customUrlInput.value = '';
      renderPresets();
      renderCustomList();
    }
  }

  btnAddCustomUrl.addEventListener('click', addCustomUrl);
  customUrlInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') addCustomUrl();
  });

  // Select All button
  btnSelectAll.addEventListener('click', async () => {
    PRESETS.forEach((p) => {
      if (!blockedDomains.includes(p.domain)) blockedDomains.push(p.domain);
      if (p.altDomain && !blockedDomains.includes(p.altDomain)) blockedDomains.push(p.altDomain);
    });
    await chrome.storage.local.set({ blockedDomains });
    renderPresets();
    renderCustomList();
  });

  // Trigger Deactivation Gate
  btnTriggerDeactivate.addEventListener('click', () => {
    chrome.tabs.create({
      url: chrome.runtime.getURL('disable-gate.html')
    });
  });

  // ==========================================
  // Periodic Istighfar Reminder Controller
  // ==========================================
  const toggleIstighfar = document.getElementById('toggleIstighfar');
  const istighfarBody = document.getElementById('istighfarBody');
  const istighfarInterval = document.getElementById('istighfarInterval');
  const istighfarPulse = document.getElementById('istighfarPulse');
  const istighfarCountdownText = document.getElementById('istighfarCountdownText');
  const btnTestIstighfar = document.getElementById('btnTestIstighfar');
  const chkAutoResume = document.getElementById('chkAutoResume');
  const chkProtectCalls = document.getElementById('chkProtectCalls');

  let { istighfarSettings = {
    enabled: false,
    intervalMinutes: 1,
    autoResumeMedia: true,
    protectCalls: true,
    nextTriggerTime: 0
  } } = await chrome.storage.local.get('istighfarSettings');

  if (toggleIstighfar) {
    toggleIstighfar.checked = !!istighfarSettings.enabled;
    istighfarInterval.value = String(istighfarSettings.intervalMinutes || 1);
    chkAutoResume.checked = istighfarSettings.autoResumeMedia !== false;
    chkProtectCalls.checked = istighfarSettings.protectCalls !== false;

    let countdownInterval = null;

    function updateIstighfarUI() {
      const isEnabled = toggleIstighfar.checked;
      if (isEnabled) {
        istighfarBody.classList.remove('disabled');
        istighfarPulse.classList.add('active');
      } else {
        istighfarBody.classList.add('disabled');
        istighfarPulse.classList.remove('active');
        istighfarCountdownText.textContent = 'স্ট্যাটাস: বন্ধ রয়েছে';
        if (countdownInterval) clearInterval(countdownInterval);
        return;
      }

      if (countdownInterval) clearInterval(countdownInterval);

      // Check active target time
      let target = Number(istighfarSettings.nextTriggerTime) || 0;
      const now = Date.now();
      const intervalMinutes = Number(istighfarInterval.value) || 1;

      // If target is in the past or not set, compute fresh future target and sync
      if (target <= now) {
        target = now + (intervalMinutes * 60 * 1000);
        istighfarSettings.nextTriggerTime = target;
        chrome.storage.local.set({ istighfarSettings });
        chrome.alarms.create('istighfar_reminder_alarm', {
          delayInMinutes: intervalMinutes,
          periodInMinutes: intervalMinutes
        });
      }

      // Sync with Chrome Alarm scheduledTime if active
      chrome.alarms.get('istighfar_reminder_alarm', (alarm) => {
        if (alarm && alarm.scheduledTime && alarm.scheduledTime > Date.now()) {
          target = alarm.scheduledTime;
          istighfarSettings.nextTriggerTime = target;
          tick();
        }
      });

      function tick() {
        const currentNow = Date.now();
        let remainingSec = Math.floor((target - currentNow) / 1000);

        if (remainingSec <= 0) {
          istighfarCountdownText.textContent = '⏳ জিকির বাজার সময় হয়েছে...';
          const nextCycleSec = (Number(istighfarInterval.value) || 1) * 60;
          target = Date.now() + (nextCycleSec * 1000);
          istighfarSettings.nextTriggerTime = target;
          chrome.storage.local.set({ istighfarSettings });
          return;
        }

        const m = Math.floor(remainingSec / 60);
        const s = remainingSec % 60;
        istighfarCountdownText.textContent = `পরবর্তী জিকির: ${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')} বাকি`;
      }

      tick();
      countdownInterval = setInterval(tick, 1000);
    }

    toggleIstighfar.addEventListener('change', () => {
      const isEnabled = toggleIstighfar.checked;
      if (isEnabled) {
        const intervalVal = Number(istighfarInterval.value);
        chrome.runtime.sendMessage({
          type: 'START_ISTIGHFAR_TIMER',
          intervalMinutes: intervalVal,
          autoResumeMedia: chkAutoResume.checked,
          protectCalls: chkProtectCalls.checked
        }, (res) => {
          if (res && res.istighfarSettings) {
            istighfarSettings = res.istighfarSettings;
          }
          updateIstighfarUI();
        });
      } else {
        chrome.runtime.sendMessage({ type: 'STOP_ISTIGHFAR_TIMER' }, (res) => {
          if (res && res.istighfarSettings) {
            istighfarSettings = res.istighfarSettings;
          }
          updateIstighfarUI();
        });
      }
    });

    istighfarInterval.addEventListener('change', () => {
      if (toggleIstighfar.checked) {
        const intervalVal = Number(istighfarInterval.value);
        chrome.runtime.sendMessage({
          type: 'START_ISTIGHFAR_TIMER',
          intervalMinutes: intervalVal,
          autoResumeMedia: chkAutoResume.checked,
          protectCalls: chkProtectCalls.checked
        }, (res) => {
          if (res && res.istighfarSettings) {
            istighfarSettings = res.istighfarSettings;
          }
          updateIstighfarUI();
        });
      }
    });

    chkAutoResume.addEventListener('change', async () => {
      istighfarSettings.autoResumeMedia = chkAutoResume.checked;
      await chrome.storage.local.set({ istighfarSettings });
    });

    chkProtectCalls.addEventListener('change', async () => {
      istighfarSettings.protectCalls = chkProtectCalls.checked;
      await chrome.storage.local.set({ istighfarSettings });
    });

    // Test Play Button
    btnTestIstighfar.addEventListener('click', () => {
      btnTestIstighfar.textContent = '⏳ বাজছে...';

      // 1. Direct audio playback inside popup for guaranteed 100% instant sound
      try {
        const directAudio = new Audio(chrome.runtime.getURL('sounds/istigfar.wav'));
        directAudio.volume = 1.0;
        directAudio.play().catch(e => console.warn('Direct popup play:', e));
        directAudio.onended = () => {
          btnTestIstighfar.textContent = '▶️ টেস্ট শুনুন';
        };
      } catch (e) {}

      // 2. Trigger background flow to test pausing other tabs
      chrome.runtime.sendMessage({ type: 'TEST_ISTIGHFAR_NOW' }, () => {
        setTimeout(() => {
          btnTestIstighfar.textContent = '▶️ টেস্ট শুনুন';
        }, 5200);
      });
    });

    // Listen for background timer triggers
    chrome.runtime.onMessage.addListener((msg) => {
      if (msg.type === 'ISTIGHFAR_TRIGGERED' && msg.nextTriggerTime) {
        istighfarSettings.nextTriggerTime = msg.nextTriggerTime;
        updateIstighfarUI();
      }
    });

    updateIstighfarUI();
  }

  // Initial renders
  renderPresets();
  renderCustomList();
});
