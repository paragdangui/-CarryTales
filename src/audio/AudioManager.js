import { Howl } from 'howler';

/**
 * Logical key → asset file paths (mp3 + ogg for cross-browser support).
 * Files are served from public/assets/audio/ — not bundled, fetched at runtime.
 */
const SOUND_REGISTRY = {
  // Narration tracks
  narration_intro: {
    src: ['/assets/audio/narration/intro.mp3', '/assets/audio/narration/intro.ogg'],
    volume: 1.0,
  },
  narration_ones_house: {
    src: ['/assets/audio/narration/ones_house.mp3', '/assets/audio/narration/ones_house.ogg'],
    volume: 1.0,
  },
  narration_carry: {
    src: ['/assets/audio/narration/carry.mp3', '/assets/audio/narration/carry.ogg'],
    volume: 1.0,
  },
  narration_tens_house: {
    src: ['/assets/audio/narration/tens_house.mp3', '/assets/audio/narration/tens_house.ogg'],
    volume: 1.0,
  },

  // Sound effects
  sfx_door_knock: {
    src: ['/assets/audio/sfx/door_knock.mp3', '/assets/audio/sfx/door_knock.ogg'],
    volume: 0.8,
  },
  sfx_number_enter: {
    src: ['/assets/audio/sfx/number_enter.mp3', '/assets/audio/sfx/number_enter.ogg'],
    volume: 0.8,
  },
  sfx_carry_whoosh: {
    src: ['/assets/audio/sfx/carry_whoosh.mp3', '/assets/audio/sfx/carry_whoosh.ogg'],
    volume: 0.9,
  },
  sfx_celebrate: {
    src: ['/assets/audio/sfx/celebrate.mp3', '/assets/audio/sfx/celebrate.ogg'],
    volume: 1.0,
  },

  // Background music
  bgm_main: {
    src: ['/assets/audio/bgm/main_theme.mp3', '/assets/audio/bgm/main_theme.ogg'],
    volume: 0.4,
    loop: true,
  },
};

/** @type {Map<string, Howl>} */
const _instances = new Map();

function _getInstance(key) {
  if (!SOUND_REGISTRY[key]) {
    console.warn(`AudioManager: unknown sound key "${key}"`);
    return null;
  }
  if (!_instances.has(key)) {
    // Lazy instantiation — Howl created on first use
    _instances.set(key, new Howl(SOUND_REGISTRY[key]));
  }
  return _instances.get(key);
}

const AudioManager = {
  /**
   * Play a sound by its logical key. Returns the Howler sound ID.
   * @param {string} key
   * @returns {number|undefined}
   */
  play(key) {
    const howl = _getInstance(key);
    return howl ? howl.play() : undefined;
  },

  /** Stop a sound (or all instances of it). */
  stop(key) {
    _instances.get(key)?.stop();
  },

  /**
   * Fade a sound's volume.
   * @param {string} key
   * @param {number} from  0–1
   * @param {number} to    0–1
   * @param {number} ms    duration in milliseconds
   */
  fade(key, from, to, ms) {
    _instances.get(key)?.fade(from, to, ms);
  },

  /** Set master volume for a specific sound (0–1). */
  setVolume(key, v) {
    _instances.get(key)?.volume(v);
  },

  /** Mute or unmute a specific sound. */
  mute(key, bool) {
    _instances.get(key)?.mute(bool);
  },

  /** Stop every active sound. */
  stopAll() {
    _instances.forEach((howl) => howl.stop());
  },

  /** Unload and destroy all Howl instances (call on full teardown). */
  destroyAll() {
    _instances.forEach((howl) => howl.unload());
    _instances.clear();
  },
};

export default AudioManager;
