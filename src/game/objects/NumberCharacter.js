import Phaser from 'phaser';
import tweenPromise from '@game/utils/tweenPromise.js';

const COLORS = {
  0: 0x888888,
  1: 0xff6b6b,
  2: 0x4ecdc4,
  3: 0xffe66d,
  4: 0xa29bfe,
  5: 0x55efc4,
  6: 0xfd79a8,
  7: 0x74b9ff,
  8: 0xffa502,
  9: 0xe056fd,
};

/**
 * A number character — a colored circle with a digit, eyes, and a mouth.
 * All animation methods return Promises for easy async sequencing.
 */
export default class NumberCharacter extends Phaser.GameObjects.Container {
  /**
   * @param {Phaser.Scene} scene
   * @param {number} x
   * @param {number} y
   * @param {number|string} digit – the digit(s) to display
   * @param {object} [opts]
   * @param {number} [opts.radius=36]
   */
  constructor(scene, x, y, digit, opts = {}) {
    super(scene, x, y);
    this.digit = String(digit);
    this.radius = opts.radius || 36;

    this._buildBody();
    scene.add.existing(this);
  }

  _buildBody() {
    const r = this.radius;
    const isDouble = this.digit.length > 1;
    const bodyWidth = isDouble ? r * 3.2 : r * 2;

    // Body circle (or rounded rect for multi-digit)
    const gfx = this.scene.add.graphics();
    const color = COLORS[Number(this.digit[0])] || 0xcccccc;

    if (isDouble) {
      gfx.fillStyle(color, 1);
      gfx.fillRoundedRect(-bodyWidth / 2, -r, bodyWidth, r * 2, r * 0.6);
      gfx.lineStyle(3, 0xffffff, 0.6);
      gfx.strokeRoundedRect(-bodyWidth / 2, -r, bodyWidth, r * 2, r * 0.6);
    } else {
      gfx.fillStyle(color, 1);
      gfx.fillCircle(0, 0, r);
      gfx.lineStyle(3, 0xffffff, 0.6);
      gfx.strokeCircle(0, 0, r);
    }
    this.add(gfx);
    this._bodyGfx = gfx;

    // Digit text
    const digitText = this.scene.add.text(0, 2, this.digit, {
      fontSize: `${Math.floor(r * 1.1)}px`,
      color: '#ffffff',
      fontFamily: 'system-ui, sans-serif',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5);
    this.add(digitText);
    this._digitText = digitText;

    // Eyes
    const eyeY = -r * 0.3;
    const eyeSpacing = isDouble ? r * 0.5 : r * 0.35;
    const leftEye = this.scene.add.circle(-eyeSpacing, eyeY, r * 0.12, 0xffffff);
    const rightEye = this.scene.add.circle(eyeSpacing, eyeY, r * 0.12, 0xffffff);
    const leftPupil = this.scene.add.circle(-eyeSpacing, eyeY, r * 0.06, 0x000000);
    const rightPupil = this.scene.add.circle(eyeSpacing, eyeY, r * 0.06, 0x000000);
    this.add([leftEye, rightEye, leftPupil, rightPupil]);
    this._eyes = { leftEye, rightEye, leftPupil, rightPupil };

    // Mouth — small arc (happy by default)
    this._mouthGfx = this.scene.add.graphics();
    this.add(this._mouthGfx);
    this.showEmotion('happy');
  }

  /**
   * Change the character's facial expression.
   * @param {'happy'|'sad'|'surprised'|'neutral'} emotion
   */
  showEmotion(emotion) {
    const g = this._mouthGfx;
    const r = this.radius;
    g.clear();
    g.lineStyle(2, 0x000000, 1);

    const mouthY = r * 0.35;

    switch (emotion) {
      case 'happy':
        g.beginPath();
        g.arc(0, mouthY - 4, r * 0.2, 0.1 * Math.PI, 0.9 * Math.PI);
        g.strokePath();
        break;
      case 'sad':
        g.beginPath();
        g.arc(0, mouthY + 8, r * 0.2, 1.1 * Math.PI, 1.9 * Math.PI);
        g.strokePath();
        break;
      case 'surprised':
        g.fillStyle(0x000000, 1);
        g.fillCircle(0, mouthY, r * 0.12);
        break;
      case 'neutral':
        g.beginPath();
        g.moveTo(-r * 0.15, mouthY);
        g.lineTo(r * 0.15, mouthY);
        g.strokePath();
        break;
    }
  }

  /**
   * Walk (slide) to a position.
   * @param {number} toX
   * @param {number} toY
   * @param {number} [duration=1000]
   * @returns {Promise<void>}
   */
  walkTo(toX, toY, duration = 1000) {
    // Simple bounce while walking
    this.scene.tweens.add({
      targets: this,
      scaleY: 0.92,
      duration: 150,
      yoyo: true,
      repeat: Math.floor(duration / 300),
      ease: 'Sine.easeInOut',
    });

    return tweenPromise(this.scene, {
      targets: this,
      x: toX,
      y: toY,
      duration,
      ease: 'Power1',
    });
  }

  /**
   * Fly along a bezier arc (used for the carry animation).
   * @param {number} toX
   * @param {number} toY
   * @param {number} [duration=1500]
   * @returns {Promise<void>}
   */
  flyTo(toX, toY, duration = 1500) {
    const startX = this.x;
    const startY = this.y;
    const cpX = (startX + toX) / 2;
    const cpY = Math.min(startY, toY) - 200; // arc above

    const curve = new Phaser.Curves.QuadraticBezier(
      new Phaser.Math.Vector2(startX, startY),
      new Phaser.Math.Vector2(cpX, cpY),
      new Phaser.Math.Vector2(toX, toY)
    );

    // Trail particles via graphics
    const trail = this.scene.add.graphics();
    trail.setDepth(this.depth - 1);

    const progress = { t: 0 };

    return new Promise((resolve) => {
      this.scene.tweens.add({
        targets: progress,
        t: 1,
        duration,
        ease: 'Sine.easeInOut',
        onUpdate: () => {
          const point = curve.getPoint(progress.t);
          this.setPosition(point.x, point.y);

          // Draw trail dot
          trail.fillStyle(0xffff00, 0.6 - progress.t * 0.5);
          trail.fillCircle(point.x, point.y, 4);
        },
        onComplete: () => {
          this.scene.tweens.add({
            targets: trail,
            alpha: 0,
            duration: 500,
            onComplete: () => trail.destroy(),
          });
          resolve();
        },
      });
    });
  }

  /**
   * Shake the character (e.g. when rejected from door).
   * @param {number} [duration=500]
   * @returns {Promise<void>}
   */
  shake(duration = 500) {
    const origX = this.x;
    return tweenPromise(this.scene, {
      targets: this,
      x: origX - 8,
      duration: 50,
      yoyo: true,
      repeat: Math.floor(duration / 100),
      ease: 'Sine.easeInOut',
    });
  }

  /**
   * Shrink and fade out.
   * @param {number} [duration=400]
   * @returns {Promise<void>}
   */
  shrink(duration = 400) {
    return tweenPromise(this.scene, {
      targets: this,
      scaleX: 0,
      scaleY: 0,
      alpha: 0,
      duration,
      ease: 'Back.easeIn',
    });
  }

  /**
   * Pop in from zero scale.
   * @param {number} [duration=400]
   * @returns {Promise<void>}
   */
  popIn(duration = 400) {
    this.setScale(0);
    this.setAlpha(1);
    return tweenPromise(this.scene, {
      targets: this,
      scaleX: 1,
      scaleY: 1,
      duration,
      ease: 'Back.easeOut',
    });
  }

  /**
   * Bounce in place (celebration).
   * @param {number} [times=3]
   * @returns {Promise<void>}
   */
  bounce(times = 3) {
    return tweenPromise(this.scene, {
      targets: this,
      y: this.y - 30,
      duration: 250,
      yoyo: true,
      repeat: times - 1,
      ease: 'Sine.easeOut',
    });
  }
}
