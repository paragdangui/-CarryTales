import EventBus from '@/utils/EventBus.js';

/**
 * Web Speech API wrapper for narration.
 * speak(text) returns a Promise that resolves when the utterance finishes.
 * Also emits 'subtitle' events so the React subtitle overlay can display text.
 */
const Narrator = {
  /** @type {SpeechSynthesisUtterance|null} */
  _current: null,

  /** When true, TTS is skipped but subtitles still display. */
  muted: false,

  /**
   * Speak the given text using the browser's TTS engine.
   * @param {string} text
   * @returns {Promise<void>}
   */
  speak(text) {
    return new Promise((resolve) => {
      this.stop();

      EventBus.emit('subtitle', text);

      if (this.muted || !window.speechSynthesis) {
        // Show subtitle for a readable duration, then clear
        setTimeout(() => {
          EventBus.emit('subtitle', '');
          resolve();
        }, text.length * 60);
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.85;
      utterance.pitch = 1.1;
      utterance.lang = 'en-US';
      this._current = utterance;

      utterance.onend = () => {
        this._current = null;
        EventBus.emit('subtitle', '');
        resolve();
      };

      utterance.onerror = () => {
        this._current = null;
        EventBus.emit('subtitle', '');
        resolve();
      };

      window.speechSynthesis.speak(utterance);
    });
  },

  /** Cancel any in-progress speech. */
  stop() {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    this._current = null;
    EventBus.emit('subtitle', '');
  },
};

export default Narrator;
