import React, { useState, useEffect } from 'react';
import { cn } from '../lib/utils';
import windowsLogo from '../assets/images/windows-logo.png';
import volumeIcon from '../assets/images/Volume.png';
import muteIcon from '../assets/images/Mute.png';
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
const cpuReadings = ['Intel Core i3-2100', '62°C', '3.10 GHz', 'TDP: 65W'];
const gpuReadings = ['AMD Radeon RX 580', '62°C', '1257 MHz', 'Mem: 8192MB'];
const hwReadings = [
  ['CPU', '67°C', '100%'],
  ['GPU', '62°C', '88%'],
  ['RAM', '37°C', '62%'],
  ['HDD', '31°C', '—'],
];

function CPUZContent() {
  return (
    <div style={{ padding: '4px', fontSize: 11, fontFamily: 'Tahoma' }}>
      <fieldset style={{ marginBottom: 8 }}>
        <legend>Processor</legend>
        <div className="sunken-panel" style={{ padding: '6px 10px', background: '#fff' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              {[['Name', 'Intel Core i3-2100'], ['Code Name', 'Sandy Bridge'], ['Cores', '2'], ['Threads', '4'], ['Clock', '3.10 GHz'], ['Cache', '3 MB']].map(([k, v]) => (
                <tr key={k}>
                  <td style={{ color: '#555', paddingRight: 12, paddingBottom: 2 }}>{k}</td>
                  <td style={{ fontWeight: 'bold' }}>{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </fieldset>
      <div style={{ display: 'flex', gap: 4 }}>
        {cpuReadings.map(r => (
          <div key={r} className="sunken-panel" style={{ flex: 1, textAlign: 'center', padding: '2px 4px', fontSize: 10, background: '#fff' }}>{r}</div>
        ))}
      </div>
    </div>
  );
}

function GPUZContent() {
  return (
    <div style={{ padding: '4px', fontSize: 11, fontFamily: 'Tahoma' }}>
      <fieldset style={{ marginBottom: 8 }}>
        <legend>Graphics Card</legend>
        <div className="sunken-panel" style={{ padding: '6px 10px', background: '#fff' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              {[['Name', 'Radeon RX 580'], ['Vendor', 'AMD'], ['Memory', '8192 MB GDDR5'], ['Bus', 'PCIe 3.0 x16'], ['Driver', 'Adrenalin 23.5.2'], ['DirectX', '12']].map(([k, v]) => (
                <tr key={k}>
                  <td style={{ color: '#555', paddingRight: 12, paddingBottom: 2 }}>{k}</td>
                  <td style={{ fontWeight: 'bold' }}>{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </fieldset>
      <div style={{ display: 'flex', gap: 4 }}>
        {gpuReadings.map(r => (
          <div key={r} className="sunken-panel" style={{ flex: 1, textAlign: 'center', padding: '2px 4px', fontSize: 10, background: '#fff' }}>{r}</div>
        ))}
      </div>
    </div>
  );
}

function HWMonitorContent() {
  return (
    <div style={{ padding: '8px 4px', fontSize: 11, fontFamily: 'Tahoma' }}>
      <div className="sunken-panel" style={{ background: '#fff' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #d0d0d0', background: '#f0f0f0' }}>
              {['Sensor', 'Temp', 'Load'].map(h => (
                <th key={h} style={{ textAlign: 'left', color: '#316ac5', padding: '4px 8px', fontWeight: 'bold', fontSize: 10 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {hwReadings.map(([s, t, l]) => (
              <tr key={s} style={{ borderBottom: '1px solid #ece9d8' }}>
                <td style={{ padding: '4px 8px', fontWeight: 'bold' }}>{s}</td>
                <td style={{ padding: '4px 8px', color: Number(t.replace('°C', '')) > 70 ? '#c00' : '#080' }}>{t}</td>
                <td style={{ padding: '4px 8px' }}>{l}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const FAKE_APPS: FakeApp[] = [
  { id: 'cpuz', name: 'CPU-Z', icon: '🖥️', content: <CPUZContent /> },
  { id: 'gpuz', name: 'GPU-Z', icon: '🎮', content: <GPUZContent /> },
  { id: 'hwm', name: 'HWMonitor', icon: '🌡️', content: <HWMonitorContent /> },
];

const XPTaskbar: React.FC<XPTaskbarProps> = ({ windows, muteSound, onToggleMute }) => {
  const [openApp, setOpenApp] = useState<string | null>(null);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
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
          className="window"
          style={{ ...dragStyle, visibility: activeApp ? 'visible' : 'hidden', position: 'absolute', width: 360, zIndex: 100 }}
        >
          <div className="title-bar" style={{ cursor: 'grab' }} onMouseDown={onDragStart}>
            <div className="title-bar-text">{activeApp.name}</div>
            <div className="title-bar-controls">
              <button aria-label="Minimize" />
              <button aria-label="Maximize" />
              <button aria-label="Close" onMouseDown={e => e.stopPropagation()} onClick={() => setOpenApp(null)} />
            </div>
          </div>
          <div className="window-body" style={{ margin: 0, padding: 2 }}>
            {activeApp.content}
            <div className="status-bar" style={{ marginTop: 4 }}>
              <p className="status-bar-field">{activeApp.name} v1.77.1</p>
              <p className="status-bar-field">Sistema OK</p>
            </div>
          </div>
        </div>
      )}

      {/* Taskbar */}
      <div className="xp-taskbar">
        {/* Start button */}
        <button className="xp-start-btn">
          <img src={windowsLogo} alt="Windows" style={{ width: 18, height: 18, objectFit: 'contain' }} />
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
          <button
            title={muteSound ? 'Ativar Som' : 'Desativar Som'}
            onClick={onToggleMute}
            style={{
              background: 'transparent',
              border: 'none',
              padding: 0,
              width: 16,
              height: 16,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: -28,
              marginLeft: -28
            }}
          >
            <img
              src={muteSound ? muteIcon : volumeIcon}
              alt={muteSound ? 'Muted' : 'Volume'}
              style={{ width: 16, height: 16, imageRendering: 'pixelated', display: 'block' }}
            />
          </button>

          <div style={{ width: 1, height: 16, background: '#4060a0', margin: '0 4px', opacity: 0.5 }} />
          <span className="xp-tray-clock">
            {time.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
          </span>
        </div>
      </div>
    </>
  );
};

export default XPTaskbar;
