import Phaser from 'phaser';
import House from '@game/objects/House.js';
import PhaseManager from '@game/phases/PhaseManager.js';
import { createPhases } from '@game/phases/phases.js';
import Narrator from '@/audio/Narrator.js';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  create() {
    const { width, height } = this.scale;
    const cx = width / 2;

    // ── Sky gradient background ──
    const skyGfx = this.add.graphics();
    skyGfx.fillGradientStyle(0x4a90d9, 0x4a90d9, 0x87ceeb, 0x87ceeb, 1);
    skyGfx.fillRect(0, 0, width, height - 140);

    // Clouds
    this._drawCloud(skyGfx, 150, 80, 60);
    this._drawCloud(skyGfx, 500, 50, 45);
    this._drawCloud(skyGfx, 900, 100, 55);
    this._drawCloud(skyGfx, 1100, 60, 40);

    // ── Ground / road ──
    const groundGfx = this.add.graphics();
    // Grass
    groundGfx.fillStyle(0x4caf50, 1);
    groundGfx.fillRect(0, height - 140, width, 140);
    // Road
    groundGfx.fillStyle(0x666666, 1);
    groundGfx.fillRect(0, height - 100, width, 60);
    // Road lines
    groundGfx.fillStyle(0xffff00, 1);
    for (let x = 0; x < width; x += 60) {
      groundGfx.fillRect(x, height - 72, 30, 4);
    }

    // ── Title ──
    this.add.text(cx, 30, 'CarryTales: 9 + 8 = ?', {
      fontSize: '36px',
      color: '#ffffff',
      fontFamily: 'system-ui, sans-serif',
      fontStyle: 'bold',
      stroke: '#333366',
      strokeThickness: 4,
    }).setOrigin(0.5, 0).setDepth(15);

    // ── Houses (positioned off-screen — phases will slide them in) ──
    const groundY = height - 140;

    const tensHouse = new House(this, 220, groundY, {
      label: 'TENS',
      bodyColor: 0x8B4513,
      roofColor: 0xCC3333,
    });
    tensHouse.setDepth(5);
    tensHouse.setVisible(false);

    const onesHouse = new House(this, 850, groundY, {
      label: 'ONES',
      bodyColor: 0x6B8E23,
      roofColor: 0x2255CC,
    });
    onesHouse.setDepth(5);
    onesHouse.setVisible(false);

    // Pre-populate tens house with 4 and 5
    tensHouse.addDigitInside('4', -20);
    tensHouse.addDigitInside('5', 20);

    // ── Shared context for phases ──
    const ctx = {
      onesHouse,
      tensHouse,
      groundY: groundY - 50, // characters stand slightly above ground
      char9: null,
      char8: null,
      char17: null,
      char7: null,
      char1: null,
      equationText: null,
    };

    // ── "Click to Start" prompt (required for TTS) ──
    const promptBg = this.add.rectangle(cx, height / 2, 400, 120, 0x000000, 0.7)
      .setDepth(50);
    const promptText = this.add.text(cx, height / 2 - 15, 'Click to Start!', {
      fontSize: '36px',
      color: '#ffffff',
      fontFamily: 'system-ui, sans-serif',
      fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(51);

    const promptSub = this.add.text(cx, height / 2 + 25, '(enables narration)', {
      fontSize: '18px',
      color: '#aaaaaa',
      fontFamily: 'system-ui, sans-serif',
    }).setOrigin(0.5).setDepth(51);

    // Pulse animation
    this.tweens.add({
      targets: promptText,
      scaleX: 1.08,
      scaleY: 1.08,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Wait for click, then start
    this.input.once('pointerdown', () => {
      promptBg.destroy();
      promptText.destroy();
      promptSub.destroy();

      // Start the story
      const phases = createPhases();
      const manager = new PhaseManager(this, phases, ctx);
      this._phaseManager = manager;
      manager.runAll();
    });
  }

  _drawCloud(gfx, x, y, size) {
    gfx.fillStyle(0xffffff, 0.7);
    gfx.fillCircle(x, y, size * 0.5);
    gfx.fillCircle(x + size * 0.4, y - size * 0.15, size * 0.4);
    gfx.fillCircle(x + size * 0.8, y, size * 0.45);
    gfx.fillCircle(x + size * 0.4, y + size * 0.1, size * 0.35);
  }

  shutdown() {
    this._phaseManager?.cancel();
    Narrator.stop();
  }
}
