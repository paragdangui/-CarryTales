import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { getGameConfig } from '@game/GameConfig.js';

export default function PhaserGame() {
  const containerRef = useRef(null);
  const gameInstanceRef = useRef(null);

  useEffect(() => {
    // Guard against React 19 StrictMode double-invocation
    if (gameInstanceRef.current) return;

    const config = getGameConfig(containerRef.current);
    gameInstanceRef.current = new Phaser.Game(config);

    return () => {
      // Destroy Phaser on unmount to prevent WebGL context leaks
      if (gameInstanceRef.current) {
        gameInstanceRef.current.destroy(true);
        gameInstanceRef.current = null;
      }
    };
  }, []);

  return <div id="phaser-container" ref={containerRef} />;
}
