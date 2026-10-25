/**
 * MindfulBarrier - Offscreen Audio Engine (Manifest V3)
 * Plays the Istighfar reminder cleanly without interrupting service workers.
 */

let currentAudio = null;

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'PLAY_AUDIO') {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio = null;
    }

    const audioUrl = msg.audioUrl || chrome.runtime.getURL('sounds/istigfar.wav');
    currentAudio = new Audio(audioUrl);
    currentAudio.volume = (typeof msg.volume === 'number') ? msg.volume : 1.0;

    currentAudio.onended = () => {
      chrome.runtime.sendMessage({ type: 'AUDIO_PLAYBACK_FINISHED' });
      currentAudio = null;
    };

    currentAudio.onerror = (err) => {
      console.error('Audio playback error:', err);
      chrome.runtime.sendMessage({ type: 'AUDIO_PLAYBACK_FINISHED' });
      currentAudio = null;
    };

    currentAudio.play().then(() => {
      sendResponse({ status: 'playing' });
    }).catch((err) => {
      console.error('Failed to play audio:', err);
      chrome.runtime.sendMessage({ type: 'AUDIO_PLAYBACK_FINISHED' });
      sendResponse({ status: 'error', error: err.toString() });
    });

    return true; // async sendResponse
  }

  if (msg.type === 'STOP_AUDIO') {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio = null;
    }
    sendResponse({ status: 'stopped' });
  }
});
