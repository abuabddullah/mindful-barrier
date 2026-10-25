/**
 * MindfulBarrier - In-Page Content Script
 * Shows floating session timer and enforces immediate screen lockout on expiry for ANY blocked URL.
 */

(function () {
  const currentUrl = window.location.href;
  const currentHost = window.location.hostname.toLowerCase();

  // If internal browser pages or extension pages, skip
  if (currentUrl.startsWith('chrome-extension://') || currentUrl.startsWith('chrome://') || currentUrl.startsWith('about:')) {
    return;
  }

  // ==========================================
  // Media Control for Periodic Istighfar Reminder
  // ==========================================
  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.type === 'PAUSE_ENTERTAINMENT_MEDIA') {
      // 1. SMART MEETING / CALL EXCLUSION:
      // If the user is on Google Meet, WhatsApp, Microsoft Teams, Zoom, or Messenger Calls:
      // We NEVER pause or disrupt their call!
      const isMeetingCall = 
        currentHost.includes('meet.google.com') ||
        currentHost.includes('web.whatsapp.com') ||
        currentHost.includes('teams.microsoft.com') ||
        currentHost.includes('zoom.us') ||
        (currentHost.includes('facebook.com') && currentUrl.includes('/call/')) ||
        (currentHost.includes('messenger.com') && currentUrl.includes('/call/'));

      if (isMeetingCall) {
        sendResponse({ status: 'ignored_meeting' });
        return true;
      }

      // 2. PAUSE ALL PLAYING VIDEO / AUDIO ELEMENTS (YouTube, Facebook, Netflix, Spotify, etc.)
      const mediaEls = Array.from(document.querySelectorAll('video, audio'));
      let pausedCount = 0;
      mediaEls.forEach(el => {
        if (!el.paused && !el.ended && el.readyState > 0) {
          try {
            el.pause();
            el.dataset.pausedByIstighfar = 'true';
            pausedCount++;
          } catch (e) {
            console.warn('Could not pause element', e);
          }
        }
      });

      sendResponse({ status: 'paused', count: pausedCount });
      return true;
    }

    if (msg.type === 'RESUME_ENTERTAINMENT_MEDIA') {
      const mediaEls = Array.from(document.querySelectorAll('video, audio'));
      let resumedCount = 0;
      mediaEls.forEach(el => {
        if (el.dataset.pausedByIstighfar === 'true') {
          delete el.dataset.pausedByIstighfar;
          try {
            el.play().catch(() => {});
            resumedCount++;
          } catch (e) {}
        }
      });

      sendResponse({ status: 'resumed', count: resumedCount });
      return true;
    }
  });

  // Initial status check
  chrome.runtime.sendMessage(
    { type: 'CHECK_STATUS', url: currentUrl, hostname: currentHost },
    (res) => {
      if (!res) return;

      // If this site is NOT blocked, do nothing at all!
      if (!res.isBlocked) return;

      const domain = res.matchedDomain || currentHost;

      // If blocked domain and NOT unlocked, immediately lock and redirect
      if (!res.isUnlocked) {
        lockPageImmediately(domain);
        return;
      }

      // If unlocked, mount floating timer
      if (res.isUnlocked && res.remainingMs > 0) {
        mountFloatingTimer(domain, res.remainingMs);
      }
    }
  );

  function lockPageImmediately(domain) {
    document.documentElement.innerHTML = '';
    const gateUrl = chrome.runtime.getURL('gate.html') +
      `?target=${encodeURIComponent(window.location.href)}&domain=${encodeURIComponent(domain)}&expired=true`;
    window.location.replace(gateUrl);
  }

  function mountFloatingTimer(domain, initialRemainingMs) {
    if (document.getElementById('mindful-floating-timer')) return;

    let remainingSeconds = Math.floor(initialRemainingMs / 1000);

    const timerBadge = document.createElement('div');
    timerBadge.id = 'mindful-floating-timer';

    timerBadge.innerHTML = `
      <span class="mindful-timer-icon">⏳</span>
      <span>সময় বাকি: <span class="mindful-timer-digits" id="mindful-digits">--:--</span></span>
      <button class="mindful-lock-now-btn" id="mindful-lock-btn" title="এখনই লক করুন">লক</button>
    `;

    document.documentElement.appendChild(timerBadge);

    const digitsElem = document.getElementById('mindful-digits');
    const lockBtn = document.getElementById('mindful-lock-btn');

    // Make Draggable
    let isDragging = false;
    let offsetX = 0;
    let offsetY = 0;

    timerBadge.addEventListener('mousedown', (e) => {
      if (e.target === lockBtn) return;
      isDragging = true;
      offsetX = e.clientX - timerBadge.getBoundingClientRect().left;
      offsetY = e.clientY - timerBadge.getBoundingClientRect().top;
      timerBadge.style.cursor = 'grabbing';
    });

    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      timerBadge.style.left = `${e.clientX - offsetX}px`;
      timerBadge.style.top = `${e.clientY - offsetY}px`;
      timerBadge.style.right = 'auto';
    });

    document.addEventListener('mouseup', () => {
      isDragging = false;
      timerBadge.style.cursor = 'grab';
    });

    // Lock Now click
    lockBtn.addEventListener('click', () => {
      chrome.runtime.sendMessage({ type: 'LOCK_DOMAIN_NOW', domain: domain }, () => {
        triggerLockoutScreen(domain);
      });
    });

    function updateDisplay() {
      const m = Math.floor(remainingSeconds / 60);
      const s = remainingSeconds % 60;
      digitsElem.textContent = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;

      if (remainingSeconds <= 60) {
        timerBadge.classList.add('danger');
      }

      if (remainingSeconds <= 0) {
        clearInterval(timerInterval);
        triggerLockoutScreen(domain);
      }
    }

    updateDisplay();

    const timerInterval = setInterval(() => {
      remainingSeconds--;
      updateDisplay();
    }, 1000);
  }

  function triggerLockoutScreen(domain) {
    const existing = document.getElementById('mindful-lockout-screen');
    if (existing) return;

    const overlay = document.createElement('div');
    overlay.id = 'mindful-lockout-screen';
    overlay.innerHTML = `
      <h1>🛑 সময় শেষ!</h1>
      <p>আপনার নির্ধারিত সোশ্যাল মিডিয়া সেশনটি সমাপ্ত হয়েছে। পুনরায় প্রবেশ করতে হলে আবার ১০টি কগনিটিভ ধাপ সম্পন্ন করতে হবে।</p>
    `;
    document.documentElement.appendChild(overlay);

    setTimeout(() => {
      lockPageImmediately(domain);
    }, 2000);
  }
})();
