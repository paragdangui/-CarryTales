import Phaser from 'phaser';

export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadScene' });
  }

  preload() {
    const { width, height } = this.scale;
    const cx = width / 2;
    const cy = height / 2;

    // --- Loading bar ---
    const barBg = this.add.rectangle(cx, cy, 400, 24, 0x333355);
    const bar = this.add.rectangle(cx - 200, cy, 0, 20, 0xff9933);
    bar.setOrigin(0, 0.5);

    const label = this.add
      .text(cx, cy - 30, 'Loading…', {
        fontSize: '18px',
        color: '#ffffff',
        fontFamily: 'system-ui, sans-serif',
      })
      .setOrigin(0.5);

    this.load.on('progress', (value) => {
      bar.width = 400 * value;
    });

    this.load.on('complete', () => {
      label.setText('Ready!');
    });
  }

  create() {
    this.scene.start('GameScene');
  }
}
