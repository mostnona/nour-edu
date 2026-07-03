import { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { NUMBERS_DATA } from '../data';
import { useRemoteNavigation } from '../hooks/useRemoteNavigation';
import AutoPlayProgress from '../components/AutoPlayProgress';

export default function Numbers() {
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showTransition, setShowTransition] = useState(false);
  const [visibleObjects, setVisibleObjects] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const rafRef = useRef<number>(0);

  const current = NUMBERS_DATA[index];

  // Staggered object appearance
  useEffect(() => {
    setVisibleObjects(0);
    const timers: ReturnType<typeof setTimeout>[] = [];
    for (let i = 0; i < current.n; i++) {
      timers.push(
        setTimeout(() => {
          setVisibleObjects((v) => v + 1);
        }, 500 + i * 200)
      );
    }
    return () => timers.forEach(clearTimeout);
  }, [index, current.n]);

  const goNext = useCallback(() => {
    setShowTransition(true);
    setTimeout(() => {
      setIndex((prev) => (prev + 1) % NUMBERS_DATA.length);
      setShowTransition(false);
      setProgress(0);
    }, 300);
  }, []);

  const goPrev = useCallback(() => {
    setShowTransition(true);
    setTimeout(() => {
      setIndex((prev) => (prev - 1 + NUMBERS_DATA.length) % NUMBERS_DATA.length);
      setShowTransition(false);
      setProgress(0);
    }, 300);
  }, []);

  // Auto-play
  useEffect(() => {
    if (isPaused) return;

    const intervalMs = 5000;
    const startTime = Date.now();

    const updateProgress = () => {
      if (isPaused) return;
      const elapsed = Date.now() - startTime;
      setProgress(Math.min(elapsed / intervalMs, 1));
      rafRef.current = requestAnimationFrame(updateProgress);
    };
    rafRef.current = requestAnimationFrame(updateProgress);

    intervalRef.current = setInterval(() => {
      goNext();
    }, intervalMs);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [index, isPaused, goNext]);

  const handleNavigate = useCallback(
    (dir: 'up' | 'down' | 'left' | 'right') => {
      if (dir === 'left') goNext();
      if (dir === 'right') goPrev();
    },
    [goNext, goPrev]
  );

  const handleSelect = useCallback(() => {
    setIsPaused((p) => !p);
  }, []);

  const handleBack = useCallback(() => {
    navigate('/');
  }, [navigate]);

  useRemoteNavigation(handleNavigate, handleSelect, handleBack, true);

  return (
    <div
      className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden"
      style={{ backgroundColor: current.color + '15' }}
    >
      {/* Background glow */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${current.color}20 0%, transparent 70%)`,
        }}
      />

      {/* Back button */}
      <div className="absolute top-6 left-6 z-20" style={{ color: '#5C7A99' }}>
        <span className="font-nunito text-sm">← Back</span>
      </div>

      {/* Pause indicator */}
      {isPaused && (
        <div className="absolute top-6 right-6 z-20 px-4 py-2 rounded-full glass">
          <span className="font-kufi text-sm" style={{ color: '#FFBE3D' }}>⏸ متوقف مؤقتاً</span>
        </div>
      )}

      {/* Main content */}
      <div
        className="relative z-10 flex flex-col items-center text-center transition-all duration-500"
        style={{
          opacity: showTransition ? 0 : 1,
          transform: showTransition ? 'scale(0.8)' : 'scale(1)',
        }}
      >
        {/* Arabic name */}
        <h2
          className="font-kufi text-5xl font-bold mb-2 animate-fade-in-up"
          style={{ color: current.color, textShadow: `0 0 30px ${current.color}44` }}
        >
          {current.ar}
        </h2>

        {/* Large Number */}
        <h1
          className="font-nunito font-bold leading-none animate-bounce-in"
          style={{
            fontSize: '320px',
            color: '#EEF4FF',
            textShadow: `0 0 50px ${current.color}66`,
          }}
        >
          {current.n}
        </h1>

        {/* English name */}
        <p className="font-nunito text-3xl mb-8" style={{ color: '#5C7A99' }}>
          {current.en}
        </p>

        {/* Counting Objects */}
        <div className="flex flex-wrap justify-center gap-3 max-w-[600px]">
          {Array.from({ length: current.n }, (_, i) => (
            <span
              key={i}
              className="text-5xl transition-all"
              style={{
                opacity: i < visibleObjects ? 1 : 0,
                transform: i < visibleObjects ? 'scale(1)' : 'scale(0)',
                transition: `all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)`,
              }}
              role="img"
            >
              {current.emoji}
            </span>
          ))}
        </div>

        {/* Counter */}
        <div className="mt-6 font-nunito text-sm" style={{ color: '#5C7A99' }}>
          {index + 1} / {NUMBERS_DATA.length}
        </div>
      </div>

      {/* Navigation hints */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-between px-12 z-10">
        <span className="font-nunito text-lg" style={{ color: '#5C7A9966' }}>← Previous</span>
        <span className="font-kufi text-sm" style={{ color: '#5C7A9966' }}>OK: Pause/Resume</span>
        <span className="font-nunito text-lg" style={{ color: '#5C7A9966' }}>Next →</span>
      </div>

      <AutoPlayProgress progress={progress} color={current.color} />
    </div>
  );
}
