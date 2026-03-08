import React, { useState, useEffect, useCallback } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { soundManager } from '../utils/SoundManager';
import confetti from 'canvas-confetti';

interface RouletteWheelProps {
  items: string[];
  spinning: boolean;
  onFinished: (winner: string) => void;
}

const COLORS = [
  '#1e3a8a', '#1e40af', '#1d4ed8', '#2563eb', // Blues
  '#3730a3', '#4338ca', '#4f46e5', '#6366f1', // Indigos
  '#5b21b6', '#6d28d9', '#7c3aed', '#8b5cf6', // Purples/Violets
  '#9d174d', '#be185d', '#db2777', '#ec4899', // Pinks
  '#991b1b', '#b91c1c', '#dc2626', '#ef4444', // Reds
  '#9a3412', '#c2410c', '#ea580c', '#f97316', // Oranges
  '#065f46', '#047857', '#059669', '#10b981', // Emeralds
  '#166534', '#15803d', '#16a34a', '#22c55e', // Greens
  '#115e59', '#0f766e', '#0d9488', '#14b8a6', // Teals
];

const RouletteWheel: React.FC<RouletteWheelProps> = ({ items, spinning, onFinished }) => {
  const controls = useAnimation();
  const [rotation, setRotation] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  
  const [shuffledColors, setShuffledColors] = useState<string[]>([]);
  const effectiveItems = items.length >= 2 ? items : ["?", "?"];
  const count = effectiveItems.length;
  const anglePerItem = 360 / count;

  // Shuffle colors whenever items count changes significantly or on mount
  useEffect(() => {
    const shuffle = (array: string[]) => {
      const newArray = [...array];
      for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
      }
      return newArray;
    };
    
    // Generate a long enough shuffled list to cover all items
    let pool: string[] = [];
    while (pool.length < count) {
      pool = [...pool, ...shuffle(COLORS)];
    }
    setShuffledColors(pool);
  }, [count]);
  
  const startSpin = useCallback(async () => {
    if (count === 0) return;
    setHoveredIndex(null); // Clear hover during spin

    const extraSpins = 10 + Math.random() * 5;
    const finalAngle = extraSpins * 360 + Math.random() * 360;
    const targetRotation = rotation + finalAngle;

    await controls.start({
      rotate: targetRotation,
      transition: {
        duration: 12,
        ease: [0.1, 0, 0.05, 1], 
      },
    });

    const normalizedAngle = (targetRotation % 360);
    const winnerIndex = Math.floor(((360 - normalizedAngle) % 360) / anglePerItem);
    const actualWinnerIndex = (winnerIndex + count) % count;
    
    setRotation(targetRotation);
    onFinished(effectiveItems[actualWinnerIndex]);
    
    confetti({
      particleCount: 200,
      spread: 90,
      origin: { y: 0.5 },
      colors: COLORS
    });
  }, [effectiveItems, rotation, controls, onFinished, anglePerItem, count]);

  useEffect(() => {
    if (spinning) {
      startSpin();
    }
  }, [spinning, startSpin]);

  useEffect(() => {
    if (spinning) {
      const interval = setInterval(() => {
        soundManager.playTick();
      }, 100); 
      
      const timeout = setTimeout(() => {
        clearInterval(interval);
      }, 11500); 

      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }
  }, [spinning]);

  return (
    <div className="relative flex aspect-square w-full max-w-[700px] items-center justify-center p-12">
      {/* Pointer */}
      <div className="absolute top-6 z-50 -translate-y-1/2 drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)] text-7xl select-none pointer-events-none">
        🔻
      </div>

      <motion.div
        animate={controls}
        className="relative h-full w-full rounded-full border-[14px] border-white/20 shadow-[0_0_100px_rgba(0,0,0,0.6)] backdrop-blur-2xl"
        style={{ rotate: rotation }}
      >
        <svg viewBox="0 0 100 100" className="h-full w-full overflow-visible">
          {effectiveItems.map((item, i) => {
            const startAngle = i * anglePerItem - 90;
            const endAngle = (i + 1) * anglePerItem - 90;
            const midAngle = startAngle + anglePerItem / 2;
            const normMid = (midAngle + 360) % 360;
            const shouldFlip = normMid > 90 && normMid < 270;
            
            // Slice Path Logic
            const r = 48; 
            const x1 = 50 + r * Math.cos((startAngle * Math.PI) / 180);
            const y1 = 50 + r * Math.sin((startAngle * Math.PI) / 180);
            const x2 = 50 + r * Math.cos((endAngle * Math.PI) / 180);
            const y2 = 50 + r * Math.sin((endAngle * Math.PI) / 180);
            const largeArcFlag = anglePerItem > 180 ? 1 : 0;
            const pathData = `M 50 50 L ${x1} ${y1} A ${r} ${r} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;

            const isHovered = hoveredIndex === i && !spinning;
            const fontSize = isHovered ? Math.max(2, Math.min(6, 80 / count)) : Math.max(0.8, Math.min(3, 45 / count));

            return (
              <motion.g 
                key={i}
                onMouseEnter={() => !spinning && setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
                animate={isHovered ? { scale: 1.25, transition: { type: "spring", stiffness: 300, damping: 15 } } : { scale: 1 }}
                style={{ transformOrigin: '50px 50px', zIndex: isHovered ? 100 : 1 }}
                className="cursor-pointer"
              >
                {/* Visual shadow for hovered slice */}
                {isHovered && (
                  <path
                    d={pathData}
                    fill="black"
                    fillOpacity="0.4"
                    transform="translate(2, 2)"
                  />
                )}
                
                <path
                  d={pathData}
                  fill={shuffledColors[i] || COLORS[i % COLORS.length]}
                  className={`transition-colors duration-200 ${isHovered ? 'brightness-125 stroke-white stroke-[0.4]' : 'stroke-white/10 stroke-[0.1]'}`}
                />
                
                <g transform={`rotate(${midAngle}, 50, 50)`}>
                  {isHovered ? (
                    <foreignObject
                      x={80 - 15}
                      y={50 - 15}
                      width="30"
                      height="30"
                      transform={shouldFlip ? "rotate(180, 80, 50)" : ""}
                      className="overflow-visible"
                    >
                      <div className="flex h-full w-full items-center justify-center text-center">
                        <span 
                          className="font-black text-white leading-[0.9] select-none break-words"
                          style={{ fontSize: `${Math.max(1, Math.min(4, 60 / (item.length * 0.5 + count * 0.2)))}px` }}
                        >
                          {item}
                        </span>
                      </div>
                    </foreignObject>
                  ) : (
                    <text
                      x="80"
                      y="50"
                      transform={shouldFlip ? "rotate(180, 80, 50)" : ""}
                      fill="white"
                      fontSize={fontSize}
                      fontWeight="900"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="pointer-events-none drop-shadow-md select-none font-sans uppercase tracking-tighter"
                    >
                      {count <= 60 ? (item.length > 8 ? item.substring(0, 6) + '..' : item) : ''}
                    </text>
                  )}
                </g>
              </motion.g>
            );
          })}
        </svg>
        
        {/* Hub */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="h-20 w-20 rounded-full border-[6px] border-white/20 bg-black/40 backdrop-blur-xl shadow-2xl flex items-center justify-center">
            <div className="h-4 w-4 rounded-full bg-white shadow-[0_0_20px_white]" />
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default RouletteWheel;
