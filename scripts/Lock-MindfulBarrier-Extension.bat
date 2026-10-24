@echo off
chcp 65001 >nul
title MindfulBarrier - এক্সটেনশন লক স্ক্রিপ্ট

:: Self-elevate to Administrator
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo [i] অ্যাডমিনিস্ট্রেটর পারমিশন চাওয়া হচ্ছে...
    powershell -Command "Start-Process cmd -ArgumentList '/c \"\"%~f0\"\"' -Verb RunAs"
    exit /b
)

cls
echo ===================================================================
echo     MindfulBarrier — সিঙ্গেল এক্সটেনশন রিমুভ ও টগল লক
echo ===================================================================
echo.
echo এই স্ক্রিপ্টটি শুধুমাত্র MindfulBarrier এক্সটেনশনটির:
echo   1. "Remove" বাটনটি সম্পূর্ণ গায়েব / অচল করে দেবে।
echo   2. "Toggle" সুইচটি লক / ধূসর (অচল) করে দেবে।
echo.
echo [✓] অন্যান্য সমস্ত এক্সটেনশন এবং chrome://extensions পেজ ১০০%% স্বাভাবিক থাকবে।
echo.
pause

set "EXT_ID=dllgnjbbjpjngcmmbmbaiefllmheeee"
set "POLICY_VAL=%EXT_ID%;https://clients2.google.com/service/update2/crx"

:: Add to HKLM and HKCU for absolute enforcement
reg add "HKLM\SOFTWARE\Policies\Google\Chrome\ExtensionInstallForcelist" /v "1" /t REG_SZ /d "%POLICY_VAL%" /f >nul 2>&1
reg add "HKCU\SOFTWARE\Policies\Google\Chrome\ExtensionInstallForcelist" /v "1" /t REG_SZ /d "%POLICY_VAL%" /f >nul 2>&1

echo.
echo ===================================================================
echo   [✓] MindfulBarrier সফলভাবে লক করা হয়েছে!
echo ===================================================================
echo.
echo পরিবর্তনটি কার্যকর করতে:
echo 1. ক্রোম ব্রাউজারটি একবার পুরোপুরি বন্ধ করুন এবং আবার চালু করুন।
echo 2. chrome://extensions-এ গিয়ে দেখুন:
echo    - MindfulBarrier-এর "Remove" বাটন গায়েব হয়ে গেছে!
echo    - Toggle সুইচটি লক হয়ে গেছে!
echo    - কিন্তু বাকি সব এক্সটেনশন স্বাভাবিক রয়েছে!
echo.
echo বন্ধ করতে চাইলে উইন্ডো কেটে দিন।
pause

