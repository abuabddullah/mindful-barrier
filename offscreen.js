/**
 * MindfulBarrier - In-Browser Audio Engine (Manifest V3 Offscreen)
 * Plays periodic Istighfar cleanly via native HTML5 Audio.
 */

let currentAudio = null;

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'PLAY_AUDIO') {
    try {
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
        currentAudio = null;
      }

      const audioUrl = msg.audioUrl || chrome.runtime.getURL('sounds/istigfar.wav');
      currentAudio = new Audio(audioUrl);
      currentAudio.volume = 1.0;

      currentAudio.onended = () => {
        chrome.runtime.sendMessage({ type: 'AUDIO_PLAYBACK_FINISHED' });
        currentAudio = null;
      };

      currentAudio.onerror = (err) => {
        console.error('Audio playback error:', err);
        chrome.runtime.sendMessage({ type: 'AUDIO_PLAYBACK_FINISHED' });
        currentAudio = null;
      };

      const playPromise = currentAudio.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          sendResponse({ status: 'playing' });
        }).catch((err) => {
          console.error('Offscreen play failed:', err);
          chrome.runtime.sendMessage({ type: 'AUDIO_PLAYBACK_FINISHED' });
          sendResponse({ status: 'error', error: err.toString() });
        });
      }

      return true; // async
    } catch (e) {
      console.error('Error starting audio in offscreen:', e);
      chrome.runtime.sendMessage({ type: 'AUDIO_PLAYBACK_FINISHED' });
      sendResponse({ status: 'error', error: e.toString() });
      return true;
    }
  }

  if (msg.type === 'STOP_AUDIO') {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      currentAudio = null;
    }
    sendResponse({ status: 'stopped' });
    return true;
  }
});

