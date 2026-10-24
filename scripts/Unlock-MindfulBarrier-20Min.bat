@echo off
chcp 65001 >nul
title MindfulBarrier - ২০ মিনিটের ডিলে আনলকার

:: Self-elevate to Administrator
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo [i] অ্যাডমিনিস্ট্রেটর পারমিশন চাওয়া হচ্ছে...
    powershell -Command "Start-Process cmd -ArgumentList '/c \"\"%~f0\"\"' -Verb RunAs"
    exit /b
)

cls
echo ===================================================================
echo     MindfulBarrier — ২০ মিনিটের বিলম্বিত আনলক প্রোটোকল
echo ===================================================================
echo.
echo আবেগী মুহূর্তে হুট করে এক্সটেনশন বন্ধ করা ঠেকাতে ২০ মিনিটের টাইমার
echo চালু করা হচ্ছে।
echo.
echo 💡 টিপস: আপনি এই উইন্ডোটি মিনিমাইজ করে আপনার স্বাভাবিক কাজ বা কোডিং
echo করতে পারেন। অন্য কোনো অ্যাপ বা ট্যাবে কোনো বাধা দেওয়া হবে না।
echo.
echo [!] ঠিক ২০ মিনিট পর এটি MindfulBarrier সাময়িকভাবে আনলক করবে।
echo.
pause

set "EXT_ID=dllgnjbbjpjngcmmbmbaiefllmheeee"

:: 20 minutes countdown = 1200 seconds (updating every 5 seconds)
set /a remaining=1200

:countdown_loop
if %remaining% leq 0 goto unlock_phase

set /a mins=remaining / 60
set /a secs=remaining %% 60

cls
echo ===================================================================
echo     MindfulBarrier — ২০ মিনিটের বিলম্বিত আনলক প্রোটোকল
echo ===================================================================
echo.
echo ⏳ সময় বাকি: %mins% মিনিট %secs% সেকেন্ড...
echo.
echo (আপনি চাইলে এই উইন্ডো মিনিমাইজ করে আপনার কাজ করতে পারেন)
echo.

timeout /t 5 /nobreak >nul
set /a remaining=remaining-5
goto countdown_loop

:unlock_phase
cls
echo ===================================================================
echo   [✓] ২০ মিনিট পূর্ণ হয়েছে!
echo ===================================================================
echo.
echo MindfulBarrier-এর লক সাময়িকভাবে প্রত্যাহার করা হচ্ছে...
echo.

:: Remove policy from registry
reg delete "HKLM\SOFTWARE\Policies\Google\Chrome\ExtensionInstallForcelist" /v "1" /f >nul 2>&1
reg delete "HKCU\SOFTWARE\Policies\Google\Chrome\ExtensionInstallForcelist" /v "1" /f >nul 2>&1

:: Trigger a notification beep
powershell -Command "[console]::beep(800, 400); [console]::beep(1000, 600)" >nul 2>&1

echo.
echo [✓] অভিনন্দন! MindfulBarrier সাময়িকভাবে আনলক হয়েছে।
echo.
echo এখন আপনি:
echo 1. ক্রোম রিস্টার্ট দিন বা chrome://policy তে গিয়ে "Reload policies" চাপুন।
echo 2. chrome://extensions-এ গিয়ে MindfulBarrier রিমুভ বা ডিজেবল করতে পারেন।
echo.
echo ⚠️ সতর্কতা: আগামী ১৫ মিনিটের মধ্যে এটি রিমুভ না করলে স্বয়ংক্রিয়ভাবে
echo আবার রি-লক হয়ে যাবে!
echo.
echo আনলক সেশন শেষ করতে যেকোনো কি চাপুন...
pause >nul

