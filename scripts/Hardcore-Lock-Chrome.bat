@echo off
chcp 65001 >nul
:: MindfulBarrier - Hardcore Chrome Anti-Disable Policy
:: This script blocks access to chrome://extensions so you cannot manually disable the extension!

echo =======================================================
echo   MindfulBarrier - হার্ডকোর সুরক্ষা নীতি সক্রিয়করণ
echo =======================================================
echo.
echo এই স্ক্রিপ্টটি উইন্ডোজ রেজিস্ট্রিতে Chrome Policy যোগ করবে যাতে
echo ব্রাউজারে chrome://extensions পেজটি ব্লক হয়ে যায় এবং এক্সটেনশনটি
echo কেউ বন্ধ করতে না পারে।
echo.
pause

reg add "HKCU\Software\Policies\Google\Chrome\URLBlocklist" /v "1" /t REG_SZ /d "chrome://extensions*" /f >nul 2>&1
reg add "HKCU\Software\Policies\Google\Chrome\URLBlocklist" /v "2" /t REG_SZ /d "edge://extensions*" /f >nul 2>&1

echo.
echo [✓] অভিনন্দন! chrome://extensions সফলভাবে লক করা হয়েছে।
echo পরিবর্তন কার্যকর করতে অনুগ্রহ করে একবার Chrome পুরোপুরি বন্ধ করে আবার চালু করুন।
echo.
pause

