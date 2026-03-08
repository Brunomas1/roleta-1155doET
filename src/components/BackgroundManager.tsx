import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Vite feature to import all images from a directory
const imageModules = import.meta.glob('../assets/backgroud/*.{png,jpg,jpeg,webp,svg}', { eager: true });
const localBackgrounds = Object.values(imageModules).map((mod: any) => mod.default || mod);

const BackgroundManager: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [index, setIndex] = useState(0);

  // Fallback if directory is empty or not found
  const backgrounds = useMemo(() => {
    return localBackgrounds.length > 0 
      ? localBackgrounds 
      : ['https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80'];
  }, []);

  useEffect(() => {
    if (backgrounds.length <= 1) return;

    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % backgrounds.length);
    }, 60000); // 60 seconds

    return () => clearInterval(interval);
  }, [backgrounds]);

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black font-sans">
      <AnimatePresence mode="wait">
        <motion.div
          key={backgrounds[index]}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 2, ease: "easeInOut" }}
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${backgrounds[index]})` }}
        >
          {/* Overlay to ensure readability and look premium */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px]" />
        </motion.div>
      </AnimatePresence>
      <div className="relative z-10 min-h-screen w-full">
        {children}
      </div>
    </div>
  );
};

export default BackgroundManager;
