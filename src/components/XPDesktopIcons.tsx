import React, { useState } from 'react';
import trashIcon from '../assets/images/trash.png';
import ieIcon from '../assets/images/ie.png';

interface DesktopIcon {
  id: string;
  label: string;
  icon: React.ReactNode;
  onDoubleClick?: () => void;
  isShortcut?: boolean;
}

const icons: DesktopIcon[] = [
  {
    id: 'recycle',
    label: 'Lixeira',
    icon: <img src={trashIcon} alt="Lixeira" width="40" height="40" style={{ objectFit: 'contain' }} />,
    onDoubleClick: undefined,
    isShortcut: false,
  },
  {
    id: 'youtube',
    label: '1155doET',
    icon: <img src={ieIcon} alt="YouTube" width="40" height="40" style={{ objectFit: 'contain' }} />,
    onDoubleClick: () => window.open('https://www.youtube.com/@1155doET', '_blank'),
    isShortcut: true,
  },
  {
    id: 'github',
    label: 'GitHub',
    icon: (
      <svg viewBox="0 0 64 64" width="40" height="40">
        <circle cx="32" cy="32" r="30" fill="#24292e"/>
        <path fill="white" d="M32 10C19.85 10 10 19.85 10 32c0 9.73 6.31 17.99 15.07 20.91
          1.1.2 1.5-.48 1.5-1.06v-3.7c-6.13 1.33-7.42-2.96-7.42-2.96-.99-2.52-2.43-3.19-2.43-3.19
          -1.99-1.36.15-1.33.15-1.33 2.2.16 3.36 2.26 3.36 2.26 1.95 3.35 5.12 2.38 6.37 1.82
          .2-1.42.76-2.38 1.39-2.93-4.89-.56-10.03-2.44-10.03-10.87 0-2.4.86-4.37 2.26-5.9
          -.23-.56-.98-2.79.21-5.82 0 0 1.84-.59 6.02 2.24A20.9 20.9 0 0 1 32 21.3c1.86.01 3.74.25
          5.49.73 4.18-2.83 6.01-2.24 6.01-2.24 1.2 3.03.44 5.26.22 5.82 1.4 1.53 2.25 3.5
          2.25 5.9 0 8.45-5.15 10.3-10.06 10.85.79.68 1.49 2.02 1.49 4.07v6.02c0 .59.4 1.27
          1.52 1.06C47.7 49.98 54 41.72 54 32c0-12.15-9.85-22-22-22z"/>
      </svg>
    ),
    onDoubleClick: () => window.open('https://github.com/Brunomas1', '_blank'),
    isShortcut: true,
  },
];

const XPDesktopIcons: React.FC = () => {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 1,
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 16,
          left: 16,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          pointerEvents: 'auto',
        }}
      >
        {icons.map((icon) => (
          <div
            key={icon.id}
            className={`xp-desktop-icon${selected === icon.id ? ' xp-desktop-icon-selected' : ''}`}
            onClick={() => setSelected(icon.id)}
            onDoubleClick={() => {
              setSelected(icon.id);
              icon.onDoubleClick?.();
            }}
            onBlur={() => setSelected(null)}
            tabIndex={0}
            style={{ outline: 'none' }}
          >
            <div className="xp-icon-container">
              {icon.icon}
              {icon.isShortcut && <div className="xp-shortcut-arrow" />}
            </div>
            <span className="xp-desktop-icon-label">{icon.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default XPDesktopIcons;
