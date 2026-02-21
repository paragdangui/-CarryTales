import Phaser from 'phaser';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    // Nothing to load — boot is intentionally minimal
  }

  create() {
    this.scene.start('PreloadScene');
  }
}
