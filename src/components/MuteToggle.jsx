import { useState } from 'react';
import Narrator from '@/audio/Narrator.js';

export default function MuteToggle() {
  const [muted, setMuted] = useState(Narrator.muted);

  const toggle = () => {
    const next = !muted;
    Narrator.muted = next;
    if (next && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setMuted(next);
  };

  return (
    <button className="mute-toggle interactive" onClick={toggle} title={muted ? 'Unmute' : 'Mute'}>
      {muted ? '🔇' : '🔊'}
    </button>
  );
}
