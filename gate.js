/**
 * MindfulBarrier - 10-Step Friction Gate Engine
 */

// Parse query params
const urlParams = new URLSearchParams(window.location.search);
const targetUrl = urlParams.get('target') || 'https://facebook.com';
const targetDomain = urlParams.get('domain') || 'facebook.com';
const isExpired = urlParams.get('expired') === 'true';

// DOM Elements
const targetDomainBadge = document.getElementById('targetDomainBadge');
const stepTitleText = document.getElementById('stepTitleText');
const stepCounterText = document.getElementById('stepCounterText');
const progressBarFill = document.getElementById('progressBarFill');
const tabWarningBanner = document.getElementById('tabWarningBanner');

// Global state
let currentStep = 1;
let selectedDurationMinutes = 5;
let isTabActive = true;

// Set target domain badge
if (targetDomainBadge) {
  targetDomainBadge.textContent = targetDomain;
}

// -------------------------------------------------------------
// ANTI-CHEAT MECHANISMS
// -------------------------------------------------------------

// Disable paste globally on this page (User must type deliberately)
document.addEventListener('paste', (e) => {
  e.preventDefault();
  alert('🚫 কপি-পেস্ট নিষিদ্ধ! অনুগ্রহ করে নিজে হাত দিয়ে টাইপ করুন।');
});

// Disable context menu
document.addEventListener('contextmenu', (e) => {
  e.preventDefault();
});

// Detect tab blur / visibility change (Stops users from switching tabs during timers)
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    isTabActive = false;
    tabWarningBanner.classList.remove('hidden');
  } else {
    isTabActive = true;
    setTimeout(() => {
      tabWarningBanner.classList.add('hidden');
    }, 4000);
  }
});

// Global Cancel / Abort actions
function abortAndCloseTab() {
  chrome.runtime.sendMessage({ type: 'ABORT_SESSION', domain: targetDomain }, () => {
    window.close();
  });
}

document.getElementById('btnCancelGlobal').addEventListener('click', abortAndCloseTab);
document.getElementById('btnAbortHero').addEventListener('click', abortAndCloseTab);

// -------------------------------------------------------------
// STEP NAVIGATION CONTROLLER
// -------------------------------------------------------------

const stepTitles = [
  'ধাপ ১: শ্বাস নিন ও শান্ত হোন',
  'ধাপ ২: প্রবেশের কারণ স্পষ্টভাবে লিখুন',
  'ধাপ ৩: অ্যান্টি-ডোপামিন অঙ্গীকারনামা',
  'ধাপ ৪: কগনিটিভ ব্রেন অ্যাক্টিভেশন',
  'ধাপ ৫: শারীরিক সচেতনতা ও বিরতি',
  'ধাপ ৬: কঠোর সময়সীমা নির্ধারণ',
  'ধাপ ৭: সময়ের আর্থিক ক্ষতি গণনা',
  'ধাপ ৮: রিভার্স কগনিটিভ টেস্ট',
  'ধাপ ৯: সিদ্ধান্ত নিন — ফিরে যাবেন নাকি ঢুকবেন?',
  'ধাপ ১০: চূড়ান্ত সচেতনতা ও আনলক'
];

function goToStep(stepNumber) {
  currentStep = stepNumber;

  // Update Header progress
  stepCounterText.textContent = `${stepNumber} / 10`;
  stepTitleText.textContent = stepTitles[stepNumber - 1];
  progressBarFill.style.width = `${stepNumber * 10}%`;

  // Hide all step panes
  document.querySelectorAll('.step-pane').forEach((pane) => {
    pane.classList.remove('active');
  });

  // Activate current pane
  const currentPane = document.getElementById(`step${stepNumber}`);
  if (currentPane) {
    currentPane.classList.add('active');
  }

  // Trigger step initialization
  initStep(stepNumber);
}

function initStep(stepNumber) {
  switch (stepNumber) {
    case 1:
      startStep1Cooldown();
      break;
    case 3:
      initStep3Oath();
      break;
    case 4:
      generateMathProblems();
      break;
    case 5:
      startStep5PhysicalBreak();
      break;
    case 7:
      initStep7Cost();
      break;
    case 8:
      initStep8Reverse();
      break;
    case 10:
      startStep10FinalCountdown();
      break;
  }
}

// -------------------------------------------------------------
// STEP 1: BREATHING & 30s COOLDOWN
// -------------------------------------------------------------
let step1SecondsLeft = 30;
let step1Interval = null;

function startStep1Cooldown() {
  const cooldownTimer = document.getElementById('cooldownTimer');
  const btnStep1Next = document.getElementById('btnStep1Next');
  const breathingText = document.getElementById('breathingText');

  const breathingPhases = [
    { text: 'শ্বাস নিন...', duration: 4 },
    { text: 'ধরে রাখুন...', duration: 4 },
    { text: 'শ্বাস ছাড়ুন...', duration: 4 }
  ];
  let phaseIdx = 0;
  let phaseElapsed = 0;

  if (step1Interval) clearInterval(step1Interval);

  step1Interval = setInterval(() => {
    if (!isTabActive) return; // Pause timer if user leaves tab

    step1SecondsLeft--;
    phaseElapsed++;

    // Breathing text cycle
    if (phaseElapsed >= breathingPhases[phaseIdx].duration) {
      phaseElapsed = 0;
      phaseIdx = (phaseIdx + 1) % breathingPhases.length;
      breathingText.textContent = breathingPhases[phaseIdx].text;
    }

    const mins = Math.floor(step1SecondsLeft / 60);
    const secs = step1SecondsLeft % 60;
    cooldownTimer.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

    if (step1SecondsLeft <= 0) {
      clearInterval(step1Interval);
      btnStep1Next.disabled = false;
      cooldownTimer.textContent = '০০:০০ (সম্পন্ন)';
      breathingText.textContent = 'মন শান্ত হয়েছে';
    }
  }, 1000);

  btnStep1Next.onclick = () => goToStep(2);
}

// -------------------------------------------------------------
// STEP 2: WRITTEN JUSTIFICATION
// -------------------------------------------------------------
const justificationText = document.getElementById('justificationText');
const charCount = document.getElementById('charCount');
const btnStep2Next = document.getElementById('btnStep2Next');

justificationText.addEventListener('input', () => {
  const len = justificationText.value.trim().length;
  charCount.textContent = len;
  if (len >= 40) {
    btnStep2Next.disabled = false;
  } else {
    btnStep2Next.disabled = true;
  }
});

btnStep2Next.onclick = () => goToStep(3);

// -------------------------------------------------------------
// STEP 3: OATH VERIFICATION
// -------------------------------------------------------------
function initStep3Oath() {
  const oathInputText = document.getElementById('oathInputText');
  const oathMatchStatus = document.getElementById('oathMatchStatus');
  const btnStep3Next = document.getElementById('btnStep3Next');
  const referenceText = document.getElementById('oathReferenceText').textContent.trim();

  // Normalize Bengali spaces/punctuation for reliable matching
  function clean(str) {
    return str.replace(/\s+/g, ' ').trim();
  }

  oathInputText.addEventListener('input', () => {
    const inputClean = clean(oathInputText.value);
    const refClean = clean(referenceText);

    if (inputClean === refClean) {
      oathMatchStatus.textContent = '✓ অঙ্গীকার হুবহু মিলেছে!';
      oathMatchStatus.className = 'match-status valid';
      btnStep3Next.disabled = false;
    } else {
      const matchLength = [...inputClean].filter((char, i) => char === refClean[i]).length;
      const percent = Math.min(100, Math.round((matchLength / refClean.length) * 100));
      oathMatchStatus.textContent = `মিল: ${percent}% (হুবহু মিলতে হবে)`;
      oathMatchStatus.className = 'match-status invalid';
      btnStep3Next.disabled = true;
    }
  });

  btnStep3Next.onclick = () => goToStep(4);
}

// -------------------------------------------------------------
// STEP 4: COGNITIVE MATH CHALLENGE
// -------------------------------------------------------------
let mathSolutions = [0, 0, 0];

function generateMathProblems() {
  // Problem 1: (a * b) - c
  const a = Math.floor(Math.random() * 20) + 15; // 15-34
  const b = Math.floor(Math.random() * 6) + 4;   // 4-9
  const c = Math.floor(Math.random() * 40) + 20; // 20-59
  mathSolutions[0] = (a * b) - c;
  document.getElementById('mathQ1').textContent = `(${a} × ${b}) - ${c} =`;

  // Problem 2: (d + e) / f
  const f = Math.floor(Math.random() * 5) + 3; // 3-7
  const mult = Math.floor(Math.random() * 30) + 20;
  const total = f * mult;
  const d = Math.floor(total * 0.6);
  const e = total - d;
  mathSolutions[1] = mult;
  document.getElementById('mathQ2').textContent = `(${d} + ${e}) ÷ ${f} =`;

  // Problem 3: (g * h) - i
  const g = Math.floor(Math.random() * 15) + 12;
  const h = Math.floor(Math.random() * 5) + 4;
  const i = Math.floor(Math.random() * 30) + 10;
  mathSolutions[2] = (g * h) - i;
  document.getElementById('mathQ3').textContent = `(${g} × ${h}) - ${i} =`;

  // Hook validation
  ['mathA1', 'mathA2', 'mathA3'].forEach((id, idx) => {
    const input = document.getElementById(id);
    input.value = '';
    input.addEventListener('input', validateMath);
  });
}

function validateMath() {
  const ans1 = parseInt(document.getElementById('mathA1').value, 10);
  const ans2 = parseInt(document.getElementById('mathA2').value, 10);
  const ans3 = parseInt(document.getElementById('mathA3').value, 10);

  const status1 = document.getElementById('mathStatus1');
  const status2 = document.getElementById('mathStatus2');
  const status3 = document.getElementById('mathStatus3');

  const ok1 = ans1 === mathSolutions[0];
  const ok2 = ans2 === mathSolutions[1];
  const ok3 = ans3 === mathSolutions[2];

  status1.textContent = ok1 ? '✓' : (ans1 ? '✕' : '');
  status1.style.color = ok1 ? '#10b981' : '#f43f5e';

  status2.textContent = ok2 ? '✓' : (ans2 ? '✕' : '');
  status2.style.color = ok2 ? '#10b981' : '#f43f5e';

  status3.textContent = ok3 ? '✓' : (ans3 ? '✕' : '');
  status3.style.color = ok3 ? '#10b981' : '#f43f5e';

  const btnStep4Next = document.getElementById('btnStep4Next');
  if (ok1 && ok2 && ok3) {
    btnStep4Next.disabled = false;
  } else {
    btnStep4Next.disabled = true;
  }
}

document.getElementById('btnStep4Next').onclick = () => goToStep(5);

// -------------------------------------------------------------
// STEP 5: PHYSICAL RESET (60s TIMER)
// -------------------------------------------------------------
let step5SecondsLeft = 60;
let step5Interval = null;

function startStep5PhysicalBreak() {
  const timerElem = document.getElementById('physicalTimer');
  const btnStep5Next = document.getElementById('btnStep5Next');

  if (step5Interval) clearInterval(step5Interval);

  step5Interval = setInterval(() => {
    if (!isTabActive) return;

    step5SecondsLeft--;
    const mins = Math.floor(step5SecondsLeft / 60);
    const secs = step5SecondsLeft % 60;
    timerElem.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

    if (step5SecondsLeft <= 0) {
      clearInterval(step5Interval);
      btnStep5Next.disabled = false;
      timerElem.textContent = '০০:০০';
    }
  }, 1000);

  btnStep5Next.onclick = () => goToStep(6);
}

// -------------------------------------------------------------
// STEP 6: STRICT TIME-BOX SELECTION
// -------------------------------------------------------------
const timeOptions = document.querySelectorAll('.time-option');
timeOptions.forEach((option) => {
  option.addEventListener('click', () => {
    timeOptions.forEach((o) => o.classList.remove('selected'));
    option.classList.add('selected');
    const radio = option.querySelector('input[type="radio"]');
    radio.checked = true;
    selectedDurationMinutes = parseInt(radio.value, 10);
  });
});

document.getElementById('btnStep6Next').onclick = () => goToStep(7);

// -------------------------------------------------------------
// STEP 7: DISTRACTION COST REFLECTION
// -------------------------------------------------------------
function initStep7Cost() {
  const hourlyRateInput = document.getElementById('hourlyRate');
  const yearlyLossText = document.getElementById('yearlyLossText');
  const chkCostAccept = document.getElementById('chkCostAccept');
  const btnStep7Next = document.getElementById('btnStep7Next');

  function calculateLoss() {
    const rate = parseFloat(hourlyRateInput.value) || 500;
    // 1 hour a day * 365 days * hourlyRate
    const yearlyLoss = Math.round(rate * 365);
    yearlyLossText.textContent = `৳ ${yearlyLoss.toLocaleString('bn-BD')}`;
  }

  hourlyRateInput.addEventListener('input', calculateLoss);
  calculateLoss();

  chkCostAccept.addEventListener('change', () => {
    btnStep7Next.disabled = !chkCostAccept.checked;
  });

  btnStep7Next.onclick = () => goToStep(8);
}

// -------------------------------------------------------------
// STEP 8: REVERSE COGNITIVE TEST
// -------------------------------------------------------------
function initStep8Reverse() {
  const reverseInput = document.getElementById('reverseInput');
  const btnStep8Next = document.getElementById('btnStep8Next');
  const expectedText = document.getElementById('reverseExpectedText').textContent.trim();

  reverseInput.addEventListener('input', () => {
    if (reverseInput.value.trim() === expectedText) {
      btnStep8Next.disabled = false;
      reverseInput.style.borderColor = '#10b981';
    } else {
      btnStep8Next.disabled = true;
      reverseInput.style.borderColor = '#334155';
    }
  });

  btnStep8Next.onclick = () => goToStep(9);
}

// -------------------------------------------------------------
// STEP 9: EXIT DECISION GATE
// -------------------------------------------------------------
document.getElementById('btnStep9Next').onclick = () => goToStep(10);

// -------------------------------------------------------------
// STEP 10: FINAL COUNTDOWN & UNLOCK
// -------------------------------------------------------------
function startStep10FinalCountdown() {
  document.getElementById('summaryDomain').textContent = targetDomain;
  document.getElementById('summaryDuration').textContent = `${selectedDurationMinutes} মিনিট`;

  const finalCountdownElem = document.getElementById('finalCountdown');
  let seconds = 10;

  const countdownInterval = setInterval(() => {
    if (!isTabActive) return;

    seconds--;
    finalCountdownElem.textContent = seconds;

    if (seconds <= 0) {
      clearInterval(countdownInterval);
      finalCountdownElem.textContent = '✓';

      // Unlock domain in background
      chrome.runtime.sendMessage(
        {
          type: 'UNLOCK_DOMAIN',
          domain: targetDomain,
          durationMinutes: selectedDurationMinutes
        },
        (response) => {
          if (response && response.success) {
            // Smoothly redirect to actual target URL
            window.location.href = targetUrl;
          } else {
            // Fallback
            window.location.href = targetUrl;
          }
        }
      );
    }
  }, 1000);
}

// Start with Step 1
window.addEventListener('DOMContentLoaded', () => {
  goToStep(1);
});

