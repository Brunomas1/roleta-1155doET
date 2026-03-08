import { useRef, useEffect, useState, useCallback } from 'react';

interface Position { x: number; y: number; }

export function useDraggable(storageKey: string, defaultPos: Position = { x: 0, y: 0 }) {
  const loadPos = (): Position => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) return JSON.parse(saved);
    } catch {}
    return defaultPos;
  };

  const [pos, setPos] = useState<Position>(loadPos);
  const dragging = useRef(false);
  const startMouse = useRef({ x: 0, y: 0 });
  const startPos = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    // Only drag on titlebar (the element itself, not its children deeply like the close button)
    if ((e.target as HTMLElement).closest('button')) return;
    dragging.current = true;
    startMouse.current = { x: e.clientX, y: e.clientY };
    startPos.current = pos;
    e.preventDefault();
  }, [pos]);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!dragging.current) return;
      const dx = e.clientX - startMouse.current.x;
      const dy = e.clientY - startMouse.current.y;

      const newPos = {
        x: startPos.current.x + dx,
        y: startPos.current.y + dy,
      };
      setPos(newPos);
    };

    const onMouseUp = () => {
      if (!dragging.current) return;
      dragging.current = false;
      // Save final position to localStorage
      setPos(p => {
        localStorage.setItem(storageKey, JSON.stringify(p));
        return p;
      });
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [storageKey]);

  const style: React.CSSProperties = {
    position: 'absolute',
    left: pos.x,
    top: pos.y,
    zIndex: 10,
    cursor: 'default',
    userSelect: 'none',
  };

  return { style, onMouseDown, containerRef };
}
