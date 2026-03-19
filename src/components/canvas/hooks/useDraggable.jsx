import { useState, useRef, useCallback } from 'react';

export function useDraggable(initial, canvasRef) {
  const [pos, setPos] = useState(initial);
  const dragging = useRef(false);
  const start = useRef({ mx: 0, my: 0, px: 0, py: 0 });

  const startDrag = useCallback((clientX, clientY) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    dragging.current = true;
    start.current = { mx: clientX, my: clientY, px: pos.x, py: pos.y };
  }, [pos, canvasRef]);

  const onDragMove = useCallback((clientX, clientY) => {
    if (!dragging.current) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const dx = ((clientX - start.current.mx) / rect.width) * 100;
    const dy = ((clientY - start.current.my) / rect.height) * 100;
    setPos({
      x: Math.max(0, Math.min(95, start.current.px + dx)),
      y: Math.max(0, Math.min(95, start.current.py + dy)),
    });
  }, [canvasRef]);

  const bind = useCallback(() => ({
    onMouseDown: (e) => {
      e.stopPropagation(); e.preventDefault();
      startDrag(e.clientX, e.clientY);
      const onMove = (ev) => onDragMove(ev.clientX, ev.clientY);
      const onUp = () => {
        dragging.current = false;
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onUp);
      };
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
    },
    onTouchStart: (e) => {
      e.stopPropagation();
      const t = e.touches[0]; if (!t) return;
      startDrag(t.clientX, t.clientY);
      const onMove = (ev) => { const tt = ev.touches[0]; if (tt) onDragMove(tt.clientX, tt.clientY); };
      const onUp = () => {
        dragging.current = false;
        window.removeEventListener('touchmove', onMove);
        window.removeEventListener('touchend', onUp);
      };
      window.addEventListener('touchmove', onMove);
      window.addEventListener('touchend', onUp);
    },
  }), [startDrag, onDragMove]);

  return [pos, setPos, bind];
}

export function useResizable(initial, canvasRef) {
  const [width, setWidth] = useState(initial);
  const resizing = useRef(false);
  const start = useRef({ x: 0, w: 0 });

  const bindResize = useCallback(() => ({
    onMouseDown: (e) => {
      e.stopPropagation(); e.preventDefault();
      resizing.current = true;
      start.current = { x: e.clientX, w: width };
      const rect = canvasRef.current?.getBoundingClientRect();
      const onMove = (ev) => {
        if (!rect) return;
        const dx = ((ev.clientX - start.current.x) / rect.width) * 100;
        setWidth(Math.max(10, Math.min(95, start.current.w + dx)));
      };
      const onUp = () => {
        resizing.current = false;
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onUp);
      };
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
    },
  }), [width, canvasRef]);

  return [width, setWidth, bindResize];
}