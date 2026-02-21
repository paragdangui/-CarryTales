import { useState, useEffect } from 'react';
import EventBus from '@/utils/EventBus.js';

export default function SubtitleOverlay() {
  const [text, setText] = useState('');

  useEffect(() => {
    const handler = (subtitle) => setText(subtitle || '');
    EventBus.on('subtitle', handler);
    return () => EventBus.off('subtitle', handler);
  }, []);

  if (!text) return null;

  return (
    <div className="subtitle-bar">
      <p>{text}</p>
    </div>
  );
}
