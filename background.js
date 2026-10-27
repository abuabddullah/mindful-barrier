/**
 * MindfulBarrier - Background Service Worker (Manifest V3)
 * Handles domain blocking, session timers, and periodic in-browser Istighfar reminders.
 */

const DEFAULT_BLOCKED_DOMAINS = [
  'facebook.com'
];

const DEFAULT_ISTIGHFAR_SETTINGS = {
  enabled: false,
  intervalMinutes: 1,
  autoResumeMedia: true,
  protectCalls: true,
  nextTriggerTime: 0
};

// ==========================================
// Offscreen Document Helper for Audio Playback
// ==========================================
let creatingOffscreenPromise = null;
async function ensureOffscreenDocument() {
  const offscreenUrl = chrome.runtime.getURL('offscreen.html');

  if (chrome.runtime.getContexts) {
    const contexts = await chrome.runtime.getContexts({
      contextTypes: ['OFFSCREEN_DOCUMENT'],
      documentUrls: [offscreenUrl]
    });
    if (contexts.length > 0) return;
  } else if (chrome.offscreen && chrome.offscreen.hasDocument) {
    const hasDoc = await chrome.offscreen.hasDocument();
    if (hasDoc) return;
  }

  if (creatingOffscreenPromise) {
    await creatingOffscreenPromise;
    return;
  }

  creatingOffscreenPromise = chrome.offscreen.createDocument({
    url: 'offscreen.html',
    reasons: ['AUDIO_PLAYBACK'],
    justification: 'Mindful Istighfar periodic reminder audio playback'
  });

  try {
    await creatingOffscreenPromise;
  } catch (err) {
    // Document may already be created
  } finally {
    creatingOffscreenPromise = null;
  }
}

// Trigger Istighfar Audio and pause media in other tabs
async function triggerIstighfarPlayback() {
  const { istighfarSettings = DEFAULT_ISTIGHFAR_SETTINGS } = await chrome.storage.local.get('istighfarSettings');

  // 1. Smart Call Protection (Google Meet / WhatsApp / Teams / Zoom)
  if (istighfarSettings.protectCalls) {
    try {
      const callTabs = await chrome.tabs.query({
        url: [
          "*://meet.google.com/*",
          "*://web.whatsapp.com/*",
          "*://teams.microsoft.com/*",
          "*://zoom.us/*"
        ]
      });

      // If user is currently in an active audio call, defer to avoid disturbance
      const activeCall = callTabs.find(t => t.audible);
      if (activeCall) {
        console.log('MindfulBarrier: Active call in progress. Deferring Istighfar.');
        return;
      }
    } catch (e) {
      console.warn('Call protection check error:', e);
    }
  }

  // 2. Pause media in all non-meeting web tabs
  try {
    const tabs = await chrome.tabs.query({});
    for (const tab of tabs) {
      if (tab.id && tab.url && !tab.url.startsWith('chrome://') && !tab.url.startsWith('chrome-extension://')) {
        chrome.tabs.sendMessage(tab.id, { type: 'PAUSE_ENTERTAINMENT_MEDIA' }).catch(() => {});
      }
    }
  } catch (e) {
    console.warn('Error broadcasting pause:', e);
  }

  // 3. Play audio via offscreen engine
  try {
    await ensureOffscreenDocument();
    chrome.runtime.sendMessage({
      type: 'PLAY_AUDIO',
      audioUrl: chrome.runtime.getURL('sounds/istigfar.wav')
    }).catch(err => console.error('Error sending PLAY_AUDIO message:', err));
  } catch (e) {
    console.error('Failed to trigger audio in offscreen:', e);
  }
}

// Initialize default storage on install
chrome.runtime.onInstalled.addListener(async () => {
  const data = await chrome.storage.local.get(['blockedDomains', 'sessions', 'stats', 'istighfarSettings']);
  
  const updates = {};
  if (!data.blockedDomains) {
    updates.blockedDomains = DEFAULT_BLOCKED_DOMAINS;
  }
  if (!data.sessions) {
    updates.sessions = {};
  }
  if (!data.istighfarSettings) {
    updates.istighfarSettings = DEFAULT_ISTIGHFAR_SETTINGS;
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
  if (details.frameId !== 0) return;

  const url = details.url;
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

  if (session && session.unlockedUntil && session.unlockedUntil > now) {
    return;
  }

  const { stats = { totalBlockedAttempts: 0, totalPassed: 0, totalAborted: 0 } } = await chrome.storage.local.get('stats');
  stats.totalBlockedAttempts = (stats.totalBlockedAttempts || 0) + 1;
  await chrome.storage.local.set({ stats });

  const gateUrl = chrome.runtime.getURL('gate.html') +
    `?target=${encodeURIComponent(url)}&domain=${encodeURIComponent(matchedDomain)}`;
  
  chrome.tabs.update(details.tabId, { url: gateUrl });
});

// Handle alarms for session expiry and Istighfar reminders
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'istighfar_reminder_alarm') {
    await triggerIstighfarPlayback();
    const { istighfarSettings = DEFAULT_ISTIGHFAR_SETTINGS } = await chrome.storage.local.get('istighfarSettings');
    if (istighfarSettings.enabled) {
      const nextTime = Date.now() + (istighfarSettings.intervalMinutes * 60 * 1000);
      istighfarSettings.nextTriggerTime = nextTime;
      await chrome.storage.local.set({ istighfarSettings });
      chrome.runtime.sendMessage({ type: 'ISTIGHFAR_TRIGGERED', nextTriggerTime: nextTime }).catch(() => {});
    }
    return;
  }

  if (alarm.name.startsWith('session_expiry_')) {
    const domain = alarm.name.replace('session_expiry_', '');
    const { sessions = {} } = await chrome.storage.local.get('sessions');
    
    if (sessions[domain]) {
      delete sessions[domain];
      await chrome.storage.local.set({ sessions });
    }

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

// Message listener
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
    return true;
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

  // ==========================================
  // Istighfar Reminder Messages
  // ==========================================
  if (message.type === 'START_ISTIGHFAR_TIMER') {
    (async () => {
      const { intervalMinutes = 1, autoResumeMedia = true, protectCalls = true } = message;
      const nextTriggerTime = Date.now() + (intervalMinutes * 60 * 1000);
      const istighfarSettings = {
        enabled: true,
        intervalMinutes: Number(intervalMinutes),
        autoResumeMedia: !!autoResumeMedia,
        protectCalls: !!protectCalls,
        nextTriggerTime
      };

      await chrome.storage.local.set({ istighfarSettings });
      await chrome.alarms.clear('istighfar_reminder_alarm');
      chrome.alarms.create('istighfar_reminder_alarm', {
        delayInMinutes: Number(intervalMinutes),
        periodInMinutes: Number(intervalMinutes)
      });

      sendResponse({ success: true, istighfarSettings });
    })();
    return true;
  }

  if (message.type === 'STOP_ISTIGHFAR_TIMER') {
    (async () => {
      const { istighfarSettings = DEFAULT_ISTIGHFAR_SETTINGS } = await chrome.storage.local.get('istighfarSettings');
      istighfarSettings.enabled = false;
      istighfarSettings.nextTriggerTime = 0;

      await chrome.storage.local.set({ istighfarSettings });
      await chrome.alarms.clear('istighfar_reminder_alarm');
      sendResponse({ success: true, istighfarSettings });
    })();
    return true;
  }

  if (message.type === 'TEST_ISTIGHFAR_NOW') {
    (async () => {
      await triggerIstighfarPlayback();
      sendResponse({ success: true });
    })();
    return true;
  }

  if (message.type === 'AUDIO_PLAYBACK_FINISHED') {
    (async () => {
      const { istighfarSettings = DEFAULT_ISTIGHFAR_SETTINGS } = await chrome.storage.local.get('istighfarSettings');
      if (istighfarSettings.autoResumeMedia) {
        const tabs = await chrome.tabs.query({});
        for (const tab of tabs) {
          if (tab.id && tab.url && !tab.url.startsWith('chrome://') && !tab.url.startsWith('chrome-extension://')) {
            chrome.tabs.sendMessage(tab.id, { type: 'RESUME_ENTERTAINMENT_MEDIA' }).catch(() => {});
          }
        }
      }
    })();
    return true;
  }
});
