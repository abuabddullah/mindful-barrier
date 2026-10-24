/**
 * MindfulBarrier - 10-Step Deactivation Engine
 */

let currentStep = 1;
let isTabActive = true;

const stepTitles = [
  'ধাপ ১: ৩ মিনিটের কুলডাউন অপেক্ষা',
  'ধাপ ২: আত্মসমর্পণের কারণ স্পষ্টভাবে লিখুন',
  'ধাপ ৩: আত্মসমর্পণের স্বীকারোক্তি',
  'ধাপ ৪: ৫টি কঠিন গাণিতিক ধাঁধা',
  'ধাপ ৫: চোখ-মুখে ঠান্ডা পানির ঝাপটা দিন',
  'ধাপ ৬: জীবনের অপচয়ের ভবিষ্যৎবাণী',
  'ধাপ ৭: নিরাপত্তা কোড বিপরীতকরণ',
  'ধাপ ৮: আত্মোপলব্ধির মুখোমুখি হোন',
  'ধাপ ৯: সর্বোচ্চ ১৫ মিনিটের জরুরি গ্রেস',
  'ধাপ ১০: শেষ সুযোগ — নিজেকে ফিরিয়ে নেওয়ার'
];

// Anti-Cheat (no paste, no contextmenu)
document.addEventListener('paste', (e) => {
  e.preventDefault();
  alert('🚫 নিষ্ক্রিয়করণ প্রোটোকলে কোনো কপি-পেস্ট অনুমোদিত নয়!');
});
document.addEventListener('contextmenu', (e) => e.preventDefault());

document.addEventListener('visibilitychange', () => {
  isTabActive = !document.hidden;
});

function closeTab() {
  window.close();
}

document.getElementById('btnCancelGlobal').onclick = closeTab;
document.getElementById('btnSaveHero').onclick = closeTab;
document.getElementById('btnFinalCancel').onclick = closeTab;

function goToStep(stepNum) {
  currentStep = stepNum;
  document.getElementById('stepCounterText').textContent = `${stepNum} / 10`;
  document.getElementById('stepTitleText').textContent = stepTitles[stepNum - 1];
  document.getElementById('progressBarFill').style.width = `${stepNum * 10}%`;

  document.querySelectorAll('.step-pane').forEach((p) => p.classList.remove('active'));
  document.getElementById(`step${stepNum}`).classList.add('active');

  initStep(stepNum);
}

function initStep(stepNum) {
  switch (stepNum) {
    case 1:
      startStep1Cooldown();
      break;
    case 3:
      initStep3Oath();
      break;
    case 4:
      generate5MathProblems();
      break;
    case 5:
      startStep5WashTimer();
      break;
    case 7:
      initStep7SecurityCode();
      break;
    case 10:
      startStep10Final();
      break;
  }
}

// -------------------------------------------------------------
// STEP 1: 3-MINUTE COOLDOWN (180s)
// -------------------------------------------------------------
let step1Secs = 180;
function startStep1Cooldown() {
  const timerElem = document.getElementById('disableCooldownTimer');
  const btn = document.getElementById('btnStep1Next');

  const interval = setInterval(() => {
    if (!isTabActive) return;
    step1Secs--;

    const m = Math.floor(step1Secs / 60);
    const s = step1Secs % 60;
    timerElem.textContent = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;

    if (step1Secs <= 0) {
      clearInterval(interval);
      btn.disabled = false;
      timerElem.textContent = '০০:০০ (সম্পন্ন)';
    }
  }, 1000);

  btn.onclick = () => goToStep(2);
}

// -------------------------------------------------------------
// STEP 2: RELAPSE REASON (60 chars)
// -------------------------------------------------------------
const relapseReason = document.getElementById('relapseReason');
const charCount = document.getElementById('charCount');
const btnStep2Next = document.getElementById('btnStep2Next');

relapseReason.addEventListener('input', () => {
  const len = relapseReason.value.trim().length;
  charCount.textContent = len;
  btnStep2Next.disabled = len < 60;
});
btnStep2Next.onclick = () => goToStep(3);

// -------------------------------------------------------------
// STEP 3: RELAPSE OATH
// -------------------------------------------------------------
function initStep3Oath() {
  const input = document.getElementById('relapseOathInput');
  const ref = document.getElementById('relapseOathRef').textContent.trim();
  const status = document.getElementById('oathMatchStatus');
  const btn = document.getElementById('btnStep3Next');

  input.addEventListener('input', () => {
    const cleanIn = input.value.replace(/\s+/g, ' ').trim();
    const cleanRef = ref.replace(/\s+/g, ' ').trim();

    if (cleanIn === cleanRef) {
      status.textContent = '✓ স্বীকারোক্তি মিলেছে';
      status.style.color = '#ef4444';
      btn.disabled = false;
    } else {
      btn.disabled = true;
      status.textContent = 'হুবহু মিলতে হবে...';
      status.style.color = '#94a3b8';
    }
  });

  btn.onclick = () => goToStep(4);
}

// -------------------------------------------------------------
// STEP 4: 5 MATH PROBLEMS
// -------------------------------------------------------------
let mathAns = [0, 0, 0, 0, 0];
function generate5MathProblems() {
  for (let i = 1; i <= 5; i++) {
    const x = Math.floor(Math.random() * 25) + 12;
    const y = Math.floor(Math.random() * 8) + 4;
    const z = Math.floor(Math.random() * 50) + 10;
    mathAns[i - 1] = (x * y) - z;
    document.getElementById(`dQ${i}`).textContent = `(${x} × ${y}) - ${z} =`;
    const input = document.getElementById(`dA${i}`);
    input.value = '';
    input.addEventListener('input', check5Math);
  }
}

function check5Math() {
  let allCorrect = true;
  for (let i = 1; i <= 5; i++) {
    const val = parseInt(document.getElementById(`dA${i}`).value, 10);
    if (val !== mathAns[i - 1]) {
      allCorrect = false;
    }
  }
  document.getElementById('btnStep4Next').disabled = !allCorrect;
}
document.getElementById('btnStep4Next').onclick = () => goToStep(5);

// -------------------------------------------------------------
// STEP 5: 2-MINUTE WASH TIMER (120s)
// -------------------------------------------------------------
let washSecs = 120;
function startStep5WashTimer() {
  const timerElem = document.getElementById('washTimer');
  const btn = document.getElementById('btnStep5Next');

  const interval = setInterval(() => {
    if (!isTabActive) return;
    washSecs--;

    const m = Math.floor(washSecs / 60);
    const s = washSecs % 60;
    timerElem.textContent = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;

    if (washSecs <= 0) {
      clearInterval(interval);
      btn.disabled = false;
      timerElem.textContent = '০০:০০';
    }
  }, 1000);

  btn.onclick = () => goToStep(6);
}

// -------------------------------------------------------------
// STEP 6: LOSS PROJECTION
// -------------------------------------------------------------
const chkLoss = document.getElementById('chkLossProjection');
chkLoss.addEventListener('change', () => {
  document.getElementById('btnStep6Next').disabled = !chkLoss.checked;
});
document.getElementById('btnStep6Next').onclick = () => goToStep(7);

// -------------------------------------------------------------
// STEP 7: SECURITY CODE REVERSAL
// -------------------------------------------------------------
function initStep7SecurityCode() {
  const code = '7K9M-4P2Q-8Z1X';
  const reversed = [...code].reverse().join('');
  const input = document.getElementById('securityCodeInput');
  const btn = document.getElementById('btnStep7Next');

  input.addEventListener('input', () => {
    btn.disabled = input.value.trim().toUpperCase() !== reversed;
  });
  btn.onclick = () => goToStep(8);
}

// -------------------------------------------------------------
// STEP 8: SELF CONFRONTATION
// -------------------------------------------------------------
document.getElementById('btnStep8Next').onclick = () => goToStep(9);

// -------------------------------------------------------------
// STEP 9: 15-MINUTE GRACE AGREEMENT
// -------------------------------------------------------------
document.getElementById('btnStep9Next').onclick = () => goToStep(10);

// -------------------------------------------------------------
// STEP 10: FINAL 30-SECOND COUNTDOWN & UNLOCK EMERGENCY GRACE
// -------------------------------------------------------------
function startStep10Final() {
  let secs = 30;
  const countElem = document.getElementById('disableFinalCountdown');

  const interval = setInterval(() => {
    if (!isTabActive) return;
    secs--;
    countElem.textContent = secs;

    if (secs <= 0) {
      clearInterval(interval);
      countElem.textContent = '✓';

      // Grant 15 minutes emergency unlock across all default domains
      chrome.storage.local.get(['blockedDomains', 'sessions'], async ({ blockedDomains = [], sessions = {} }) => {
        const now = Date.now();
        const unlockedUntil = now + (15 * 60 * 1000);

        blockedDomains.forEach((domain) => {
          sessions[domain] = {
            unlockedUntil,
            durationMinutes: 15,
            startTime: now,
            isEmergencyPause: true
          };
          chrome.alarms.create(`session_expiry_${domain}`, { when: unlockedUntil });
        });

        await chrome.storage.local.set({ sessions });

        alert('⚠️ MindfulBarrier আগামী ১৫ মিনিটের জন্য জরুরি বিরতিতে রয়েছে। ১৫ মিনিট পর স্বয়ংক্রিয়ভাবে পুনরায় লক হবে।');
        window.close();
      });
    }
  }, 1000);
}

// Auto start
window.addEventListener('DOMContentLoaded', () => {
  goToStep(1);
});

