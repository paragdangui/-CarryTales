import Phaser from 'phaser';
import AudioManager from '@audio/AudioManager.js';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  create() {
    const { width, height } = this.scale;
    const cx = width / 2;
    const cy = height / 2;

    // Title
    this.add
      .text(cx, cy - 120, 'CarryTales', {
        fontSize: '64px',
        color: '#ff9933',
        fontFamily: 'system-ui, sans-serif',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    // Engine status
    this.add
      .text(cx, cy - 40, 'Phaser is running!', {
        fontSize: '28px',
        color: '#ffffff',
        fontFamily: 'system-ui, sans-serif',
      })
      .setOrigin(0.5);

    // Sample equation
    this.add
      .text(cx, cy + 20, '9  +  8  =  17', {
        fontSize: '36px',
        color: '#00cccc',
        fontFamily: 'system-ui, sans-serif',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    // Bouncing label — proves the Phaser update/tween loop is alive
    const arrow = this.add
      .text(cx, cy + 120, '▼  Ones House', {
        fontSize: '22px',
        color: '#aaffaa',
        fontFamily: 'system-ui, sans-serif',
      })
      .setOrigin(0.5);

    this.tweens.add({
      targets: arrow,
      y: cy + 140,
      duration: 600,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Verify AudioManager is wired up
    console.log('AudioManager ready:', typeof AudioManager.play);
  }
}
