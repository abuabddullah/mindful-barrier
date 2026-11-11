/**
 * MindfulBarrier — High-Performance Interval Workout Arena
 * Direct Start, Seamless Vocal Nasheed Looping, and 5-Second Audio Ducking Engine
 */

// ==========================================
// 1. PLAYLIST & CONFIGURATION DEFAULTS
// ==========================================
const NASHEED_PLAYLIST = [
  {
    title: 'Fiya Hubbun (فيّ حبٌ)',
    artist: 'আব্দুল্লাহ আল-জারাল্লাহ (Vocals Only)',
    file: 'sounds/nasheeed/fiya hubbun (فيّ حبٌ) - abdullah aljarallah __ vocals only (بدون موسيقى) + lyrics + translation - fatima.mp3'
  },
  {
    title: 'Taballigh Bil Qaleel (تبلغ بالقليل)',
    artist: 'ওসামা আল-সাফি (Vocals Only)',
    file: 'sounds/nasheeed/taballig bil qaleelتبلغ بالقليل - أسامة الصافي  من البوم درب الصالحين (فوكال) - Alwan Al Taif  ألوان الطيف.mp3'
  }
];

// App State
const state = {
  // Settings
  totalMinutes: 30,
  workSeconds: 30,
  restSeconds: 30,
  prepSeconds: 5,
  nasheedEnabled: true,
  nasheedMasterVolume: 0.85,
  isMuted: false,

  // Workout Runtime
  isRunning: false,
  isPaused: false,
  currentPhase: 'PREP', // 'PREP' | 'WORK' | 'REST' | 'COMPLETE'
  currentSet: 1,
  totalSets: 30,

  // Timing
  phaseDuration: 5,
  phaseRemainingSeconds: 5,
  phaseStartTime: 0,
  lastBeepSecond: -1,
  totalWorkoutSeconds: 30 * 60,
  totalRemainingSeconds: 30 * 60,

  // Audio
  currentTrackIndex: 0,
  isDucked: false,
  audioCtx: null,
  nasheedElement: null,
  nasheedGainNode: null,
  isAudioGraphReady: false,

  // System
  wakeLock: null
};

// ==========================================
// 2. DOM ELEMENTS
// ==========================================
const dom = {
  // Header
  wakelockPill: document.getElementById('wakelockPill'),
  headerVolControl: document.getElementById('headerVolControl'),
  headerVolSlider: document.getElementById('headerVolSlider'),
  headerVolVal: document.getElementById('headerVolVal'),
  headerVolIcon: document.getElementById('headerVolIcon'),
  btnToggleSound: document.getElementById('btnToggleSound'),
  soundIcon: document.getElementById('soundIcon'),
  btnToggleFullscreen: document.getElementById('btnToggleFullscreen'),
  btnQuickSettings: document.getElementById('btnQuickSettings'),

  // Views
  viewArena: document.getElementById('viewArena'),
  viewComplete: document.getElementById('viewComplete'),

  // Arena HUD
  hudTotalRemaining: document.getElementById('hudTotalRemaining'),
  hudPhaseBadge: document.getElementById('hudPhaseBadge'),
  hudPhaseText: document.getElementById('hudPhaseText'),
  hudSetProgress: document.getElementById('hudSetProgress'),
  hudStateLabel: document.getElementById('hudStateLabel'),
  hudIntervalDigits: document.getElementById('hudIntervalDigits'),
  hudSubHint: document.getElementById('hudSubHint'),
  hudSongTitle: document.getElementById('hudSongTitle'),
  hudDuckingIndicator: document.getElementById('hudDuckingIndicator'),
  hudNextPhase: document.getElementById('hudNextPhase'),
  ringProgress: document.getElementById('ringProgress'),
  sessionProgressBar: document.getElementById('sessionProgressBar'),
  equalizerBars: document.getElementById('equalizerBars'),

  // Arena Controls
  btnPauseResume: document.getElementById('btnPauseResume'),
  btnPauseIcon: document.getElementById('btnPauseIcon'),
  btnPauseText: document.getElementById('btnPauseText'),
  btnSkipPhase: document.getElementById('btnSkipPhase'),
  btnRestartInterval: document.getElementById('btnRestartInterval'),
  btnStopWorkout: document.getElementById('btnStopWorkout'),

  // Complete
  sumTotalTime: document.getElementById('sumTotalTime'),
  sumSetsCompleted: document.getElementById('sumSetsCompleted'),
  sumActiveWork: document.getElementById('sumActiveWork'),
  sumActiveRest: document.getElementById('sumActiveRest'),
  btnRestartSession: document.getElementById('btnRestartSession'),
  btnCloseTab: document.getElementById('btnCloseTab'),

  // Modal Settings
  settingsModal: document.getElementById('settingsModal'),
  btnCloseModal: document.getElementById('btnCloseModal'),
  modalTotalMin: document.getElementById('modalTotalMin'),
  modalWorkSec: document.getElementById('modalWorkSec'),
  modalRestSec: document.getElementById('modalRestSec'),
  modalNasheedVol: document.getElementById('modalNasheedVol'),
  modalNasheedVolVal: document.getElementById('modalNasheedVolVal'),
  btnSaveModalSettings: document.getElementById('btnSaveModalSettings')
};

const CIRCUMFERENCE = 1005.3; // 2 * Math.PI * 160


// ==========================================
// 3. AUDIO ENGINE & SYNTHESIZER
// ==========================================
function initAudioEngine() {
  if (state.isAudioGraphReady) return;

  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    state.audioCtx = new AudioContextClass();

    state.nasheedElement = new Audio();
    state.nasheedElement.crossOrigin = 'anonymous';
    state.nasheedElement.preload = 'auto';

    const source = state.audioCtx.createMediaElementSource(state.nasheedElement);
    state.nasheedGainNode = state.audioCtx.createGain();
    state.nasheedGainNode.gain.setValueAtTime(state.nasheedMasterVolume, state.audioCtx.currentTime);

    source.connect(state.nasheedGainNode);
    state.nasheedGainNode.connect(state.audioCtx.destination);

    state.nasheedElement.addEventListener('ended', onTrackEnded);
    state.nasheedElement.addEventListener('error', () => {
      onTrackEnded();
    });

    state.isAudioGraphReady = true;
  } catch (err) {
    console.warn('AudioEngine init note:', err);
  }
}

function loadTrack(index) {
  state.currentTrackIndex = index % NASHEED_PLAYLIST.length;
  const track = NASHEED_PLAYLIST[state.currentTrackIndex];

  if (state.nasheedElement) {
    state.nasheedElement.src = chrome.runtime.getURL(track.file);
  }

  dom.hudSongTitle.textContent = `🎵 ${track.title}`;
}

function onTrackEnded() {
  state.currentTrackIndex = (state.currentTrackIndex + 1) % NASHEED_PLAYLIST.length;
  loadTrack(state.currentTrackIndex);
  if (state.isRunning && !state.isPaused && state.nasheedEnabled) {
    state.nasheedElement.play().catch(() => {});
  }
}

function setNasheedDucking(shouldDuck, immediate = false) {
  if (!state.isAudioGraphReady || !state.nasheedGainNode) return;
  state.isDucked = shouldDuck;

  const now = state.audioCtx.currentTime;
  const rampTime = immediate ? 0.05 : 0.35;
  state.nasheedGainNode.gain.cancelScheduledValues(now);

  if (state.isMuted || !state.nasheedEnabled || state.nasheedMasterVolume <= 0.001) {
    state.nasheedGainNode.gain.setValueAtTime(0, now);
    dom.hudDuckingIndicator.textContent = '🔇 Muted';
    dom.hudDuckingIndicator.className = 'ducking-indicator ducked';
    return;
  }

  if (shouldDuck) {
    const duckedLevel = state.nasheedMasterVolume * 0.18;
    state.nasheedGainNode.gain.linearRampToValueAtTime(duckedLevel, now + rampTime);
    dom.hudDuckingIndicator.textContent = '🔉 Ducked (Countdown)';
    dom.hudDuckingIndicator.className = 'ducking-indicator ducked';
  } else {
    const targetMultiplier = (state.currentPhase === 'REST') ? 0.45 : 1.0;
    const fullLevel = state.nasheedMasterVolume * targetMultiplier;
    state.nasheedGainNode.gain.linearRampToValueAtTime(fullLevel, now + 0.45);
    dom.hudDuckingIndicator.textContent = (state.currentPhase === 'REST') ? '🎵 Calm Rest' : '🔥 Full Energy';
    dom.hudDuckingIndicator.className = 'ducking-indicator';
  }
}

function toBnDigits(n) {
  const bn = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(n).replace(/[0-9]/g, (d) => bn[d]);
}

function updateVolDisplay(vol) {
  const pct = Math.round(vol * 100);
  const bnText = `${toBnDigits(pct)}%`;
  if (dom.headerVolVal) dom.headerVolVal.textContent = bnText;
  if (dom.modalNasheedVolVal) dom.modalNasheedVolVal.textContent = bnText;
  if (dom.headerVolSlider) dom.headerVolSlider.value = vol;
  if (dom.modalNasheedVol) dom.modalNasheedVol.value = vol;

  if (dom.headerVolIcon) {
    if (state.isMuted || vol <= 0.01) {
      dom.headerVolIcon.textContent = '🔇';
    } else if (vol < 0.5) {
      dom.headerVolIcon.textContent = '🔉';
    } else {
      dom.headerVolIcon.textContent = '🔊';
    }
  }
}

function setMasterVolume(vol, immediate = true) {
  state.nasheedMasterVolume = Math.max(0, Math.min(1, vol));
  if (state.nasheedMasterVolume > 0 && state.isMuted) {
    state.isMuted = false;
    if (dom.soundIcon) dom.soundIcon.textContent = '🔊';
    if (dom.headerVolSlider) dom.headerVolSlider.style.opacity = '1';
  }
  updateVolDisplay(state.nasheedMasterVolume);

  if (state.isAudioGraphReady && state.nasheedGainNode) {
    setNasheedDucking(state.isDucked, immediate);
  }
  localStorage.setItem('mb_workout_vol', String(state.nasheedMasterVolume));
}

function playGymTone(type) {
  if (state.isMuted) return;
  if (!state.audioCtx) initAudioEngine();
  if (state.audioCtx && state.audioCtx.state === 'suspended') state.audioCtx.resume();

  const ctx = state.audioCtx;
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.connect(gain);
  gain.connect(ctx.destination);

  if (type === 'tick') {
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(880, now);
    gain.gain.setValueAtTime(0.75, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    osc.start(now);
    osc.stop(now + 0.12);
  } else if (type === 'start') {
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1174.66, now);
    osc.frequency.exponentialRampToValueAtTime(1760, now + 0.25);
    gain.gain.setValueAtTime(0.85, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc.start(now);
    osc.stop(now + 0.35);
  } else if (type === 'rest') {
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(587.33, now + 0.3);
    gain.gain.setValueAtTime(0.75, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    osc.start(now);
    osc.stop(now + 0.4);
  } else if (type === 'victory') {
    [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.connect(g);
      g.connect(ctx.destination);
      o.type = 'triangle';
      o.frequency.value = freq;
      const t = now + (i * 0.14);
      g.gain.setValueAtTime(0.7, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
      o.start(t);
      o.stop(t + 0.25);
    });
  }
}


// ==========================================
// 4. SCREEN WAKELOCK (Keeps Screen Awake)
// ==========================================
async function requestWakeLock() {
  if ('wakeLock' in navigator) {
    try {
      state.wakeLock = await navigator.wakeLock.request('screen');
      dom.wakelockPill.classList.add('active');
      state.wakeLock.addEventListener('release', () => {
        dom.wakelockPill.classList.remove('active');
      });
    } catch (err) {
      dom.wakelockPill.classList.remove('active');
    }
  }
}

function releaseWakeLock() {
  if (state.wakeLock) {
    state.wakeLock.release().catch(() => {});
    state.wakeLock = null;
  }
  dom.wakelockPill.classList.remove('active');
}

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && state.isRunning && !state.isPaused) {
    requestWakeLock();
  }
});


// ==========================================
// 5. WORKOUT TIMER & DELTA ENGINE
// ==========================================
let timerAnimationId = null;

function calculateWorkoutParameters() {
  const oneCycle = state.workSeconds + state.restSeconds;
  state.totalWorkoutSeconds = state.totalMinutes * 60;
  state.totalSets = Math.max(1, Math.floor(state.totalWorkoutSeconds / oneCycle));
  state.totalRemainingSeconds = state.totalWorkoutSeconds;
  state.currentSet = 1;
}

function launchWorkoutDirectly() {
  initAudioEngine();
  if (state.audioCtx && state.audioCtx.state === 'suspended') {
    state.audioCtx.resume();
  }

  calculateWorkoutParameters();

  dom.viewComplete.classList.add('hidden');
  dom.viewArena.classList.remove('hidden');

  state.isRunning = true;
  state.isPaused = false;
  requestWakeLock();

  // Load first track
  loadTrack(0);
  if (state.nasheedEnabled && state.nasheedElement) {
    state.nasheedElement.currentTime = 0;
    state.nasheedElement.play().catch(() => {});
  }

  // Start with 5-second Prep Phase
  transitionToPhase('PREP');
  startTimerLoop();
}

function transitionToPhase(newPhase) {
  state.currentPhase = newPhase;
  state.lastBeepSecond = -1;

  document.body.classList.remove('theme-work', 'theme-rest', 'theme-prep');

  if (newPhase === 'PREP') {
    document.body.classList.add('theme-prep');
    state.phaseDuration = state.prepSeconds;
    state.phaseRemainingSeconds = state.prepSeconds;
    dom.hudPhaseBadge.className = 'arena-phase-badge phase-prep';
    dom.hudPhaseText.textContent = '⚡ প্রস্তুত হন';
    dom.hudStateLabel.textContent = 'GET READY';
    dom.hudSubHint.textContent = 'প্রথম সেটের জন্য তৈরি হোন...';
    dom.hudNextPhase.textContent = `🔥 ${state.workSeconds} সে. ওয়ার্ক`;
    setNasheedDucking(true);
  } else if (newPhase === 'WORK') {
    document.body.classList.add('theme-work');
    state.phaseDuration = state.workSeconds;
    state.phaseRemainingSeconds = state.workSeconds;
    dom.hudPhaseBadge.className = 'arena-phase-badge phase-work';
    dom.hudPhaseText.textContent = '🔥 ব্যায়াম করুন';
    dom.hudStateLabel.textContent = 'WORK OUT';
    dom.hudSubHint.textContent = 'পুশ করুন! সর্বোচ্চ মনোযোগ দিন!';
    dom.hudNextPhase.textContent = `☕ ${state.restSeconds} সে. বিশ্রাম`;
    playGymTone('start');
    setNasheedDucking(false);
  } else if (newPhase === 'REST') {
    document.body.classList.add('theme-rest');
    state.phaseDuration = state.restSeconds;
    state.phaseRemainingSeconds = state.restSeconds;
    dom.hudPhaseBadge.className = 'arena-phase-badge phase-rest';
    dom.hudPhaseText.textContent = '☕ বিশ্রাম নিন';
    dom.hudStateLabel.textContent = 'REST';
    dom.hudSubHint.textContent = 'গভীর শ্বাস নিন, পানি পান করুন...';
    dom.hudNextPhase.textContent = `🔥 ${state.workSeconds} সে. ওয়ার্ক`;
    playGymTone('rest');
    setNasheedDucking(false);
  }

  state.phaseStartTime = Date.now();
  updateHUDDisplays();
}

function startTimerLoop() {
  if (timerAnimationId) cancelAnimationFrame(timerAnimationId);

  let lastTimestamp = performance.now();

  function loop(nowTimestamp) {
    if (!state.isRunning) return;

    if (!state.isPaused) {
      const deltaSec = (nowTimestamp - lastTimestamp) / 1000;
      lastTimestamp = nowTimestamp;

      state.phaseRemainingSeconds -= deltaSec;
      state.totalRemainingSeconds -= deltaSec;

      const wholeSecond = Math.ceil(state.phaseRemainingSeconds);

      // AUDIO DUCKING & COUNTDOWN TRIGGER (In the last 5 seconds)
      if (wholeSecond <= 5 && wholeSecond > 0 && wholeSecond !== state.lastBeepSecond) {
        state.lastBeepSecond = wholeSecond;
        setNasheedDucking(true);
        playGymTone('tick');
      }

      if (state.phaseRemainingSeconds <= 0) {
        handlePhaseAdvance();
      }

      if (state.totalRemainingSeconds <= 0) {
        finishWorkout();
        return;
      }

      updateHUDDisplays();
    } else {
      lastTimestamp = nowTimestamp;
    }

    timerAnimationId = requestAnimationFrame(loop);
  }

  timerAnimationId = requestAnimationFrame(loop);
}

function handlePhaseAdvance() {
  if (state.currentPhase === 'PREP') {
    transitionToPhase('WORK');
  } else if (state.currentPhase === 'WORK') {
    transitionToPhase('REST');
  } else if (state.currentPhase === 'REST') {
    state.currentSet++;
    if (state.currentSet > state.totalSets) {
      finishWorkout();
      return;
    }
    transitionToPhase('WORK');
  }
}

function updateHUDDisplays() {
  const currentSec = Math.max(0, Math.ceil(state.phaseRemainingSeconds));
  const m = Math.floor(currentSec / 60);
  const s = currentSec % 60;
  dom.hudIntervalDigits.textContent = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;

  if (currentSec <= 5 && currentSec > 0) {
    dom.hudIntervalDigits.classList.add('countdown-alert');
  } else {
    dom.hudIntervalDigits.classList.remove('countdown-alert');
  }

  const percentElapsed = Math.min(1, Math.max(0, (state.phaseDuration - state.phaseRemainingSeconds) / state.phaseDuration));
  const dashOffset = CIRCUMFERENCE * percentElapsed;
  dom.ringProgress.style.strokeDashoffset = dashOffset;

  const totalSec = Math.max(0, Math.ceil(state.totalRemainingSeconds));
  const totM = Math.floor(totalSec / 60);
  const totS = totalSec % 60;
  dom.hudTotalRemaining.textContent = `${totM.toString().padStart(2, '0')}:${totS.toString().padStart(2, '0')}`;

  dom.hudSetProgress.textContent = `${state.currentSet} / ${state.totalSets}`;

  const totalSessionElapsed = state.totalWorkoutSeconds - state.totalRemainingSeconds;
  const overallPct = Math.min(100, Math.max(0, (totalSessionElapsed / state.totalWorkoutSeconds) * 100));
  dom.sessionProgressBar.style.width = `${overallPct}%`;
}

function togglePauseResume() {
  if (!state.isRunning) return;

  state.isPaused = !state.isPaused;

  if (state.isPaused) {
    dom.btnPauseIcon.textContent = '▶️';
    dom.btnPauseText.textContent = 'চালু';
    dom.equalizerBars.classList.add('paused');
    if (state.nasheedElement) state.nasheedElement.pause();
    releaseWakeLock();
  } else {
    dom.btnPauseIcon.textContent = '⏸️';
    dom.btnPauseText.textContent = 'পজ';
    dom.equalizerBars.classList.remove('paused');
    if (state.nasheedEnabled && state.nasheedElement) state.nasheedElement.play().catch(() => {});
    requestWakeLock();
  }
}

function skipPhase() {
  if (!state.isRunning) return;
  handlePhaseAdvance();
}

function restartInterval() {
  if (!state.isRunning) return;
  state.phaseRemainingSeconds = state.phaseDuration;
  state.lastBeepSecond = -1;
  setNasheedDucking(false);
  updateHUDDisplays();
}

function finishWorkout() {
  state.isRunning = false;
  releaseWakeLock();

  if (timerAnimationId) cancelAnimationFrame(timerAnimationId);

  if (state.nasheedGainNode && state.audioCtx) {
    const now = state.audioCtx.currentTime;
    state.nasheedGainNode.gain.cancelScheduledValues(now);
    state.nasheedGainNode.gain.linearRampToValueAtTime(0, now + 1.2);
    setTimeout(() => {
      if (state.nasheedElement) state.nasheedElement.pause();
    }, 1200);
  }

  playGymTone('victory');

  const totalSecsSpent = Math.min(state.totalWorkoutSeconds, Math.round(state.totalWorkoutSeconds - state.totalRemainingSeconds));
  const totM = Math.floor(totalSecsSpent / 60);
  const totS = totalSecsSpent % 60;
  dom.sumTotalTime.textContent = `${totM.toString().padStart(2, '0')}:${totS.toString().padStart(2, '0')}`;
  dom.sumSetsCompleted.textContent = String(state.currentSet);

  const completedWorkSec = state.currentSet * state.workSeconds;
  dom.sumActiveWork.textContent = `${Math.floor(completedWorkSec / 60)}:${(completedWorkSec % 60).toString().padStart(2, '0')}`;

  const completedRestSec = Math.max(0, totalSecsSpent - completedWorkSec);
  dom.sumActiveRest.textContent = `${Math.floor(completedRestSec / 60)}:${(completedRestSec % 60).toString().padStart(2, '0')}`;

  dom.viewArena.classList.add('hidden');
  dom.viewComplete.classList.remove('hidden');
}


// ==========================================
// 6. EVENT LISTENERS & USER CONTROLS
// ==========================================
dom.btnPauseResume.addEventListener('click', togglePauseResume);
dom.btnSkipPhase.addEventListener('click', skipPhase);
dom.btnRestartInterval.addEventListener('click', restartInterval);
dom.btnStopWorkout.addEventListener('click', () => {
  if (confirm('আপনি কি সত্যিই ওয়ার্কআউট সেশন সমাপ্ত করতে চান?')) {
    finishWorkout();
  }
});

dom.btnRestartSession.addEventListener('click', launchWorkoutDirectly);
dom.btnCloseTab.addEventListener('click', () => {
  window.close();
});

// Sound Toggle (Mute / Unmute)
dom.btnToggleSound.addEventListener('click', () => {
  state.isMuted = !state.isMuted;
  if (state.isMuted) {
    dom.soundIcon.textContent = '🔇';
    if (dom.headerVolIcon) dom.headerVolIcon.textContent = '🔇';
    if (dom.headerVolSlider) dom.headerVolSlider.style.opacity = '0.5';
    if (state.nasheedGainNode && state.audioCtx) {
      state.nasheedGainNode.gain.cancelScheduledValues(state.audioCtx.currentTime);
      state.nasheedGainNode.gain.setValueAtTime(0, state.audioCtx.currentTime);
    }
    dom.hudDuckingIndicator.textContent = '🔇 Muted';
    dom.hudDuckingIndicator.className = 'ducking-indicator ducked';
  } else {
    dom.soundIcon.textContent = '🔊';
    if (dom.headerVolSlider) dom.headerVolSlider.style.opacity = '1';
    if (state.nasheedMasterVolume <= 0.05) {
      state.nasheedMasterVolume = 0.85;
    }
    updateVolDisplay(state.nasheedMasterVolume);
    setNasheedDucking(state.isDucked, true);
  }
});

// Live Header Volume Control
if (dom.headerVolSlider) {
  dom.headerVolSlider.addEventListener('input', () => {
    const v = parseFloat(dom.headerVolSlider.value);
    setMasterVolume(v, true);
  });
}

if (dom.headerVolIcon) {
  dom.headerVolIcon.addEventListener('click', () => {
    dom.btnToggleSound.click();
  });
}

// Fullscreen Toggle
dom.btnToggleFullscreen.addEventListener('click', () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(() => {});
  } else {
    document.exitFullscreen().catch(() => {});
  }
});

// Floating Settings Modal
dom.btnQuickSettings.addEventListener('click', () => {
  dom.modalTotalMin.value = state.totalMinutes;
  dom.modalWorkSec.value = state.workSeconds;
  dom.modalRestSec.value = state.restSeconds;
  dom.modalNasheedVol.value = state.nasheedMasterVolume;
  if (dom.modalNasheedVolVal) {
    dom.modalNasheedVolVal.textContent = `${toBnDigits(Math.round(state.nasheedMasterVolume * 100))}%`;
  }
  dom.settingsModal.classList.remove('hidden');
});

if (dom.modalNasheedVol) {
  dom.modalNasheedVol.addEventListener('input', () => {
    const v = parseFloat(dom.modalNasheedVol.value);
    setMasterVolume(v, true);
  });
}

dom.btnCloseModal.addEventListener('click', () => {
  dom.settingsModal.classList.add('hidden');
});

dom.btnSaveModalSettings.addEventListener('click', () => {
  state.totalMinutes = Math.max(1, parseInt(dom.modalTotalMin.value, 10) || 30);
  state.workSeconds = Math.max(5, parseInt(dom.modalWorkSec.value, 10) || 30);
  state.restSeconds = Math.max(5, parseInt(dom.modalRestSec.value, 10) || 30);
  const vol = parseFloat(dom.modalNasheedVol.value);
  setMasterVolume(isNaN(vol) ? 0.85 : vol, true);

  dom.settingsModal.classList.add('hidden');
  launchWorkoutDirectly();
});

// Keyboard Shortcuts
window.addEventListener('keydown', (e) => {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;

  if (e.code === 'Space') {
    e.preventDefault();
    if (!state.isRunning) {
      launchWorkoutDirectly();
    } else {
      togglePauseResume();
    }
  } else if (e.code === 'ArrowRight' || e.key === 'n' || e.key === 'N') {
    skipPhase();
  } else if (e.key === 'f' || e.key === 'F') {
    dom.btnToggleFullscreen.click();
  } else if (e.key === 'm' || e.key === 'M') {
    dom.btnToggleSound.click();
  } else if (e.code === 'Escape' && state.isRunning) {
    dom.btnStopWorkout.click();
  }
});


// ==========================================
// 7. INITIALIZATION (DIRECT ARENA LAUNCH)
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);

  if (urlParams.has('total')) state.totalMinutes = parseInt(urlParams.get('total'), 10) || 30;
  if (urlParams.has('work')) state.workSeconds = parseInt(urlParams.get('work'), 10) || 30;
  if (urlParams.has('rest')) state.restSeconds = parseInt(urlParams.get('rest'), 10) || 30;
  if (urlParams.has('nasheed')) state.nasheedEnabled = (urlParams.get('nasheed') !== '0');

  const savedVol = localStorage.getItem('mb_workout_vol');
  if (urlParams.has('volume')) {
    state.nasheedMasterVolume = Math.max(0, Math.min(1, parseFloat(urlParams.get('volume')) || 0.85));
  } else if (savedVol !== null) {
    state.nasheedMasterVolume = Math.max(0, Math.min(1, parseFloat(savedVol) || 0.85));
  }
  updateVolDisplay(state.nasheedMasterVolume);

  // Immediately Launch Arena Directly! (No intermediate setup clutter)
  launchWorkoutDirectly();
});
