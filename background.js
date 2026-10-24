/**
 * MindfulBarrier - Background Service Worker (Manifest V3)
 */

const DEFAULT_BLOCKED_DOMAINS = [
  'facebook.com',
  'youtube.com',
  'instagram.com',
  'linkedin.com',
  'twitter.com',
  'x.com',
  'tiktok.com',
  'reddit.com'
];

// Initialize default storage on install
chrome.runtime.onInstalled.addListener(async () => {
  const data = await chrome.storage.local.get(['blockedDomains', 'sessions', 'stats']);
  
  const updates = {};
  if (!data.blockedDomains) {
    updates.blockedDomains = DEFAULT_BLOCKED_DOMAINS;
  }
  if (!data.sessions) {
    updates.sessions = {};
  }
  if (!data.stats) {
    updates.stats = {
      totalBlockedAttempts: 0,
      totalPassed: 0,
      totalAborted: 0
    };
  }
  
  if (Object.keys(updates).length > 0) {
    await chrome.storage.local.set(updates);
  }
});

// Extract base domain from URL / string
function getMatchedDomain(urlStr, blockedDomains) {
  try {
    const url = new URL(urlStr);
    const hostname = url.hostname.toLowerCase();
    for (const domain of blockedDomains) {
      const cleanDomain = domain.toLowerCase().trim();
      if (hostname === cleanDomain || hostname.endsWith('.' + cleanDomain)) {
        return cleanDomain;
      }
    }
  } catch (e) {
    // string might just be hostname
    const hostname = urlStr.toLowerCase().trim();
    for (const domain of blockedDomains) {
      const cleanDomain = domain.toLowerCase().trim();
      if (hostname === cleanDomain || hostname.endsWith('.' + cleanDomain)) {
        return cleanDomain;
      }
    }
  }
  return null;
}

// Navigation Interceptor
chrome.webNavigation.onBeforeNavigate.addListener(async (details) => {
  // Only intercept main frame navigation
  if (details.frameId !== 0) return;

  const url = details.url;
  // Ignore chrome-extension URLs and internal pages
  if (url.startsWith('chrome-extension://') || url.startsWith('chrome://') || url.startsWith('about:') || url.startsWith('edge://')) {
    return;
  }

  const { blockedDomains = DEFAULT_BLOCKED_DOMAINS, sessions = {} } = await chrome.storage.local.get([
    'blockedDomains',
    'sessions'
  ]);

  const matchedDomain = getMatchedDomain(url, blockedDomains);
  if (!matchedDomain) return;

  const session = sessions[matchedDomain];
  const now = Date.now();

  // If there's an active valid session, allow navigation
  if (session && session.unlockedUntil && session.unlockedUntil > now) {
    return;
  }

  // Increment blocked attempts stat
  const { stats = { totalBlockedAttempts: 0, totalPassed: 0, totalAborted: 0 } } = await chrome.storage.local.get('stats');
  stats.totalBlockedAttempts = (stats.totalBlockedAttempts || 0) + 1;
  await chrome.storage.local.set({ stats });

  // Redirect to the 10-step gate
  const gateUrl = chrome.runtime.getURL('gate.html') +
    `?target=${encodeURIComponent(url)}&domain=${encodeURIComponent(matchedDomain)}`;
  
  chrome.tabs.update(details.tabId, { url: gateUrl });
});

// Handle alarms for session expiry
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name.startsWith('session_expiry_')) {
    const domain = alarm.name.replace('session_expiry_', '');
    const { sessions = {} } = await chrome.storage.local.get('sessions');
    
    if (sessions[domain]) {
      delete sessions[domain];
      await chrome.storage.local.set({ sessions });
    }

    // Redirect all active tabs of this domain back to gate or lock them
    const tabs = await chrome.tabs.query({});
    for (const tab of tabs) {
      if (tab.url && getMatchedDomain(tab.url, [domain])) {
        const gateUrl = chrome.runtime.getURL('gate.html') +
          `?target=${encodeURIComponent(tab.url)}&domain=${encodeURIComponent(domain)}&expired=true`;
        chrome.tabs.update(tab.id, { url: gateUrl });
      }
    }
  }
});

// Message listener from Gate, Popup and Content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'CHECK_STATUS') {
    (async () => {
      const { sessions = {}, blockedDomains = DEFAULT_BLOCKED_DOMAINS } = await chrome.storage.local.get([
        'sessions',
        'blockedDomains'
      ]);

      const testUrl = message.url || message.hostname || (sender.tab ? sender.tab.url : '');
      const matchedDomain = getMatchedDomain(testUrl, blockedDomains) || message.domain;
      const isBlocked = !!matchedDomain;

      let isUnlocked = false;
      let remainingMs = 0;
      let session = null;

      if (matchedDomain && sessions[matchedDomain]) {
        session = sessions[matchedDomain];
        const now = Date.now();
        if (session.unlockedUntil > now) {
          isUnlocked = true;
          remainingMs = session.unlockedUntil - now;
        }
      }
      
      sendResponse({
        isBlocked,
        matchedDomain,
        isUnlocked,
        remainingMs,
        session
      });
    })();
    return true; // async response
  }

  if (message.type === 'UNLOCK_DOMAIN') {
    (async () => {
      const { domain, durationMinutes = 10 } = message;
      const durationMs = durationMinutes * 60 * 1000;
      const now = Date.now();
      const unlockedUntil = now + durationMs;

      const { sessions = {}, stats = { totalBlockedAttempts: 0, totalPassed: 0, totalAborted: 0 } } = await chrome.storage.local.get(['sessions', 'stats']);
      
      sessions[domain] = {
        unlockedUntil,
        durationMinutes,
        startTime: now
      };

      stats.totalPassed = (stats.totalPassed || 0) + 1;

      await chrome.storage.local.set({ sessions, stats });

      // Create alarm for expiry
      chrome.alarms.create(`session_expiry_${domain}`, {
        when: unlockedUntil
      });

      sendResponse({ success: true, unlockedUntil });
    })();
    return true;
  }

  if (message.type === 'ABORT_SESSION') {
    (async () => {
      const { stats = { totalBlockedAttempts: 0, totalPassed: 0, totalAborted: 0 } } = await chrome.storage.local.get('stats');
      stats.totalAborted = (stats.totalAborted || 0) + 1;
      await chrome.storage.local.set({ stats });

      if (sender.tab && sender.tab.id) {
        chrome.tabs.remove(sender.tab.id);
      }
      sendResponse({ success: true });
    })();
    return true;
  }

  if (message.type === 'LOCK_DOMAIN_NOW') {
    (async () => {
      const { domain } = message;
      const { sessions = {} } = await chrome.storage.local.get('sessions');
      if (sessions[domain]) {
        delete sessions[domain];
        await chrome.storage.local.set({ sessions });
        chrome.alarms.clear(`session_expiry_${domain}`);
      }
      sendResponse({ success: true });
    })();
    return true;
  }
});
