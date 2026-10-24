/**
 * MindfulBarrier - 10-Step Friction Gate Engine
 * Enhanced with Bengali Unicode Normalization & Anti-Gibberish Validation
 */

// Parse query params
const urlParams = new URLSearchParams(window.location.search);
const targetUrl = urlParams.get('target') || 'https://facebook.com';
const targetDomain = urlParams.get('domain') || 'facebook.com';

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

if (targetDomainBadge) {
  targetDomainBadge.textContent = targetDomain;
}

// -------------------------------------------------------------
// BENGALI UNICODE NORMALIZATION UTILITY
// -------------------------------------------------------------
function normalizeBengali(str) {
  if (!str) return '';
  return str
    .normalize('NFC')
    // Remove zero-width spaces, joiners, non-joiners & BOM
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    // Normalize composite Nukta combinations into atomic characters:
    // য (U+09AF) + ় (U+09BC) -> য় (U+09DF)
    .replace(/\u09AF\u09BC/g, '\u09DF')
    // ড (U+09A1) + ় (U+09BC) -> ড় (U+09DC)
    .replace(/\u09A1\u09BC/g, '\u09DC')
    // ঢ (U+09A2) + ় (U+09BC) -> ঢ় (U+09DD)
    .replace(/\u09A2\u09BC/g, '\u09DD')
    // Strip punctuation to avoid typing traps (দাঁড়ি, কমা, ডট)
    .replace(/[।\.,!?;:\'\"\-]/g, '')
    // Collapse all spaces into single space
    .replace(/\s+/g, ' ')
    .trim();
}

// -------------------------------------------------------------
// GIBBERISH & KEYBOARD SMASHING DETECTOR WITH DICTIONARY ENGINE
// -------------------------------------------------------------
const RECOGNIZED_VOCABULARY = new Set([
  // English common words
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
  
  // Bengali common words
  "আমি", "আমার", "আমাকে", "আমরা", "আমাদের", "তুমি", "তোমার", "সে", "তার", "তারা", "তাদের",
  "এই", "ওই", "কি", "কেন", "কীভাবে", "কারণ", "কিন্তু", "এবং", "বা", "যদি", "কাজ", "কাজের",
  "প্রজেক্ট", "ক্লায়েন্ট", "মেসেজ", "জরুরি", "অতিজরুরি", "দরকার", "প্রয়োজন", "প্রয়োজনীয়",
  "অফিস", "মিটিং", "পড়াশোনা", "পড়া", "পরীক্ষা", "তথ্য", "দেখা", "পাঠানো", "উত্তর", "দেওয়া",
  "যোগাযোগ", "সমস্যা", "সমাধান", "সাহায্য", "ফাইল", "রিপোর্ট", "একাউন্ট", "পরিবার", "বন্ধু", "আত্মীয়",
  "ফেসবুক", "ইউটিউব", "ভিডিও", "পোস্ট", "পেজ", "গ্রুপ",

  // Banglish common words
  "amar", "ami", "amader", "kaj", "kajer", "dorkar", "proyojon", "emergency", "urgent",
  "client", "message", "msg", "uttor", "dekha", "pathano", "office", "meeting", "project",
  "info", "tottho", "jogajog", "shomossha", "help", "account", "check"
]);

function validateMeaningfulText(text) {
  const raw = text.trim();
  if (raw.length < 35) {
    return { valid: false, message: `আরও ${35 - raw.length} অক্ষর প্রয়োজন` };
  }

  // 1. Split into words
  const words = raw.split(/\s+/).filter(Boolean);
  if (words.length < 5) {
    return { valid: false, message: `কমপক্ষে ৫টি পৃথক শব্দ প্রয়োজন (বর্তমানে ${words.length}টি)` };
  }

  // 2. Detect unpronounceable keyboard mash rolls (e.g. adfhai, asfhasdi, afsdfhasi, jf, fjs)
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

  // 3. Count recognized dictionary words
  let recognizedCount = 0;
  for (const w of words) {
    const cleanWord = w.toLowerCase().replace(/[^a-z0-9\u0980-\u09FF]/g, '');
    if (RECOGNIZED_VOCABULARY.has(cleanWord)) {
      recognizedCount++;
    }
  }

  // At least 3 words must be genuine recognized words
  if (recognizedCount < 3) {
    return {
      valid: false,
      message: `🚫 কোনো বাস্তব কাজের উদ্দেশ্য খুঁজে পাওয়া যায়নি (${recognizedCount}/৩ শব্দ স্বীকৃত)। বাস্তব কারণ লিখুন (যেমন: ক্লায়েন্টের মেসেজ, জরুরি কাজ ইত্যাদি)।`
    };
  }

  return { valid: true, message: '✓ অর্থপূর্ণ বাস্তব কারণ হিসেবে গৃহীত হয়েছে' };
}

// -------------------------------------------------------------
// ANTI-CHEAT MECHANISMS
// -------------------------------------------------------------
document.addEventListener('paste', (e) => {
  e.preventDefault();
  alert('🚫 কপি-পেস্ট সম্পূর্ণ নিষ্ক্রিয়! নিজে হাত দিয়ে টাইপ করুন।');
});

document.addEventListener('contextmenu', (e) => {
  e.preventDefault();
});

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

  stepCounterText.textContent = `${stepNumber} / 10`;
  stepTitleText.textContent = stepTitles[stepNumber - 1];
  progressBarFill.style.width = `${stepNumber * 10}%`;

  document.querySelectorAll('.step-pane').forEach((pane) => {
    pane.classList.remove('active');
  });

  const currentPane = document.getElementById(`step${stepNumber}`);
  if (currentPane) {
    currentPane.classList.add('active');
  }

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
    if (!isTabActive) return;

    step1SecondsLeft--;
    phaseElapsed++;

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
// STEP 2: WRITTEN JUSTIFICATION (WITH ANTI-GIBBERISH)
// -------------------------------------------------------------
const justificationText = document.getElementById('justificationText');
const charCount = document.getElementById('charCount');
const justificationFeedback = document.getElementById('justificationFeedback');
const btnStep2Next = document.getElementById('btnStep2Next');

justificationText.addEventListener('input', () => {
  const text = justificationText.value;
  charCount.textContent = text.trim().length;

  const result = validateMeaningfulText(text);
  justificationFeedback.textContent = result.message;

  if (result.valid) {
    justificationFeedback.className = 'justification-feedback valid';
    btnStep2Next.disabled = false;
  } else {
    justificationFeedback.className = 'justification-feedback';
    btnStep2Next.disabled = true;
  }
});

btnStep2Next.onclick = () => goToStep(3);

// -------------------------------------------------------------
// STEP 3: OATH VERIFICATION (LIVE COLOR-CODED TYPING & ERROR HIGHLIGHTER)
// -------------------------------------------------------------
function initStep3Oath() {
  const input = document.getElementById('oathInputText');
  const refBox = document.getElementById('oathReferenceText');
  const status = document.getElementById('oathMatchStatus');
  const typoHelper = document.getElementById('typoHelper');
  const btn = document.getElementById('btnStep3Next');

  const engTarget = "I consciously acknowledge that social media algorithms are designed to hijack my time. I will not lose control of my life.";
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
      span.id = `gate-oath-w-${idx}`;
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
      const span = document.getElementById(`gate-oath-w-${idx}`);
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
        span.className = 'oath-word';
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
        typoHelper.textContent = '✓ চমৎকার! সম্পূর্ণ অঙ্গীকার সফলভাবে নির্ভুল টাইপ করেছেন।';
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
// STEP 4: COGNITIVE MATH CHALLENGE
// -------------------------------------------------------------
let mathSolutions = [0, 0, 0];

function generateMathProblems() {
  const a = Math.floor(Math.random() * 20) + 15;
  const b = Math.floor(Math.random() * 6) + 4;
  const c = Math.floor(Math.random() * 40) + 20;
  mathSolutions[0] = (a * b) - c;
  document.getElementById('mathQ1').textContent = `(${a} × ${b}) - ${c} =`;

  const f = Math.floor(Math.random() * 5) + 3;
  const mult = Math.floor(Math.random() * 30) + 20;
  const total = f * mult;
  const d = Math.floor(total * 0.6);
  const e = total - d;
  mathSolutions[1] = mult;
  document.getElementById('mathQ2').textContent = `(${d} + ${e}) ÷ ${f} =`;

  const g = Math.floor(Math.random() * 15) + 12;
  const h = Math.floor(Math.random() * 5) + 4;
  const i = Math.floor(Math.random() * 30) + 10;
  mathSolutions[2] = (g * h) - i;
  document.getElementById('mathQ3').textContent = `(${g} × ${h}) - ${i} =`;

  ['mathA1', 'mathA2', 'mathA3'].forEach((id) => {
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
  btnStep4Next.disabled = !(ok1 && ok2 && ok3);
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

  function cleanStr(s) {
    return s.toLowerCase().replace(/[^a-z0-9\u0980-\u09FF]/g, '').trim();
  }

  const expected1 = cleanStr("success to keys are patience and focus");
  const expected2 = cleanStr("চাবিকাঠি সফলতার একাগ্রতাই এবং ধৈর্য");

  reverseInput.addEventListener('input', () => {
    const userVal = cleanStr(reverseInput.value);
    if (userVal === expected1 || userVal === expected2) {
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

      chrome.runtime.sendMessage(
        {
          type: 'UNLOCK_DOMAIN',
          domain: targetDomain,
          durationMinutes: selectedDurationMinutes
        },
        () => {
          window.location.href = targetUrl;
        }
      );
    }
  }, 1000);
}

window.addEventListener('DOMContentLoaded', () => {
  goToStep(1);
});
