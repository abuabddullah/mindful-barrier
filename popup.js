/**
 * MindfulBarrier - Popup Controller with Checkbox Matrix & Custom URL Blocking
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
  let { blockedDomains = [], stats = {} } = await chrome.storage.local.get([
    'blockedDomains',
    'stats'
  ]);

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
          // Unchecking
          blockedDomains = blockedDomains.filter(
            (d) => d !== preset.domain && (!preset.altDomain || d !== preset.altDomain)
          );
        } else {
          // Checking
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

  // Render Custom Added Domains (domains not in standard presets)
  function renderCustomList() {
    customList.innerHTML = '';

    // Filter out standard preset domains to show in custom list
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

      // Delete custom domain
      item.querySelector('.btn-del').addEventListener('click', async () => {
        blockedDomains = blockedDomains.filter((d) => d !== domain);
        await chrome.storage.local.set({ blockedDomains });
        renderCustomList();
        renderPresets();
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

  // Initial renders
  renderPresets();
  renderCustomList();
});
