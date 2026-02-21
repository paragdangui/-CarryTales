import NumberCharacter from '@game/objects/NumberCharacter.js';
import tweenPromise from '@game/utils/tweenPromise.js';

/**
 * Creates the array of 9 story phases.
 * Each phase: { name, narration, animate(scene, ctx) → Promise }
 *
 * ctx is the shared context object created by GameScene:
 *   { onesHouse, tensHouse, char9, char8, ... }
 */
export function createPhases() {
  return [
    // ── Phase 0: INTRO ──────────────────────────────────────────────
    {
      name: 'INTRO',
      narration:
        'Welcome to Carry Tales! See these two houses? ' +
        'The one on the right is the Ones house, and the one on the left is the Tens house. ' +
        'Each house has a small door. Only a single-digit number can fit through!',
      async animate(scene, ctx) {
        // Slide houses in
        await Promise.all([
          ctx.onesHouse.slideIn('right', 1000),
          ctx.tensHouse.slideIn('left', 1000),
        ]);

        // Flash doors
        await ctx.onesHouse.flashDoor();
        await ctx.tensHouse.flashDoor();

        // Show door signs
        ctx.onesHouse.showDoorSign();
        ctx.tensHouse.showDoorSign();

        await delay(scene, 500);
      },
    },

    // ── Phase 1: ADDITION ───────────────────────────────────────────
    {
      name: 'ADDITION',
      narration:
        "Let's try adding nine plus eight! Here they come, walking up to the ones house.",
      async animate(scene, ctx) {
        const groundY = ctx.groundY;

        // Create number 9 (walks in from left)
        ctx.char9 = new NumberCharacter(scene, -60, groundY, 9);
        ctx.char9.setDepth(10);

        // Create number 8 (walks in from right)
        ctx.char8 = new NumberCharacter(scene, scene.scale.width + 60, groundY, 8);
        ctx.char8.setDepth(10);

        // Walk them toward the ones house
        const doorPos = ctx.onesHouse.doorFrontPos;
        await Promise.all([
          ctx.char9.walkTo(doorPos.x - 60, groundY, 1500),
          ctx.char8.walkTo(doorPos.x + 60, groundY, 1500),
        ]);
      },
    },

    // ── Phase 2: DOOR_ATTEMPT ───────────────────────────────────────
    {
      name: 'DOOR_ATTEMPT',
      narration:
        'Nine plus eight equals seventeen! Seventeen tries to enter the ones house door. ' +
        'But oh no, seventeen is a two-digit number! It is too big for the small door!',
      async animate(scene, ctx) {
        const groundY = ctx.groundY;
        const doorPos = ctx.onesHouse.doorFrontPos;

        // Show equation text
        ctx.equationText = scene.add.text(
          scene.scale.width / 2, 80,
          '9 + 8 = 17',
          {
            fontSize: '48px',
            color: '#ffff00',
            fontFamily: 'system-ui, sans-serif',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 4,
          }
        ).setOrigin(0.5).setDepth(20);

        // Pop in equation
        ctx.equationText.setScale(0);
        await tweenPromise(scene, {
          targets: ctx.equationText,
          scaleX: 1, scaleY: 1,
          duration: 500,
          ease: 'Back.easeOut',
        });

        await delay(scene, 400);

        // Merge 9 and 8 into "17"
        await Promise.all([
          ctx.char9.shrink(300),
          ctx.char8.shrink(300),
        ]);

        // Create combined "17" character (wider)
        ctx.char17 = new NumberCharacter(scene, doorPos.x, groundY, '17', { radius: 36 });
        ctx.char17.setDepth(10);
        await ctx.char17.popIn(400);

        await delay(scene, 300);

        // 17 walks toward door
        await ctx.char17.walkTo(doorPos.x, doorPos.y - 30, 600);

        // Bounce back! Door is too small
        ctx.char17.showEmotion('surprised');
        await ctx.char17.shake(600);

        // Bounce 17 back from the door
        await ctx.char17.walkTo(doorPos.x, groundY, 400);
        ctx.char17.showEmotion('sad');
      },
    },

    // ── Phase 3: SPLIT ──────────────────────────────────────────────
    {
      name: 'SPLIT',
      narration:
        "Seventeen can't fit! So one and seven have a little argument and decide to split apart. " +
        "Seven says, I'll go into the ones house. One says, but where will I go?",
      async animate(scene, ctx) {
        const groundY = ctx.groundY;
        const doorPos = ctx.onesHouse.doorFrontPos;

        // Shake 17
        await ctx.char17.shake(800);

        // Shrink 17 and create separate 1 and 7
        await ctx.char17.shrink(300);

        ctx.char7 = new NumberCharacter(scene, doorPos.x + 20, groundY, 7);
        ctx.char7.setDepth(10);
        ctx.char7.showEmotion('happy');

        ctx.char1 = new NumberCharacter(scene, doorPos.x - 20, groundY, 1);
        ctx.char1.setDepth(10);
        ctx.char1.showEmotion('neutral');

        await Promise.all([
          ctx.char7.popIn(400),
          ctx.char1.popIn(400),
        ]);

        // Separate them a bit
        await Promise.all([
          ctx.char7.walkTo(doorPos.x + 50, groundY, 500),
          ctx.char1.walkTo(doorPos.x - 80, groundY, 500),
        ]);
      },
    },

    // ── Phase 4: SEVEN_ENTERS ───────────────────────────────────────
    {
      name: 'SEVEN_ENTERS',
      narration:
        'Seven walks up to the door. Seven is just one digit, so it fits perfectly! ' +
        'The door opens and seven happily walks inside the ones house!',
      async animate(scene, ctx) {
        const doorPos = ctx.onesHouse.doorFrontPos;

        // 7 walks to door
        ctx.char7.showEmotion('happy');
        await ctx.char7.walkTo(doorPos.x, doorPos.y - 30, 600);

        // Open door
        await ctx.onesHouse.openDoor();

        await delay(scene, 200);

        // 7 walks through (shrinks into house)
        await Promise.all([
          ctx.char7.walkTo(doorPos.x, doorPos.y - 80, 500),
          tweenPromise(scene, {
            targets: ctx.char7,
            scaleX: 0.3, scaleY: 0.3,
            alpha: 0,
            duration: 500,
          }),
        ]);

        // Close door
        await ctx.onesHouse.closeDoor();

        // Show 7 inside the house
        ctx.onesHouse.addDigitInside('7');
      },
    },

    // ── Phase 5: ONE_SAD ────────────────────────────────────────────
    {
      name: 'ONE_SAD',
      narration:
        "Poor number one! One doesn't belong in the ones house because the seven already took the spot. " +
        "One feels sad and looks around. Then one spots the tens house on the other side! " +
        "Maybe one can go there instead!",
      async animate(scene, ctx) {
        const groundY = ctx.groundY;

        // 1 shows sad emotion
        ctx.char1.showEmotion('sad');
        await ctx.char1.shake(400);

        await delay(scene, 500);

        // 1 looks toward tens house (turns/bounces toward left)
        ctx.char1.showEmotion('surprised');
        await ctx.char1.bounce(2);

        await delay(scene, 300);

        // Walk 1 to the middle area
        await ctx.char1.walkTo(scene.scale.width / 2, groundY, 800);
        ctx.char1.showEmotion('happy');
      },
    },

    // ── Phase 6: CARRY_FLY ──────────────────────────────────────────
    {
      name: 'CARRY_FLY',
      narration:
        'Number one decides to fly up to the roof of the tens house! ' +
        'This is called carrying! When a sum is too big for the ones house, ' +
        'the extra digit carries over to the tens house. Whoooosh!',
      async animate(scene, ctx) {
        // Show roof opening on tens house
        await ctx.tensHouse.showRoofOpening();

        await delay(scene, 300);

        // Fly!
        ctx.char1.showEmotion('happy');
        const roofPos = ctx.tensHouse.roofOpeningPos;
        await ctx.char1.flyTo(roofPos.x, roofPos.y, 2000);

        // 1 enters through roof (shrink into opening)
        await ctx.char1.shrink(400);

        // Close roof opening
        await ctx.tensHouse.hideRoofOpening();
      },
    },

    // ── Phase 7: TENS_WELCOME ───────────────────────────────────────
    {
      name: 'TENS_WELCOME',
      narration:
        'Four and five were already inside the tens house. They welcome number one! ' +
        'Four plus five plus one equals ten! Now the tens house has ten in it!',
      async animate(scene, ctx) {
        // Show 4, 5, and 1 inside tens house
        const d4 = ctx.tensHouse.addDigitInside('4', -35);
        const d5 = ctx.tensHouse.addDigitInside('5', 0);
        const d1 = ctx.tensHouse.addDigitInside('1', 35);

        // Bounce them
        await delay(scene, 300);
        for (const d of [d4, d5, d1]) {
          await tweenPromise(scene, {
            targets: d,
            y: d.y - 15,
            duration: 200,
            yoyo: true,
            ease: 'Sine.easeOut',
          });
        }

        await delay(scene, 400);

        // Show sum text
        const sumText = scene.add.text(
          ctx.tensHouse.x, ctx.tensHouse.y - ctx.tensHouse.houseHeight - ctx.tensHouse.roofHeight - 55,
          '4 + 5 + 1 = 10',
          {
            fontSize: '28px',
            color: '#00ff88',
            fontFamily: 'system-ui, sans-serif',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 3,
          }
        ).setOrigin(0.5).setDepth(20);

        sumText.setScale(0);
        await tweenPromise(scene, {
          targets: sumText,
          scaleX: 1, scaleY: 1,
          duration: 400,
          ease: 'Back.easeOut',
        });

        ctx._sumText = sumText;
      },
    },

    // ── Phase 8: CELEBRATION ────────────────────────────────────────
    {
      name: 'CELEBRATION',
      narration:
        "And that's how carrying works in addition! " +
        "Nine plus eight equals seventeen. " +
        "Seven goes in the ones place, and one carries over to the tens place. " +
        "The final answer is one hundred and seven! " +
        "Great job! Click Play Again to try once more!",
      async animate(scene, ctx) {
        // Update equation text
        if (ctx.equationText) {
          ctx.equationText.setText('Answer: 107');
          ctx.equationText.setColor('#00ff00');
          await tweenPromise(scene, {
            targets: ctx.equationText,
            scaleX: 1.3, scaleY: 1.3,
            duration: 300,
            yoyo: true,
            ease: 'Sine.easeOut',
          });
        }

        // Confetti!
        createConfetti(scene);

        await delay(scene, 1500);

        // Play Again button
        const btnBg = scene.add.rectangle(
          scene.scale.width / 2, scene.scale.height - 80,
          240, 60, 0x4444ff, 1
        ).setDepth(25).setInteractive({ useHandCursor: true });

        const btnText = scene.add.text(
          scene.scale.width / 2, scene.scale.height - 80,
          'Play Again?',
          {
            fontSize: '28px',
            color: '#ffffff',
            fontFamily: 'system-ui, sans-serif',
            fontStyle: 'bold',
          }
        ).setOrigin(0.5).setDepth(26);

        // Hover effect
        btnBg.on('pointerover', () => btnBg.setFillStyle(0x6666ff));
        btnBg.on('pointerout', () => btnBg.setFillStyle(0x4444ff));

        btnBg.on('pointerdown', () => {
          scene.scene.restart();
        });

        // Pulse the button
        scene.tweens.add({
          targets: [btnBg, btnText],
          scaleX: 1.05,
          scaleY: 1.05,
          duration: 600,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut',
        });
      },
    },
  ];
}

// ── Helpers ─────────────────────────────────────────────────────────

function delay(scene, ms) {
  return new Promise((resolve) => scene.time.delayedCall(ms, resolve));
}

function createConfetti(scene) {
  const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff, 0xffa500];
  const { width } = scene.scale;

  for (let i = 0; i < 60; i++) {
    const x = Phaser.Math.Between(50, width - 50);
    const y = Phaser.Math.Between(-200, -20);
    const size = Phaser.Math.Between(4, 10);
    const color = Phaser.Utils.Array.GetRandom(colors);

    const piece = scene.add.rectangle(x, y, size, size * 1.5, color).setDepth(30);
    piece.setRotation(Phaser.Math.FloatBetween(0, Math.PI * 2));

    scene.tweens.add({
      targets: piece,
      y: scene.scale.height + 50,
      x: x + Phaser.Math.Between(-80, 80),
      rotation: piece.rotation + Phaser.Math.FloatBetween(-3, 3),
      duration: Phaser.Math.Between(1500, 3000),
      ease: 'Quad.easeIn',
      delay: Phaser.Math.Between(0, 800),
      onComplete: () => piece.destroy(),
    });
  }
}
