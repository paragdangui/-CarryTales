/**
 * Wraps Phaser's scene.tweens.add in a Promise so animations
 * can be sequenced with async/await.
 * @param {Phaser.Scene} scene
 * @param {object} config  – standard Phaser tween config (targets, props, etc.)
 * @returns {Promise<void>}
 */
export default function tweenPromise(scene, config) {
  return new Promise((resolve) => {
    scene.tweens.add({
      ...config,
      onComplete: (...args) => {
        config.onComplete?.(...args);
        resolve();
      },
    });
  });
}
