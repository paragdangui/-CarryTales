import Phaser from 'phaser';
import tweenPromise from '@game/utils/tweenPromise.js';

/**
 * A place-value house drawn with Phaser primitives.
 * Has a body, roof (triangle), small door, optional roof opening, and label.
 */
export default class House extends Phaser.GameObjects.Container {
  /**
   * @param {Phaser.Scene} scene
   * @param {number} x – center x of the house
   * @param {number} y – bottom y of the house
   * @param {object} opts
   * @param {string} opts.label – "ONES" or "TENS"
   * @param {number} [opts.bodyColor=0x8B4513]
   * @param {number} [opts.roofColor=0xCC3333]
   * @param {number} [opts.width=220]
   * @param {number} [opts.height=220]
   */
  constructor(scene, x, y, opts = {}) {
    super(scene, x, y);

    /** Original x position – used as slide-in target. */
    this._homeX = x;

    this.label = opts.label || 'HOUSE';
    this.bodyColor = opts.bodyColor ?? 0x8B4513;
    this.roofColor = opts.roofColor ?? 0xCC3333;
    this.houseWidth = opts.width || 220;
    this.houseHeight = opts.height || 220;
    this.roofHeight = 70;

    /** @type {Phaser.GameObjects.Text[]} */
    this._insideDigits = [];
    this._doorOpen = false;

    this._build();
    scene.add.existing(this);
  }

  /** Position where a character should stand in front of the door. */
  get doorFrontPos() {
    return {
      x: this.x,
      y: this.y + 10,
    };
  }

  /** Position of the roof opening (for carry fly target). */
  get roofOpeningPos() {
    return {
      x: this.x,
      y: this.y - this.houseHeight - this.roofHeight + 20,
    };
  }

  _build() {
    const w = this.houseWidth;
    const h = this.houseHeight;
    const rh = this.roofHeight;
    const hw = w / 2;

    const gfx = this.scene.add.graphics();

    // House body
    gfx.fillStyle(this.bodyColor, 1);
    gfx.fillRect(-hw, -h, w, h);
    gfx.lineStyle(3, 0x000000, 0.4);
    gfx.strokeRect(-hw, -h, w, h);

    // Brick pattern
    gfx.lineStyle(1, 0x000000, 0.15);
    for (let row = -h + 20; row < 0; row += 20) {
      gfx.lineBetween(-hw, row, hw, row);
      const offset = ((row / 20) % 2 === 0) ? 0 : w / 6;
      for (let col = -hw + offset; col < hw; col += w / 3) {
        gfx.lineBetween(col, row, col, row + 20);
      }
    }

    // Roof (triangle)
    gfx.fillStyle(this.roofColor, 1);
    gfx.beginPath();
    gfx.moveTo(-hw - 15, -h);
    gfx.lineTo(0, -h - rh);
    gfx.lineTo(hw + 15, -h);
    gfx.closePath();
    gfx.fillPath();
    gfx.lineStyle(3, 0x000000, 0.4);
    gfx.beginPath();
    gfx.moveTo(-hw - 15, -h);
    gfx.lineTo(0, -h - rh);
    gfx.lineTo(hw + 15, -h);
    gfx.closePath();
    gfx.strokePath();

    this.add(gfx);
    this._gfx = gfx;

    // Door
    const doorW = 50;
    const doorH = 65;
    this._door = this.scene.add.graphics();
    this._door.fillStyle(0x5c3317, 1);
    this._door.fillRoundedRect(-doorW / 2, -doorH, doorW, doorH, 4);
    this._door.lineStyle(2, 0x3d2010, 1);
    this._door.strokeRoundedRect(-doorW / 2, -doorH, doorW, doorH, 4);
    // Door knob
    this._door.fillStyle(0xffd700, 1);
    this._door.fillCircle(doorW / 2 - 10, -doorH / 2, 4);
    this.add(this._door);
    this._doorWidth = doorW;

    // Roof opening (hidden initially — shown for tens house carry)
    this._roofOpening = this.scene.add.graphics();
    this._roofOpening.fillStyle(0x000000, 0.7);
    this._roofOpening.fillRoundedRect(-20, -h - rh + 15, 40, 25, 6);
    this._roofOpening.setAlpha(0);
    this.add(this._roofOpening);

    // Label
    const labelText = this.scene.add.text(0, -h - rh - 20, this.label, {
      fontSize: '22px',
      color: '#ffffff',
      fontFamily: 'system-ui, sans-serif',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5);
    this.add(labelText);

    // "Single digit only!" sign on door
    this._doorSign = this.scene.add.text(0, -doorH - 10, 'One digit\nonly!', {
      fontSize: '11px',
      color: '#ffddaa',
      fontFamily: 'system-ui, sans-serif',
      fontStyle: 'italic',
      align: 'center',
    }).setOrigin(0.5);
    this._doorSign.setAlpha(0);
    this.add(this._doorSign);
  }

  /**
   * Flash the door to draw attention.
   * @returns {Promise<void>}
   */
  flashDoor() {
    return tweenPromise(this.scene, {
      targets: this._door,
      alpha: 0.3,
      duration: 200,
      yoyo: true,
      repeat: 2,
    });
  }

  /**
   * Show the "single digit only" sign.
   */
  showDoorSign() {
    this.scene.tweens.add({
      targets: this._doorSign,
      alpha: 1,
      duration: 300,
    });
  }

  /**
   * Animate the door opening.
   * @returns {Promise<void>}
   */
  openDoor() {
    this._doorOpen = true;
    return tweenPromise(this.scene, {
      targets: this._door,
      scaleX: 0.15,
      duration: 400,
      ease: 'Power2',
    });
  }

  /**
   * Animate the door closing.
   * @returns {Promise<void>}
   */
  closeDoor() {
    this._doorOpen = false;
    return tweenPromise(this.scene, {
      targets: this._door,
      scaleX: 1,
      duration: 300,
      ease: 'Power2',
    });
  }

  /**
   * Show the roof opening (for carry entry).
   * @returns {Promise<void>}
   */
  showRoofOpening() {
    return tweenPromise(this.scene, {
      targets: this._roofOpening,
      alpha: 1,
      duration: 500,
    });
  }

  /**
   * Hide the roof opening.
   * @returns {Promise<void>}
   */
  hideRoofOpening() {
    return tweenPromise(this.scene, {
      targets: this._roofOpening,
      alpha: 0,
      duration: 300,
    });
  }

  /**
   * Add a digit label inside the house.
   * @param {string|number} digit
   * @param {number} [offsetX=0]
   */
  addDigitInside(digit, offsetX = 0) {
    const h = this.houseHeight;
    const text = this.scene.add.text(offsetX, -h / 2, String(digit), {
      fontSize: '32px',
      color: '#ffffff',
      fontFamily: 'system-ui, sans-serif',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5);
    this.add(text);
    this._insideDigits.push(text);
    return text;
  }

  /**
   * Slide the entire house in from off-screen.
   * @param {'left'|'right'} direction
   * @param {number} [duration=800]
   * @returns {Promise<void>}
   */
  slideIn(direction, duration = 800) {
    const targetX = this._homeX;
    this.x = direction === 'left' ? -300 : this.scene.scale.width + 300;
    this.setVisible(true);
    return tweenPromise(this.scene, {
      targets: this,
      x: targetX,
      duration,
      ease: 'Back.easeOut',
    });
  }
}
