import PhaserGame from '@components/PhaserGame.jsx';
import './App.css';

export default function App() {
  return (
    <div className="app-container">
      {/* Phaser canvas lives at z-index 0 */}
      <PhaserGame />

      {/* React UI overlays go here at z-index 10+
          e.g. <HUD />, <NarrationSubtitles />, <ScorePanel />
      */}
    </div>
  );
}
