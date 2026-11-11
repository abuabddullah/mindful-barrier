/**
 * MindfulBarrier — High-Performance Interval Workout Engine & Nasheed Ducking System
 * Built with Web Audio API, Delta Clock, and Screen WakeLock.
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
  sessionStartTime: 0,
  pausedElapsedOffset: 0,
  
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
  btnToggleSound: document.getElementById('btnToggleSound'),
  soundIcon: document.getElementById('soundIcon'),
  btnToggleFullscreen: document.getElementById('btnToggleFullscreen'),
  btnOpenSetup: document.getElementById('btnOpenSetup'),

  // Views
  viewSetup: document.getElementById('viewSetup'),
  viewArena: document.getElementById('viewArena'),
  viewComplete: document.getElementById('viewComplete'),

  // Setup Form
  presetChips: document.querySelectorAll('.preset-chip'),
  sliderTotalMinutes: document.getElementById('sliderTotalMinutes'),
  valTotalMinutes: document.getElementById('valTotalMinutes'),
  sliderWorkSeconds: document.getElementById('sliderWorkSeconds'),
  valWorkSeconds: document.getElementById('valWorkSeconds'),
  sliderRestSeconds: document.getElementById('sliderRestSeconds'),
  valRestSeconds: document.getElementById('valRestSeconds'),
  radioPrepTimes: document.querySelectorAll('input[name="prepTime"]'),
  valPrepSeconds: document.getElementById('valPrepSeconds'),
  chkEnableNasheed: document.getElementById('chkEnableNasheed'),
  sliderNasheedVolume: document.getElementById('sliderNasheedVolume'),
  valNasheedVolume: document.getElementById('valNasheedVolume'),
  calcTotalSets: document.getElementById('calcTotalSets'),
  calcActiveWork: document.getElementById('calcActiveWork'),
  calcActiveRest: document.getElementById('calcActiveRest'),
  btnStartWorkout: document.getElementById('btnStartWorkout'),

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
  btnStartNewWorkout: document.getElementById('btnStartNewWorkout')
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

    // Create Nasheed Audio Element
    state.nasheedElement = new Audio();
    state.nasheedElement.crossOrigin = 'anonymous';
    state.nasheedElement.preload = 'auto';

    // Connect Nasheed through Web Audio Gain Node for Ducking
    const source = state.audioCtx.createMediaElementSource(state.nasheedElement);
    state.nasheedGainNode = state.audioCtx.createGain();
    state.nasheedGainNode.gain.setValueAtTime(state.nasheedMasterVolume, state.audioCtx.currentTime);

    source.connect(state.nasheedGainNode);
    state.nasheedGainNode.connect(state.audioCtx.destination);

    // Continuous Playlist Looping
    state.nasheedElement.addEventListener('ended', onTrackEnded);
    state.nasheedElement.addEventListener('error', (e) => {
      console.warn('Nasheed playback error, attempting next track:', e);
      onTrackEnded();
    });

    state.isAudioGraphReady = true;
  } catch (err) {
    console.warn('Web Audio API initialization note:', err);
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

// Ducking: Smoothly Lower or Raise Nasheed Volume
function setNasheedDucking(shouldDuck, immediate = false) {
  if (!state.isAudioGraphReady || !state.nasheedGainNode) return;
  state.isDucked = shouldDuck;

  const now = state.audioCtx.currentTime;
  const rampTime = immediate ? 0.05 : 0.35;
  state.nasheedGainNode.gain.cancelScheduledValues(now);

  if (state.isMuted || !state.nasheedEnabled) {
    state.nasheedGainNode.gain.setValueAtTime(0, now);
    dom.hudDuckingIndicator.textContent = '🔇 Muted';
    dom.hudDuckingIndicator.className = 'ducking-indicator ducked';
    return;
  }

  if (shouldDuck) {
    // Drop to 18% of user volume for clear countdown beeps
    const duckedLevel = state.nasheedMasterVolume * 0.20;
    state.nasheedGainNode.gain.linearRampToValueAtTime(duckedLevel, now + rampTime);
    dom.hudDuckingIndicator.textContent = '🔉 Ducked (Countdown)';
    dom.hudDuckingIndicator.className = 'ducking-indicator ducked';
  } else {
    // Normal level: Full for Work (100%), Medium for Rest (50%)
    const targetMultiplier = (state.currentPhase === 'REST') ? 0.50 : 1.0;
    const fullLevel = state.nasheedMasterVolume * targetMultiplier;
    state.nasheedGainNode.gain.linearRampToValueAtTime(fullLevel, now + 0.5);
    dom.hudDuckingIndicator.textContent = (state.currentPhase === 'REST') ? '🎵 Calm Rest' : '🔥 Full Energy';
    dom.hudDuckingIndicator.className = 'ducking-indicator';
  }
}

// Crisp Synthesized Gym Beeps (No external wav file dependencies!)
function playGymTone(type) {
  if (state.isMuted) return;
  if (!state.audioCtx) initAudioEngine();
  if (state.audioCtx.state === 'suspended') state.audioCtx.resume();

  const ctx = state.audioCtx;
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.connect(gain);
  gain.connect(ctx.destination);

  if (type === 'tick') {
    // 5, 4, 3, 2, 1 Countdown Beep: A5 (880Hz), short sharp pop
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(880, now);
    gain.gain.setValueAtTime(0.7, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    osc.start(now);
    osc.stop(now + 0.12);
  } else if (type === 'start') {
    // Work / GO! Chime: Dual Rising Tone (1174Hz -> 1760Hz)
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1174.66, now);
    osc.frequency.exponentialRampToValueAtTime(1760, now + 0.25);
    gain.gain.setValueAtTime(0.85, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc.start(now);
    osc.stop(now + 0.35);
  } else if (type === 'rest') {
    // Rest Transition Chime: Descending soothing tone (880Hz -> 587Hz)
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(587.33, now + 0.3);
    gain.gain.setValueAtTime(0.75, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    osc.start(now);
    osc.stop(now + 0.4);
  } else if (type === 'victory') {
    // Fanfare sequence
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
// 4. SCREEN WAKELOCK (No Screen Timeout)
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
// 5. WORKOUT TIMER LOGIC & DELTA ENGINE
// ==========================================
let timerAnimationId = null;

function recalculateSetupSummary() {
  const totalMins = Number(dom.sliderTotalMinutes.value);
  const workSecs = Number(dom.sliderWorkSeconds.value);
  const restSecs = Number(dom.sliderRestSeconds.value);
  const oneCycle = workSecs + restSecs;

  const totalWorkoutSecs = totalMins * 60;
  const numSets = Math.max(1, Math.floor(totalWorkoutSecs / oneCycle));
  const activeWorkSecs = numSets * workSecs;
  const activeRestSecs = totalWorkoutSecs - activeWorkSecs;

  state.totalMinutes = totalMins;
  state.workSeconds = workSecs;
  state.restSeconds = restSecs;
  state.totalSets = numSets;

  dom.valTotalMinutes.textContent = `${totalMins} মিনিট`;
  dom.valWorkSeconds.textContent = `${workSecs} সেকেন্ড`;
  dom.valRestSeconds.textContent = `${restSecs} সেকেন্ড`;

  dom.calcTotalSets.textContent = `${numSets}টি সেট`;
  dom.calcActiveWork.textContent = `${Math.round(activeWorkSecs / 60)} মিনিট`;
  dom.calcActiveRest.textContent = `${Math.round(activeRestSecs / 60)} মিনিট`;
}

function startWorkout() {
  initAudioEngine();
  if (state.audioCtx && state.audioCtx.state === 'suspended') {
    state.audioCtx.resume();
  }

  // Get configuration
  recalculateSetupSummary();
  const selectedPrep = document.querySelector('input[name="prepTime"]:checked');
  state.prepSeconds = selectedPrep ? Number(selectedPrep.value) : 5;
  state.totalWorkoutSeconds = state.totalMinutes * 60;
  state.totalRemainingSeconds = state.totalWorkoutSeconds;
  state.currentSet = 1;

  // Switch View to Arena
  dom.viewSetup.classList.add('hidden');
  dom.viewComplete.classList.add('hidden');
  dom.viewArena.classList.remove('hidden');

  state.isRunning = true;
  state.isPaused = false;
  requestWakeLock();

  // Load first nasheed and start playback with ducked volume for initial prep
  loadTrack(0);
  if (state.nasheedEnabled && state.nasheedElement) {
    state.nasheedElement.currentTime = 0;
    state.nasheedElement.play().catch(e => console.log('Autoplay handled:', e));
  }

  // Start Phase: PREP
  transitionToPhase('PREP');
  state.sessionStartTime = Date.now();

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
    dom.hudSubHint.textContent = `প্রথম সেটের জন্য তৈরি হোন...`;
    dom.hudNextPhase.textContent = `🔥 ${state.workSeconds} সে. ওয়ার্কআউট`;
    setNasheedDucking(true); // Nasheed is low during prep countdown
  } 
  else if (newPhase === 'WORK') {
    document.body.classList.add('theme-work');
    state.phaseDuration = state.workSeconds;
    state.phaseRemainingSeconds = state.workSeconds;
    dom.hudPhaseBadge.className = 'arena-phase-badge phase-work';
    dom.hudPhaseText.textContent = '🔥 ব্যায়াম করুন';
    dom.hudStateLabel.textContent = 'WORK OUT';
    dom.hudSubHint.textContent = `পুশ করুন! সর্বোচ্চ মনোযোগ দিন!`;
    dom.hudNextPhase.textContent = `☕ ${state.restSeconds} সে. বিশ্রাম`;
    playGymTone('start');
    setNasheedDucking(false); // Nasheed pumps up to 100%!
  } 
  else if (newPhase === 'REST') {
    document.body.classList.add('theme-rest');
    state.phaseDuration = state.restSeconds;
    state.phaseRemainingSeconds = state.restSeconds;
    dom.hudPhaseBadge.className = 'arena-phase-badge phase-rest';
    dom.hudPhaseText.textContent = '☕ বিশ্রাম নিন';
    dom.hudStateLabel.textContent = 'REST';
    dom.hudSubHint.textContent = `গভীর শ্বাস নিন, পানি পান করুন...`;
    dom.hudNextPhase.textContent = `🔥 ${state.workSeconds} সে. ওয়ার্কআউট`;
    playGymTone('rest');
    setNasheedDucking(false); // Nasheed plays calmly during rest
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
        setNasheedDucking(true); // Duck nasheed volume for beeps
        playGymTone('tick');    // Crisp countdown beep
      }

      // Check Phase Completion
      if (state.phaseRemainingSeconds <= 0) {
        handlePhaseAdvance();
      }

      // Check Session Complete
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
  // 1. Interval Timer Display
  const currentSec = Math.max(0, Math.ceil(state.phaseRemainingSeconds));
  const m = Math.floor(currentSec / 60);
  const s = currentSec % 60;
  dom.hudIntervalDigits.textContent = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;

  // Countdown Alert Class (last 5 seconds flash)
  if (currentSec <= 5 && currentSec > 0) {
    dom.hudIntervalDigits.classList.add('countdown-alert');
  } else {
    dom.hudIntervalDigits.classList.remove('countdown-alert');
  }

  // 2. SVG Ring Progress (Depleting smooth ring)
  const percentElapsed = Math.min(1, Math.max(0, (state.phaseDuration - state.phaseRemainingSeconds) / state.phaseDuration));
  const dashOffset = CIRCUMFERENCE * percentElapsed;
  dom.ringProgress.style.strokeDashoffset = dashOffset;

  // 3. Total Time Display
  const totalSec = Math.max(0, Math.ceil(state.totalRemainingSeconds));
  const totM = Math.floor(totalSec / 60);
  const totS = totalSec % 60;
  dom.hudTotalRemaining.textContent = `${totM.toString().padStart(2, '0')}:${totS.toString().padStart(2, '0')}`;

  // 4. Set Progress
  dom.hudSetProgress.textContent = `${state.currentSet} / ${state.totalSets}`;

  // 5. Overall Progress Bar
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

  // Stop Nasheed with gentle fadeout
  if (state.nasheedGainNode && state.audioCtx) {
    const now = state.audioCtx.currentTime;
    state.nasheedGainNode.gain.cancelScheduledValues(now);
    state.nasheedGainNode.gain.linearRampToValueAtTime(0, now + 1.5);
    setTimeout(() => {
      if (state.nasheedElement) state.nasheedElement.pause();
    }, 1500);
  }

  playGymTone('victory');

  // Summary Metrics
  const totalSecsSpent = Math.min(state.totalWorkoutSeconds, Math.round(state.totalWorkoutSeconds - state.totalRemainingSeconds));
  const totM = Math.floor(totalSecsSpent / 60);
  const totS = totalSecsSpent % 60;
  dom.sumTotalTime.textContent = `${totM.toString().padStart(2, '0')}:${totS.toString().padStart(2, '0')}`;
  dom.sumSetsCompleted.textContent = String(state.currentSet);

  const completedWorkSec = state.currentSet * state.workSeconds;
  dom.sumActiveWork.textContent = `${Math.floor(completedWorkSec / 60)}:${(completedWorkSec % 60).toString().padStart(2, '0')}`;

  const completedRestSec = Math.max(0, totalSecsSpent - completedWorkSec);
  dom.sumActiveRest.textContent = `${Math.floor(completedRestSec / 60)}:${(completedRestSec % 60).toString().padStart(2, '0')}`;

  // Switch to Complete View
  dom.viewArena.classList.add('hidden');
  dom.viewComplete.classList.remove('hidden');
}


// ==========================================
// 6. EVENT LISTENERS & USER CONTROLS
// ==========================================
// Setup Input Listeners
dom.sliderTotalMinutes.addEventListener('input', recalculateSetupSummary);
dom.sliderWorkSeconds.addEventListener('input', recalculateSetupSummary);
dom.sliderRestSeconds.addEventListener('input', recalculateSetupSummary);

// Preset Chips Click
dom.presetChips.forEach(chip => {
  chip.addEventListener('click', () => {
    dom.presetChips.forEach(c => c.classList.remove('active'));
    chip.classList.add('active');

    const w = chip.dataset.work;
    const r = chip.dataset.rest;
    const t = chip.dataset.total;

    dom.sliderWorkSeconds.value = w;
    dom.sliderRestSeconds.value = r;
    dom.sliderTotalMinutes.value = t;

    recalculateSetupSummary();
  });
});

// Prep Radios
dom.radioPrepTimes.forEach(radio => {
  radio.addEventListener('change', () => {
    document.querySelectorAll('.radio-chip').forEach(c => c.classList.remove('selected'));
    radio.closest('.radio-chip').classList.add('selected');
    dom.valPrepSeconds.textContent = `${radio.value} সেকেন্ড`;
  });
});

// Nasheed Toggle & Volume
dom.chkEnableNasheed.addEventListener('change', () => {
  state.nasheedEnabled = dom.chkEnableNasheed.checked;
  if (!state.nasheedEnabled && state.nasheedElement) {
    state.nasheedElement.pause();
    dom.equalizerBars.classList.add('paused');
  } else if (state.nasheedEnabled && state.isRunning && !state.isPaused && state.nasheedElement) {
    state.nasheedElement.play().catch(() => {});
    dom.equalizerBars.classList.remove('paused');
  }
});

dom.sliderNasheedVolume.addEventListener('input', () => {
  const vol = parseFloat(dom.sliderNasheedVolume.value);
  state.nasheedMasterVolume = vol;
  dom.valNasheedVolume.textContent = `${Math.round(vol * 100)}%`;
  if (state.nasheedGainNode && !state.isDucked && !state.isMuted) {
    state.nasheedGainNode.gain.setValueAtTime(vol, state.audioCtx.currentTime);
  }
});

// Launch Button
dom.btnStartWorkout.addEventListener('click', startWorkout);
dom.btnStartNewWorkout.addEventListener('click', () => {
  dom.viewComplete.classList.add('hidden');
  dom.viewSetup.classList.remove('hidden');
});

// Arena Buttons
dom.btnPauseResume.addEventListener('click', togglePauseResume);
dom.btnSkipPhase.addEventListener('click', skipPhase);
dom.btnRestartInterval.addEventListener('click', restartInterval);
dom.btnStopWorkout.addEventListener('click', () => {
  if (confirm('আপনি কি সত্যিই ওয়ার্কআউট সেশন সমাপ্ত করতে চান?')) {
    finishWorkout();
  }
});

dom.btnOpenSetup.addEventListener('click', () => {
  if (state.isRunning) {
    if (confirm('সেটিংস পরিবর্তন করতে চান? বর্তমান সেশন পজ করা হবে।')) {
      togglePauseResume();
      dom.viewArena.classList.add('hidden');
      dom.viewSetup.classList.remove('hidden');
    }
  }
});

// Sound Toggle (Mute / Unmute)
dom.btnToggleSound.addEventListener('click', () => {
  state.isMuted = !state.isMuted;
  if (state.isMuted) {
    dom.soundIcon.textContent = '🔇';
    if (state.nasheedGainNode) state.nasheedGainNode.gain.setValueAtTime(0, state.audioCtx.currentTime);
  } else {
    dom.soundIcon.textContent = '🔊';
    setNasheedDucking(state.isDucked, true);
  }
});

// Fullscreen Toggle
dom.btnToggleFullscreen.addEventListener('click', () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(() => {});
  } else {
    document.exitFullscreen().catch(() => {});
  }
});

// Keyboard Shortcuts (Space, Right, F, M, Escape)
window.addEventListener('keydown', (e) => {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;

  if (e.code === 'Space') {
    e.preventDefault();
    if (dom.viewSetup.classList.contains('hidden') && !dom.viewComplete.classList.contains('hidden')) {
      return;
    }
    if (!state.isRunning) {
      startWorkout();
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
// 7. INITIALIZATION & URL PARAMS
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  // Check URL parameters for quick launch from popup
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has('total')) dom.sliderTotalMinutes.value = urlParams.get('total');
  if (urlParams.has('work')) dom.sliderWorkSeconds.value = urlParams.get('work');
  if (urlParams.has('rest')) dom.sliderRestSeconds.value = urlParams.get('rest');

  recalculateSetupSummary();

  // If auto-start requested
  if (urlParams.get('autostart') === 'true') {
    startWorkout();
  }
});
