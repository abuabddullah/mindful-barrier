/**
 * MindfulBarrier - 10-Step Deactivation Engine
 * Enhanced with Bengali Unicode Normalization & Anti-Gibberish Validation
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

// Bengali Normalization
function normalizeBengali(str) {
  if (!str) return '';
  return str
    .normalize('NFC')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .replace(/\u09AF\u09BC/g, '\u09DF')
    .replace(/\u09A1\u09BC/g, '\u09DC')
    .replace(/\u09A2\u09BC/g, '\u09DD')
    .replace(/[।\.,!?;:\'\"\-]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Anti-Gibberish with Vocabulary Database
const RECOGNIZED_VOCABULARY = new Set([
  "i", "me", "my", "we", "our", "you", "your", "he", "she", "they", "it", "this", "that",
  "is", "am", "are", "was", "were", "be", "been", "have", "has", "had", "do", "does", "did",
  "will", "would", "can", "could", "should", "must", "need", "want", "to", "for", "in", "on",
  "at", "of", "with", "from", "by", "about", "because", "but", "or", "so", "if", "when", "what",
  "why", "how", "work", "job", "client", "project", "message", "messages", "email", "emails",
  "check", "checking", "send", "sending", "reply", "replying", "urgent", "emergency", "important",
  "account", "login", "business", "office", "team", "meeting", "study", "exam", "research",
  "information", "read", "reading", "post", "family", "friend", "friends", "contact", "task",
  "tasks", "update", "help", "problem", "issue", "customer", "support", "call", "report", "file",
  "document", "service", "link", "website", "page", "code", "dev", "design", "video", "urgent",
  "আমি", "আমার", "আমাকে", "আমরা", "আমাদের", "তুমি", "তোমার", "সে", "তার", "তারা", "তাদের",
  "এই", "ওই", "কি", "কেন", "কীভাবে", "কারণ", "কিন্তু", "এবং", "বা", "যদি", "কাজ", "কাজের",
  "প্রজেক্ট", "ক্লায়েন্ট", "মেসেজ", "জরুরি", "অতিজরুরি", "দরকার", "প্রয়োজন", "প্রয়োজনীয়",
  "অফিস", "মিটিং", "পড়াশোনা", "পড়া", "পরীক্ষা", "তথ্য", "দেখা", "পাঠানো", "উত্তর", "দেওয়া",
  "যোগাযোগ", "সমস্যা", "সমাধান", "সাহায্য", "ফাইল", "রিপোর্ট", "একাউন্ট", "পরিবার", "বন্ধু", "আত্মীয়",
  "amar", "ami", "amader", "kaj", "kajer", "dorkar", "proyojon", "emergency", "urgent",
  "client", "message", "msg", "uttor", "dekha", "pathano", "office", "meeting", "project"
]);

function validateMeaningfulText(text, minLen = 50) {
  const raw = text.trim();
  if (raw.length < minLen) {
    return { valid: false, message: `আরও ${minLen - raw.length} অক্ষর প্রয়োজন` };
  }
  const words = raw.split(/\s+/).filter(Boolean);
  if (words.length < 5) {
    return { valid: false, message: `কমপক্ষে ৫টি পৃথক শব্দ প্রয়োজন (বর্তমানে ${words.length}টি)` };
  }
  
  // Detect keyboard rolls
  const keyboardRolls = /(dfh|fhd|hsd|sdh|fjs|jf|fha|hsi|sdf|dfg|fgh|ghj|hjk|jkl|asd|sfa|fas|zxc|xcv|cvb|vbn|bnm|qwe|wer|ert|rty|tyu|yui|uio|iop)/i;
  let mashCount = 0;
  for (const w of words) {
    if (w.length >= 3 && keyboardRolls.test(w)) {
      mashCount++;
    }
  }
  if (mashCount >= 2) {
    return { valid: false, message: '🚫 কি-বোর্ড স্প্যামিং বা এলোমেলো অক্ষর চিহ্নিত হয়েছে! বাস্তব বাক্য লিখুন।' };
  }

  // Count recognized dictionary words
  let recognizedCount = 0;
  for (const w of words) {
    const cleanWord = w.toLowerCase().replace(/[^a-z0-9\u0980-\u09FF]/g, '');
    if (RECOGNIZED_VOCABULARY.has(cleanWord)) {
      recognizedCount++;
    }
  }

  if (recognizedCount < 3) {
    return {
      valid: false,
      message: `🚫 কোনো বাস্তব কারণের শব্দ পাওয়া যায়নি (${recognizedCount}/৩ শব্দ স্বীকৃত)। বাস্তব কারণ লিখুন।`
    };
  }

  return { valid: true, message: '✓ কারণ গ্রহণযোগ্য হিসেবে গৃহীত হয়েছে' };
}

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
// STEP 2: RELAPSE REASON (WITH ANTI-GIBBERISH)
// -------------------------------------------------------------
const relapseReason = document.getElementById('relapseReason');
const charCount = document.getElementById('charCount');
const btnStep2Next = document.getElementById('btnStep2Next');

relapseReason.addEventListener('input', () => {
  const text = relapseReason.value;
  charCount.textContent = text.trim().length;

  const result = validateMeaningfulText(text, 50);
  btnStep2Next.disabled = !result.valid;
});
btnStep2Next.onclick = () => goToStep(3);

// -------------------------------------------------------------
// STEP 3: RELAPSE OATH (LIVE COLOR-CODED TYPING & ERROR HIGHLIGHTER)
// -------------------------------------------------------------
function initStep3Oath() {
  const input = document.getElementById('relapseOathInput');
  const refBox = document.getElementById('relapseOathRef');
  const status = document.getElementById('oathMatchStatus');
  const typoHelper = document.getElementById('typoHelper');
  const btn = document.getElementById('btnStep3Next');

  const engTarget = "I consciously admit defeat to social media addiction and I am disabling this protection to waste my valuable time";
  const rawWords = engTarget.split(' ');

  function cleanWord(w) {
    return w.toLowerCase().replace(/[^a-z0-9]/g, '');
  }

  // Populate reference box with interactive spans
  function renderReferenceSpans() {
    refBox.innerHTML = '';
    rawWords.forEach((word, idx) => {
      const span = document.createElement('span');
      span.className = 'oath-word';
      span.id = `oath-w-${idx}`;
      span.textContent = word;
      refBox.appendChild(span);
    });
  }

  renderReferenceSpans();

  input.addEventListener('input', () => {
    const userRaw = input.value;
    const userWords = userRaw.trim().split(/\s+/).filter(Boolean);

    let firstError = null;
    let correctCount = 0;

    rawWords.forEach((targetWord, idx) => {
      const span = document.getElementById(`oath-w-${idx}`);
      if (!span) return;

      const cleanTarget = cleanWord(targetWord);

      if (idx < userWords.length) {
        const cleanUser = cleanWord(userWords[idx]);

        if (cleanUser === cleanTarget) {
          span.className = 'oath-word correct';
          correctCount++;
        } else {
          span.className = 'oath-word error';
          if (!firstError) {
            firstError = {
              typed: userWords[idx],
              expected: targetWord,
              index: idx + 1
            };
          }
        }
      } else if (idx === userWords.length && userRaw.endsWith(' ')) {
        span.className = 'oath-word current';
      } else if (idx === userWords.length - 1 && !userRaw.endsWith(' ')) {
        // currently typing this word
        const cleanUser = cleanWord(userWords[idx]);
        if (cleanTarget.startsWith(cleanUser)) {
          span.className = 'oath-word current';
        } else {
          span.className = 'oath-word error';
          if (!firstError) {
            firstError = {
              typed: userWords[idx],
              expected: targetWord,
              index: idx + 1
            };
          }
        }
      } else {
        span.className = 'oath-word'; // pending
      }
    });

    const isComplete = (correctCount === rawWords.length && userWords.length === rawWords.length);
    const pct = Math.min(100, Math.round((correctCount / rawWords.length) * 100));

    if (isComplete) {
      status.textContent = '✓ ১০০% হুবহু মিলেছে!';
      status.style.color = '#10b981';
      btn.disabled = false;
      if (typoHelper) {
        typoHelper.className = 'typo-helper success';
        typoHelper.textContent = '✓ চমৎকার! সম্পূর্ণ স্বীকারোক্তি সফলভাবে নির্ভুল টাইপ করেছেন।';
      }
    } else {
      btn.disabled = true;
      status.textContent = `অগ্রগতি: ${pct}% (${correctCount}/${rawWords.length} শব্দ সঠিক)`;
      status.style.color = pct > 75 ? '#f59e0b' : '#ef4444';

      if (firstError && typoHelper) {
        typoHelper.className = 'typo-helper error';
        typoHelper.textContent = `❌ বানান ভুল (#${firstError.index}): "${firstError.typed}" — সঠিক বানান হতে হবে: "${firstError.expected}"`;
      } else if (typoHelper) {
        if (userWords.length > 0) {
          typoHelper.className = 'typo-helper success';
          typoHelper.textContent = `✍️ টাইপ করতে থাকুন... (${correctCount}/${rawWords.length} শব্দ ঠিক আছে)`;
        } else {
          typoHelper.className = 'typo-helper';
          typoHelper.textContent = '';
        }
      }
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

window.addEventListener('DOMContentLoaded', () => {
  goToStep(1);
});
