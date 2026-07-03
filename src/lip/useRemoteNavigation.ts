import { useEffect, useCallback, useRef } from 'react';

export function useRemoteNavigation(
  onNavigate: (direction: 'up' | 'down' | 'left' | 'right') => void,
  onSelect: () => void,
  onBack: () => void,
  enabled: boolean = true
) {
  const lastKeyTime = useRef(0);
  const DEBOUNCE_MS = 150;

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!enabled) return;

      const now = Date.now();
      if (now - lastKeyTime.current < DEBOUNCE_MS) return;

      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          lastKeyTime.current = now;
          onNavigate('up');
          break;
        case 'ArrowDown':
          e.preventDefault();
          lastKeyTime.current = now;
          onNavigate('down');
          break;
        case 'ArrowLeft':
          e.preventDefault();
          lastKeyTime.current = now;
          onNavigate('left');
          break;
        case 'ArrowRight':
          e.preventDefault();
          lastKeyTime.current = now;
          onNavigate('right');
          break;
        case 'Enter':
        case 'OK':
        case 'Accept':
          e.preventDefault();
          lastKeyTime.current = now;
          onSelect();
          break;
        case 'Backspace':
        case 'Back':
        case 'Escape':
          e.preventDefault();
          lastKeyTime.current = now;
          onBack();
          break;
      }
    },
    [enabled, onNavigate, onSelect, onBack]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

export function useAutoPlay(
  onNext: () => void,
  intervalMs: number = 5000,
  enabled: boolean = true
) {
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressRef = useRef<number>(0);
  const rafRef = useRef<number>(0);
  const onProgressRef = useRef<(p: number) => void>(() => {});

  const setOnProgress = useCallback((cb: (p: number) => void) => {
    onProgressRef.current = cb;
  }, []);

  useEffect(() => {
    if (!enabled) {
      if (timerRef.current) clearInterval(timerRef.current);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      return;
    }

    progressRef.current = 0;
    const startTime = Date.now();

    const updateProgress = () => {
      const elapsed = Date.now() - startTime;
      progressRef.current = Math.min(elapsed / intervalMs, 1);
      if (onProgressRef.current) {
        onProgressRef.current(progressRef.current);
      }
      rafRef.current = requestAnimationFrame(updateProgress);
    };

    rafRef.current = requestAnimationFrame(updateProgress);

    timerRef.current = setInterval(() => {
      progressRef.current = 0;
      onNext();
    }, intervalMs);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [enabled, intervalMs, onNext]);

  return { setOnProgress };
}
