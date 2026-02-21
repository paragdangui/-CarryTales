import PhaserGame from '@components/PhaserGame.jsx';
import SubtitleOverlay from '@components/SubtitleOverlay.jsx';
import './App.css';

export default function App() {
  return (
    <div className="app-container">
      <PhaserGame />
      <div className="ui-overlay">
        <SubtitleOverlay />
      </div>
    </div>
  );
}
