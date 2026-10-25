@echo off
chcp 65001 >nul
title MindfulBarrier - সিস্টেম-ওয়াইড ইস্তিগফার ডেমোন

cls
echo ===================================================================
echo       MindfulBarrier — সিস্টেম-ওয়াইড ইস্তিগফার টাইমার 📿
echo ===================================================================
echo.
echo কত মিনিট পর পর আস্তাগফিরুল্লাহ জিকির শুনতে চান?
echo.
echo   [1] প্রতি ১ মিনিট পর পর
echo   [2] প্রতি ২ মিনিট পর পর
echo   [5] প্রতি ৫ মিনিট পর পর
echo   [10] প্রতি ১০ মিনিট পর পর
echo   [15] প্রতি ১৫ মিনিট পর পর
echo   [30] প্রতি ৩০ মিনিট পর পর
echo.
set /p min="পছন্দের মিনিট লিখুন (যেমন 1 বা 2 বা 5): "

if "%min%"=="" set min=1

powershell -ExecutionPolicy Bypass -NoProfile -File "%~dp0Istighfar-PC-daemon.ps1" -IntervalMinutes %min%

