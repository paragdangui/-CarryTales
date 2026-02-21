import PhaserGame from '@components/PhaserGame.jsx';
import SubtitleOverlay from '@components/SubtitleOverlay.jsx';
import MuteToggle from '@components/MuteToggle.jsx';
import './App.css';

export default function App() {
  return (
    <div className="app-container">
      <PhaserGame />
      <div className="ui-overlay">
        <MuteToggle />
        <SubtitleOverlay />
      </div>
    </div>
  );
}
