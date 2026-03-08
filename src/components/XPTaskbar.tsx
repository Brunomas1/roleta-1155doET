import React, { useState } from 'react';
import { cn } from '../lib/utils';
import windowsLogo from '../assets/images/windows-logo.png';
import { useDraggable } from '../hooks/useDraggable';

interface WindowEntry {
  id: string;
  title: string;
  icon: string;
  minimized: boolean;
  onToggle: () => void;
}

interface FakeApp {
  id: string;
  name: string;
  icon: string;
  content: React.ReactNode;
}

interface XPTaskbarProps {
  windows: WindowEntry[];
  muteSound: boolean;
  onToggleMute: () => void;
}


// Fake hardware data
const cpuReadings = ['Intel Core i7-3770', '65°C', '3.4 GHz', 'TDP: 77W'];
const gpuReadings = ['NVIDIA GeForce GTX 960', '72°C', '1127 MHz', 'Mem: 2048MB'];
const hwReadings = [
  ['CPU', '65°C', '100%'],
  ['GPU', '72°C', '88%'],
  ['RAM', '37°C', '62%'],
  ['HDD', '31°C', '—'],
];

function CPUZContent() {
  return (
    <div className="xp-body" style={{ padding: '10px 12px', fontSize: 11, fontFamily: 'Tahoma' }}>
      <div className="xp-panel" style={{ marginBottom: 8, padding: '6px 10px' }}>
        <div style={{ fontWeight: 'bold', color: '#316ac5', marginBottom: 4 }}>Processor</div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          {[['Name', 'Intel Core i3-2100'],['Code Name','Sandy Bridge'],['Cores','2'],['Threads','4'],['Clock','3.10 GHz'],['Cache','3 MB']].map(([k,v]) => (
            <tr key={k}>
              <td style={{ color: '#555', paddingRight: 12, paddingBottom: 2 }}>{k}</td>
              <td style={{ fontWeight: 'bold' }}>{v}</td>
            </tr>
          ))}
        </table>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        {cpuReadings.map(r => (
          <div key={r} className="xp-raised" style={{ flex: 1, textAlign: 'center', padding: '4px 6px', fontSize: 10 }}>{r}</div>
        ))}
      </div>
    </div>
  );
}

function GPUZContent() {
  return (
    <div className="xp-body" style={{ padding: '10px 12px', fontSize: 11, fontFamily: 'Tahoma' }}>
      <div className="xp-panel" style={{ marginBottom: 8, padding: '6px 10px' }}>
        <div style={{ fontWeight: 'bold', color: '#316ac5', marginBottom: 4 }}>Graphics Card</div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          {[['Name','Radeon RX 580'],['Vendor','AMD'],['Memory','8192 MB GDDR5'],['Bus','PCIe 3.0 x16'],['Driver','Adrenalin 23.5.2'],['DirectX','12']].map(([k,v]) => (
            <tr key={k}>
              <td style={{ color: '#555', paddingRight: 12, paddingBottom: 2 }}>{k}</td>
              <td style={{ fontWeight: 'bold' }}>{v}</td>
            </tr>
          ))}
        </table>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        {gpuReadings.map(r => (
          <div key={r} className="xp-raised" style={{ flex: 1, textAlign: 'center', padding: '4px 6px', fontSize: 10 }}>{r}</div>
        ))}
      </div>
    </div>
  );
}

function HWMonitorContent() {
  return (
    <div className="xp-body" style={{ padding: '10px 12px', fontSize: 11, fontFamily: 'Tahoma' }}>
      <div className="xp-panel" style={{ padding: '4px 8px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #d0d0d0' }}>
              {['Sensor', 'Temp', 'Load'].map(h => (
                <th key={h} style={{ textAlign: 'left', color: '#316ac5', paddingBottom: 4, paddingRight: 12, fontWeight: 'bold', fontSize: 10 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {hwReadings.map(([s, t, l]) => (
              <tr key={s} style={{ borderBottom: '1px solid #ece9d8' }}>
                <td style={{ padding: '3px 12px 3px 0', fontWeight: 'bold' }}>{s}</td>
                <td style={{ padding: '3px 12px 3px 0', color: Number(t.replace('°C','')) > 70 ? '#c00' : '#080' }}>{t}</td>
                <td style={{ padding: '3px 0' }}>{l}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const FAKE_APPS: FakeApp[] = [
  { id: 'cpuz', name: 'CPU-Z',      icon: '🖥️', content: <CPUZContent /> },
  { id: 'gpuz', name: 'GPU-Z',      icon: '🎮', content: <GPUZContent /> },
  { id: 'hwm',  name: 'HWMonitor',  icon: '🌡️', content: <HWMonitorContent /> },
];

const XPTaskbar: React.FC<XPTaskbarProps> = ({ windows, muteSound, onToggleMute }) => {
  const [openApp, setOpenApp] = useState<string | null>(null);
  const { style: dragStyle, onMouseDown: onDragStart, containerRef } = useDraggable('xp_fake_app', { 
    x: window.innerWidth / 2 - 180, 
    y: window.innerHeight / 2 - 180 
  });

  const toggleApp = (id: string) => {
    if (openApp === id) { setOpenApp(null); return; }
    setOpenApp(id);
  };

  const activeApp = FAKE_APPS.find(a => a.id === openApp);

  return (
    <>
      {/* Fake app popup */}
      {activeApp && (
        <div 
          ref={containerRef}
          className="xp-fake-app" 
          style={{ ...dragStyle, visibility: activeApp ? 'visible' : 'hidden' }}
        >
          <div className="xp-titlebar" style={{ cursor: 'grab' }} onMouseDown={onDragStart}>
            <span style={{ fontSize: 13 }}>{activeApp.icon}</span>
            <span className="xp-titlebar-text">{activeApp.name}</span>
            <div className="xp-titlebar-controls">
              <button className="xp-btn-wc xp-btn-minmax">_</button>
              <button className="xp-btn-wc xp-btn-minmax">□</button>
              <button className="xp-btn-wc xp-btn-close" onMouseDown={e => e.stopPropagation()} onClick={() => setOpenApp(null)}>✕</button>
            </div>
          </div>
          {activeApp.content}
          <div className="xp-statusbar">
            <span>{activeApp.name} v1.77.1</span>
            <span style={{ marginLeft: 'auto' }}>Sistema OK</span>
          </div>
        </div>
      )}

      {/* Taskbar */}
      <div className="xp-taskbar">
        {/* Start button */}
        <button className="xp-start-btn">
          <img src={windowsLogo} alt="Windows" style={{width:18, height:18, objectFit:'contain'}} />
          <span>Iniciar</span>
        </button>

        <div className="xp-taskbar-divider" />

        {/* Window buttons */}
        <div className="xp-taskbar-area">
          {windows.map(w => (
            <button
              key={w.id}
              className={cn('xp-taskbar-btn', w.minimized ? 'xp-taskbar-btn-minimized' : 'xp-taskbar-btn-active')}
              onClick={w.onToggle}
            >
              <span style={{ fontSize: 12 }}>{w.icon}</span>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{w.title}</span>
            </button>
          ))}

          <div className="xp-taskbar-divider" />

          {/* Fake program buttons */}
          {FAKE_APPS.map(app => (
            <button
              key={app.id}
              className={cn('xp-taskbar-btn', openApp === app.id ? 'xp-taskbar-btn-active' : '')}
              onClick={() => toggleApp(app.id)}
            >
              <span style={{ fontSize: 12 }}>{app.icon}</span>
              <span>{app.name}</span>
            </button>
          ))}
        </div>

        {/* System tray */}
        <div className="xp-taskbar-tray">
          <span
            className="xp-tray-icon"
            title={muteSound ? 'Ativar Som' : 'Desativar Som'}
            onClick={onToggleMute}
            style={{fontSize:16, cursor:'pointer'}}
          >
            {muteSound ? '🔇' : '🔊'}
          </span>
          <span className="xp-tray-icon" title="Network">🌐</span>
          <span className="xp-tray-icon" title="Antivirus">🛡️</span>
          <div style={{ width: 1, height: 16, background: '#4060a0', margin: '0 4px' }} />
          <span className="xp-tray-clock">17/05/2023</span>
          <span className="xp-tray-clock" style={{fontWeight:'bold'}}>11:55</span>
        </div>
      </div>
    </>
  );
};

export default XPTaskbar;
