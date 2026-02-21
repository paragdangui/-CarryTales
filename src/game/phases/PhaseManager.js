import Narrator from '@/audio/Narrator.js';

/**
 * Async state machine that sequences story phases.
 * Each phase has narration text and an animation function that run concurrently.
 */
export default class PhaseManager {
  /**
   * @param {Phaser.Scene} scene
   * @param {Array<{name: string, narration: string, animate: (scene: Phaser.Scene, ctx: object) => Promise<void>}>} phases
   * @param {object} ctx – shared context (houses, characters, etc.)
   */
  constructor(scene, phases, ctx) {
    this.scene = scene;
    this.phases = phases;
    this.ctx = ctx;
    this.currentIndex = -1;
    this._cancelled = false;
  }

  /**
   * Run all phases sequentially. Each phase runs narration + animation
   * concurrently via Promise.all, then waits before proceeding.
   */
  async runAll() {
    this._cancelled = false;
    for (let i = 0; i < this.phases.length; i++) {
      if (this._cancelled) break;

      this.currentIndex = i;
      const phase = this.phases[i];

      // Run narration and animation concurrently
      await Promise.all([
        Narrator.speak(phase.narration),
        phase.animate(this.scene, this.ctx),
      ]);

      // Brief pause between phases
      if (!this._cancelled && i < this.phases.length - 1) {
        await this._delay(400);
      }
    }
  }

  /** Cancel the sequence. */
  cancel() {
    this._cancelled = true;
    Narrator.stop();
  }

  /** @private */
  _delay(ms) {
    return new Promise((resolve) => {
      this.scene.time.delayedCall(ms, resolve);
    });
  }
}
