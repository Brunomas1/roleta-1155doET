import React, { useState, useEffect, useRef } from 'react';
import { useDraggable } from '../hooks/useDraggable';
import { Hash, Type, Play, RotateCcw } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { soundManager } from '../utils/SoundManager';
import { FairnessManager } from '../utils/FairnessManager';
import confetti from 'canvas-confetti';
import { ShieldCheck, History as HistoryIcon } from 'lucide-react';
import XPTaskbar from './XPTaskbar';

interface HistoryItem {
  id: string;
  winner: string;
  serverSeed: string;
  clientSeed: string;
  nonce: number;
  hash: string;
  timestamp: number;
}

const MainDashboard: React.FC = () => {
  const [mode, setMode] = useState<'numbers' | 'text'>('text');
  const [textInput, setTextInput] = useState('');
  const [numRange, setNumRange] = useState({ min: 1, max: 10 });
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [showOverlay, setShowOverlay] = useState(false);
  const [muteSound, setMuteSound] = useState(false);
  const [isInstant, setIsInstant] = useState(false);
  const [xpProgress, setXpProgress] = useState(0);
  const [xpFile, setXpFile] = useState('');
  const [drawnNumbers, setDrawnNumbers] = useState<number[]>([]);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
  // Fairness & History State
  const [serverSeed, setServerSeed] = useState(FairnessManager.generateRandomSeed());
  const [nextServerHash, setNextServerHash] = useState('');
  const [clientSeed] = useState('1155-LUCK');
  const [useCustomSeed, setUseCustomSeed] = useState(false);
  const [customClientSeed, setCustomClientSeed] = useState('');
  const [nonce, setNonce] = useState(0);
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('roleta_history');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  // Compute the effective client seed
  const effectiveClientSeed = useCustomSeed && customClientSeed.trim() !== '' ? customClientSeed : clientSeed;

  // Save history to localStorage whenever it changes
  React.useEffect(() => {
    localStorage.setItem('roleta_history', JSON.stringify(history));
  }, [history]);

  // Pre-generate the next hash
  React.useEffect(() => {
    FairnessManager.sha256(serverSeed).then(setNextServerHash);
  }, [serverSeed]);

  React.useEffect(() => {
    import('../utils/SoundManager').then(m => {
      m.soundManager.isMuted = muteSound;
    });
  }, [muteSound]);

  // Memoized items to ensure stable references during animation
  const items = React.useMemo(() => {
    if (mode === 'text') {
      return textInput.split(/\r?\n/).map(t => t.trim()).filter(t => t !== '');
    } else {
      const list: string[] = [];
      const start = Math.min(numRange.min, numRange.max);
      const end = Math.max(numRange.min, numRange.max);
      const diff = end - start;
      const limit = 200;

      for (let i = 0; i <= Math.min(diff, limit); i++) {
        const val = start + i;
        if (!drawnNumbers.includes(val)) {
          list.push(val.toString());
        }
      }
      return list;
    }
  }, [mode, textInput, numRange, drawnNumbers]);

  const handleSpin = () => {
    if (items.length < 2) {
      alert("⚠️ Digite ao menos 2 opções para girar a roleta!");
      return;
    }
    setWinner(null);
    setXpProgress(0);
    
    // Provably Fair Derivation
    FairnessManager.deriveResult(serverSeed, effectiveClientSeed, nonce, items.length).then(derivedWinnerIndex => {
      const derivedWinner = items[derivedWinnerIndex];
      
      const newHistoryItem: HistoryItem = {
        id: Math.random().toString(36).substr(2, 9),
        winner: derivedWinner,
        serverSeed: serverSeed,
        clientSeed: effectiveClientSeed,
        nonce: nonce,
        hash: nextServerHash,
        timestamp: Date.now()
      };

      const finalizeResult = (winningItem: string) => {
        if (mode === 'text') {
          const lines = textInput.split(/\r?\n/);
          // Remove the first occurrence of the winning item to handle duplicates correctly if any
          const idx = lines.findIndex(l => l.trim() === winningItem);
          if (idx !== -1) {
            lines.splice(idx, 1);
            setTextInput(lines.join('\n'));
          }
        } else {
          setDrawnNumbers(prev => [...prev, parseInt(winningItem)]);
        }
      };

      if (!muteSound) soundManager.stopWin();

      if (isInstant) {
        setWinner(derivedWinner);
        finalizeResult(derivedWinner);
        setShowOverlay(true);
        if (!muteSound) soundManager.playWin();
        setHistory(prev => [newHistoryItem, ...prev].slice(0, 50));
        setNonce(prev => prev + 1);
        setServerSeed(FairnessManager.generateRandomSeed());
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
        return;
      }

      // XP Progress Bar mode
      setShowOverlay(true);
      setIsSpinning(true);
      setXpProgress(0);

      const fakeFiles = [
        'Roleta1155.exe',
        'sorteio_engine.dll',
        'winners_list.dat',
        'confetti_system32.dll',
        'legitimidade.sys',
        `resultado_${derivedWinner.substring(0,12).replace(/\s/g,'_')}.pkg`,
      ];
      let prog = 0;
      let fileIdx = 0;
      setXpFile(fakeFiles[0]);

      if (progressRef.current) clearInterval(progressRef.current);
      progressRef.current = setInterval(() => {
        prog += Math.random() * 3 + 1;
        if (prog > 100) prog = 100;
        setXpProgress(Math.round(prog));
        fileIdx = Math.floor((prog / 100) * (fakeFiles.length - 1));
        setXpFile(fakeFiles[Math.min(fileIdx, fakeFiles.length - 1)]);

        if (prog >= 100) {
          clearInterval(progressRef.current!);
          progressRef.current = null;
          setTimeout(() => {
            setIsSpinning(false);
            setWinner(derivedWinner);
            finalizeResult(derivedWinner);
            if (!muteSound) soundManager.playWin();
            confetti({ particleCount: 200, spread: 90, origin: { y: 0.5 } });
          }, 400);
        }
      }, 80);

      setHistory(prev => [newHistoryItem, ...prev].slice(0, 50));
      setNonce(prev => prev + 1);
      setServerSeed(FairnessManager.generateRandomSeed());
    });
  };

  useEffect(() => () => { if (progressRef.current) clearInterval(progressRef.current); }, []);

  const closeOverlay = () => {
    if (isSpinning) return;
    setShowOverlay(false);
    setWinner(null);
  };

  // Window is 844px wide, approx 600px tall — center it by default
  const mainDrag = useDraggable('xp_win_main', {
    x: Math.max(20, Math.round(window.innerWidth / 2 - 422)),
    y: Math.max(20, Math.round(window.innerHeight / 2 - 310)),
  });

  const [mainMin, setMainMin] = useState(() => localStorage.getItem('xp_min_main') === 'true');
  const toggleMain = () => setMainMin(v => { const n = !v; localStorage.setItem('xp_min_main', String(n)); return n; });

  const taskbarWindows = [
    { id: 'main', title: 'Roleta 1155 Edition', icon: '🎡', minimized: mainMin, onToggle: toggleMain },
  ];

  return (
    <div className="relative min-h-screen w-full overflow-hidden" style={{minHeight:'100vh'}}>
      <AnimatePresence>
        {!showOverlay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{position:'absolute',inset:0}}
          >
            {/* Single Unified Window - Config + History side by side */}
            <div
              ref={mainDrag.containerRef}
              style={{ ...mainDrag.style, width: 844, overflow:'hidden', display: mainMin ? 'none' : 'flex', flexDirection:'column' }}
              className="xp-window"
            >
              {/* Single XP Title Bar */}
              <div className="xp-titlebar" style={{cursor:'grab'}} onMouseDown={mainDrag.onMouseDown}>
                <span style={{fontSize:14}}>🎡</span>
                <span className="xp-titlebar-text">Roleta 1155 Edition</span>
                <div className="xp-titlebar-controls">
                  <button className="xp-btn-wc xp-btn-minmax" onMouseDown={e=>e.stopPropagation()} onClick={toggleMain}>_</button>
                  <button className="xp-btn-wc xp-btn-minmax" onMouseDown={e=>e.stopPropagation()}>□</button>
                  <button className="xp-btn-wc xp-btn-close" onMouseDown={e=>e.stopPropagation()} onClick={toggleMain}>✕</button>
                </div>
              </div>

              {/* Two-panel body */}
              <div style={{display:'flex', flexDirection:'row', alignItems:'stretch', height: 590, overflow:'hidden'}}>

                  {/* LEFT — Config Panel */}
                  <div className="xp-body" style={{width:460, flexShrink:0, display:'flex', flexDirection:'column', gap:12}}>

                    {/* Mode selector */}
                    <div className="xp-groupbox">
                      <span className="xp-groupbox-label">Modo de Sorteio</span>
                      <div className="xp-mode-group">
                        <button onClick={() => setMode('text')} className={cn("xp-mode-btn", mode === 'text' && "xp-mode-btn-active")}>
                          <Type size={13} /> Texto
                        </button>
                        <button onClick={() => setMode('numbers')} className={cn("xp-mode-btn", mode === 'numbers' && "xp-mode-btn-active")}>
                          <Hash size={13} /> Números
                        </button>
                      </div>
                    </div>

                    {mode === 'text' ? (
                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <label style={{fontSize:11,fontFamily:'Tahoma',color:'#000'}}>Opções (uma por linha):</label>
                          <span style={{fontSize:10,fontFamily:'Tahoma',color:'#666'}}>{items.length} itens</span>
                        </div>
                        <textarea
                          className="xp-textarea min-h-[160px]"
                          placeholder="Digite suas opções aqui..."
                          value={textInput}
                          onChange={(e) => setTextInput(e.target.value)}
                        />
                      </div>
                    ) : (
                      <div className="xp-groupbox">
                        <span className="xp-groupbox-label">Intervalo de Números</span>
                        <div className="flex gap-4 pt-2">
                          <div className="flex flex-col gap-1 flex-1">
                            <label style={{fontSize:11,fontFamily:'Tahoma'}}>Início:</label>
                            <input type="number" className="xp-input text-center" value={numRange.min}
                              onChange={(e) => setNumRange({ ...numRange, min: parseInt(e.target.value) || 0 })} />
                          </div>
                          <div className="flex flex-col gap-1 flex-1">
                            <label style={{fontSize:11,fontFamily:'Tahoma'}}>Fim:</label>
                            <input type="number" className="xp-input text-center" value={numRange.max}
                              onChange={(e) => setNumRange({ ...numRange, max: parseInt(e.target.value) || 0 })} />
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="xp-groupbox">
                      <span className="xp-groupbox-label">Opções</span>
                      <div className="space-y-2 pt-1">
                        <label className="flex items-center gap-2" style={{fontSize:11,fontFamily:'Tahoma',cursor:'pointer'}}>
                          <input type="checkbox" className="xp-checkbox" checked={isInstant} onChange={(e) => setIsInstant(e.target.checked)} />
                          Sorteio Instantâneo
                        </label>
                        <label className="flex items-center gap-2" style={{fontSize:11,fontFamily:'Tahoma',cursor:'pointer'}}>
                          <input type="checkbox" className="xp-checkbox" checked={useCustomSeed} onChange={(e) => setUseCustomSeed(e.target.checked)} />
                          Seed Personalizada
                        </label>
                        {useCustomSeed && (
                          <input className="xp-input mt-1" value={customClientSeed}
                            onChange={(e) => setCustomClientSeed(e.target.value)}
                            placeholder="Digite sua seed..." />
                        )}
                      </div>
                    </div>

                    <button
                      onClick={handleSpin}
                      disabled={isSpinning}
                      className="xp-button xp-button-primary w-full justify-center py-3 text-base"
                    >
                      <Play size={18} fill="currentColor" />
                      {isSpinning ? 'Sorteando...' : 'Iniciar Sorteio'}
                    </button>

                    <div className="xp-statusbar" style={{marginTop:'auto'}}>
                      <ShieldCheck size={11} style={{color:'#316ac5'}} />
                      <span>Hash: {nextServerHash.substring(0, 20)}... &nbsp;|&nbsp; Nonce: {nonce}</span>
                      <span style={{marginLeft:'auto',color:'#666'}}>Provably Fair</span>
                    </div>
                  </div>

                  {/* Vertical XP separator */}
                  <div style={{
                    width: 4,
                    background: 'linear-gradient(180deg, #fff 0%, #707070 50%, #fff 100%)',
                    flexShrink: 0,
                    margin: '4px 0',
                  }} />

                  {/* RIGHT — History Panel */}
                  <div style={{width: 380, flexShrink: 0, display:'flex', flexDirection:'column'}}>
                    <div style={{
                      padding: '4px 8px',
                      background: '#ece9d8',
                      borderBottom: '1px solid #d0d0d0',
                      fontFamily: 'Tahoma',
                      fontSize: 11,
                      fontWeight: 'bold',
                      color: '#316ac5',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                    }}>
                      <HistoryIcon size={12} />
                      Histórico de Sorteios
                      <button
                        onClick={() => {
                          setHistory([]);
                          localStorage.removeItem('roulette_history');
                        }}
                        className="xp-button"
                        style={{marginLeft:'auto', fontSize:10, padding:'1px 8px', lineHeight:1.4}}
                        title="Limpar Histórico"
                      >
                        🗑 Limpar
                      </button>
                    </div>
                    <div
                      className="xp-panel custom-scrollbar"
                      style={{
                        margin: 6,
                        flex: 1,
                        height: 520,
                        overflowY: 'auto',
                        overflowX: 'hidden',
                      }}
                    >
                      {history.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full" style={{color:'#999',fontFamily:'Tahoma',fontSize:11}}>
                          <HistoryIcon size={36} style={{opacity:0.1,marginBottom:8}} />
                          Nenhum sorteio ainda
                        </div>
                      ) : (
                        history.map((h) => (
                          <div key={h.id} className="xp-history-item">
                            <div className="flex items-center justify-between">
                              <span style={{fontFamily:'Tahoma',fontSize:13,fontWeight:'bold',color:'#000',wordBreak:'break-word',flex:1,marginRight:6}}>{h.winner}</span>
                              <div className="flex items-center gap-1" style={{flexShrink:0}}>
                                <span style={{fontFamily:'Courier New',fontSize:9,color:'#666'}}>{new Date(h.timestamp).toLocaleTimeString()}</span>
                                <ShieldCheck size={12} style={{color:'#3a8a4a'}} />
                              </div>
                            </div>
                            <div>
                              <span style={{fontSize:9,fontFamily:'Tahoma',color:'#666',textTransform:'uppercase',letterSpacing:'0.05em'}}>Hash</span>
                              <span className="xp-monofont">{h.hash}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* XP Overlay */}
      <AnimatePresence>
        {showOverlay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{background:'rgba(0,0,128,0.18)', backdropFilter:'blur(2px)'}}
          >
            <AnimatePresence mode="wait">
              {/* XP Installer / Progress window */}
              {isSpinning && (
                <motion.div
                  key="installer"
                  initial={{ scale: 0.85, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="xp-dialog"
                  style={{width: 480}}
                >
                  <div className="xp-titlebar">
                    <span style={{fontSize:14}}>💾</span>
                    <span className="xp-titlebar-text">Roleta 1155 Edition — Instalação de Sorteio</span>
                    <div className="xp-titlebar-controls">
                      <button className="xp-btn-wc xp-btn-minmax">_</button>
                      <button className="xp-btn-wc xp-btn-close">✕</button>
                    </div>
                  </div>
                  <div className="xp-body" style={{padding: '20px 24px 24px'}}>
                    {/* Wizard header */}
                    <div style={{display:'flex', alignItems:'center', gap:16, marginBottom:16, paddingBottom:12, borderBottom:'1px solid #d0d0d0'}}>
                      <div style={{fontSize:40}}>🎡</div>
                      <div>
                        <div style={{fontFamily:'Tahoma',fontSize:14,fontWeight:'bold',color:'#000'}}>Processando Sorteio</div>
                        <div style={{fontFamily:'Tahoma',fontSize:11,color:'#444',marginTop:3}}>Aguarde enquanto o vencedor é determinado...</div>
                      </div>
                    </div>

                    <div className="xp-installing-text">Copiando arquivos para o destino:</div>
                    <div className="xp-installing-file">C:\Roleta1155\sorteios\{xpFile}</div>

                    <div style={{marginTop:12}}>
                      <div className="xp-progress-track">
                        <div className="xp-progress-fill" style={{width: `${xpProgress}%`}} />
                      </div>
                      <div style={{display:'flex', justifyContent:'flex-end', fontFamily:'Tahoma', fontSize:10, color:'#555', marginTop:3}}>
                        {xpProgress}%
                      </div>
                    </div>

                    <div style={{marginTop:20, display:'flex', justifyContent:'flex-end', gap:8}}>
                      <button className="xp-button" disabled style={{opacity:0.5}}>
                        &lt; Voltar
                      </button>
                      <button className="xp-button" disabled style={{opacity:0.5}}>
                        Avançar &gt;
                      </button>
                      <button className="xp-button" onClick={closeOverlay}>
                        Cancelar
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* XP Result Dialog */}
              {!isSpinning && winner && (
                <motion.div
                  key="result"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="xp-dialog"
                  style={{width: 520}}
                >
                  <div className="xp-titlebar">
                    <span style={{fontSize:14}}>🏆</span>
                    <span className="xp-titlebar-text">Sorteio Concluído — Roleta 1155 Edition</span>
                    <div className="xp-titlebar-controls">
                      <button className="xp-btn-wc xp-btn-close" onClick={closeOverlay}>✕</button>
                    </div>
                  </div>
                  <div className="xp-body" style={{padding:'20px 24px'}}>
                    {/* Result content */}
                    <div style={{display:'flex', gap:16, alignItems:'flex-start', marginBottom:20}}>
                      <div style={{fontSize:48, flexShrink:0}}>🎉</div>
                      <div style={{flex:1}}>
                        <div style={{fontFamily:'Tahoma',fontSize:13,fontWeight:'bold',color:'#000',marginBottom:4}}>
                          Instalação do Sorteio concluída com êxito!
                        </div>
                        <div style={{fontFamily:'Tahoma',fontSize:11,color:'#333',marginBottom:12}}>
                          O vencedor foi determinado e registrado com sucesso.
                        </div>
                        <div className="xp-panel" style={{padding:'12px 14px'}}>
                          <div style={{fontFamily:'Tahoma',fontSize:10,color:'#555',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:6}}>Vencedor do Sorteio:</div>
                          <div style={{
                            fontFamily:'Tahoma',
                            fontWeight:'bold',
                            color:'#000',
                            wordBreak:'break-word',
                            lineHeight:1.3,
                            fontSize: winner.length > 50 ? 16 : winner.length > 25 ? 22 : winner.length > 12 ? 28 : 38,
                          }}>
                            {winner}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="xp-sep" />

                    <div style={{display:'flex', justifyContent:'flex-end', gap:8, paddingTop:8}}>
                      <button
                        className="xp-button xp-button-primary"
                        onClick={handleSpin}
                        style={{display:'flex',alignItems:'center',gap:6,fontSize:12,padding:'6px 18px'}}
                      >
                        <RotateCcw size={14}/> Novo Sorteio
                      </button>
                      <button
                        className="xp-button"
                        onClick={closeOverlay}
                        style={{fontSize:12,padding:'6px 18px',minWidth:80}}
                        autoFocus
                      >
                        OK
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
      <XPTaskbar windows={taskbarWindows} muteSound={muteSound} onToggleMute={() => setMuteSound(v => !v)} />
    </div>
  );
};

export default MainDashboard;
