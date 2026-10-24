@echo off
chcp 65001 >nul
:: MindfulBarrier - Unlock Chrome Extensions Policy (With 3-minute delay)

echo =======================================================
echo   MindfulBarrier - এক্সটেনশন আনলক স্ক্রিপ্ট
echo =======================================================
echo.
echo ⚠️ আপনি কি নিশ্চিত যে আপনি সুরক্ষা সরাতে চাচ্ছেন?
echo আবেগী সিদ্ধান্ত ঠেকাতে এই স্ক্রিপ্টটি আনলক করার পূর্বে ৩ মিনিট (১৮০ সেকেন্ড) অপেক্ষা করবে।
echo.
echo কাউন্টডাউন শুরু হচ্ছে... বন্ধ করতে চাইলে এখনই উইন্ডো কেটে দিন!
echo.

set /a count=180
:loop
if %count% leq 0 goto finish
echo সময় বাকি: %count% সেকেন্ড...
timeout /t 5 /nobreak >nul
set /a count=count-5
goto loop

:finish
reg delete "HKCU\Software\Policies\Google\Chrome\URLBlocklist" /v "1" /f >nul 2>&1
reg delete "HKCU\Software\Policies\Google\Chrome\URLBlocklist" /v "2" /f >nul 2>&1

echo.
echo [✓] chrome://extensions আনলক করা হয়েছে।
pause

