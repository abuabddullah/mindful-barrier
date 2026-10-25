# MindfulBarrier - System-Wide Istighfar Daemon for Windows
# Pauses all PC media (VLC, Spotify, Chrome, Media Player), plays Istighfar, and resumes.

param(
    [int]$IntervalMinutes = 1
)

Add-Type -TypeDefinition @"
using System;
using System.Runtime.InteropServices;

public class MediaController {
    [DllImport("user32.dll")]
    public static extern void keybd_event(byte bVk, byte bScan, uint dwFlags, UIntPtr dwExtraInfo);

    public const byte VK_MEDIA_PLAY_PAUSE = 0xB3;
    public const uint KEYEVENTF_KEYUP = 0x0002;

    public static void PressPlayPause() {
        keybd_event(VK_MEDIA_PLAY_PAUSE, 0, 0, UIntPtr.Zero);
        keybd_event(VK_MEDIA_PLAY_PAUSE, 0, KEYEVENTF_KEYUP, UIntPtr.Zero);
    }
}
"@

$audioPath = "C:\Users\User\Downloads\istigfar.wav"
if (-not (Test-Path $audioPath)) {
    $audioPath = Join-Path (Split-Path -Parent $PSScriptRoot) "sounds\istigfar.wav"
}

Clear-Host
Write-Host "===================================================================" -ForegroundColor Cyan
Write-Host "       MindfulBarrier — সিস্টেম-ওয়াইড ইস্তিগফার ডেমোন (Windows) 📿" -ForegroundColor Yellow
Write-Host "===================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  [✓] অডিও সোর্স: $audioPath" -ForegroundColor Gray
Write-Host "  [✓] বিরতির সময়: প্রতি $IntervalMinutes মিনিট পর পর" -ForegroundColor Green
Write-Host ""
Write-Host "  💡 কাজ করার নিয়ম:" -ForegroundColor White
Write-Host "     ১. প্রতি $IntervalMinutes মিনিট পর পিসির যেকোনো ভিডিও/মিডিয়া অটো-পজ হবে।" -ForegroundColor Gray
Write-Host "     ২. আস্তাগফিরুল্লাহ জিকির অডিওটি প্লে হবে।" -ForegroundColor Gray
Write-Host "     ৩. জিকির শেষে পূর্বের ভিডিও/অডিও আবার অটো-রিজিউম হবে।" -ForegroundColor Gray
Write-Host "     ৪. হেডফোন কানে থাকলে গুগল মিট বা কলের অন্য কেউ এটি শুনতে পাবে না।" -ForegroundColor Gray
Write-Host ""
Write-Host "  (এই উইন্ডোটি মিনিমাইজ করে আপনার কাজ চালিয়ে যেতে পারেন)" -ForegroundColor DarkGray
Write-Host "===================================================================" -ForegroundColor Cyan
Write-Host ""

$soundPlayer = New-Object System.Media.SoundPlayer($audioPath)

while ($true) {
    $seconds = $IntervalMinutes * 60
    while ($seconds -gt 0) {
        $m = [math]::Floor($seconds / 60)
        $s = $seconds % 60
        $timeStr = "{0:D2}:{1:D2}" -f $m, $s
        Write-Host -NoNewline "`r⏳ পরবর্তী জিকির বাজবে: $timeStr সেকেন্ড পর...   "
        Start-Sleep -Seconds 1
        $seconds--
    }

    Write-Host "`r[▶] জিকির প্লে হচ্ছে... মিডিয়া পজ করা হয়েছে।              " -ForegroundColor Yellow
    
    # 1. Pause system media (YouTube, Spotify, VLC, etc.)
    [MediaController]::PressPlayPause()
    Start-Sleep -Milliseconds 400

    # 2. Play Istighfar audio
    try {
        $soundPlayer.PlaySync()
    } catch {
        Write-Host "প্লেয়ার এরর: $_" -ForegroundColor Red
    }

    # 3. Resume previous media
    Start-Sleep -Milliseconds 300
    [MediaController]::PressPlayPause()
    Write-Host "[✓] জিকির সমাপ্ত। মিডিয়া পুনরায় চালু করা হয়েছে।           " -ForegroundColor Green
}

