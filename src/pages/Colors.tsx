import { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { COLORS_DATA, SHAPES_DATA } from '../data';
import { useRemoteNavigation } from '../hooks/useRemoteNavigation';
import AutoPlayProgress from '../components/AutoPlayProgress';

export default function Colors() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'colors' | 'shapes'>('colors');
  const [index, setIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showTransition, setShowTransition] = useState(false);
  const [rotation, setRotation] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const rafRef = useRef<number>(0);
  const rotRafRef = useRef<number>(0);

  const colorsList = COLORS_DATA;
  const shapesList = SHAPES_DATA;
  const currentColor = colorsList[index % colorsList.length];
  const currentShape = shapesList[index % shapesList.length];

  // Shape rotation animation
  useEffect(() => {
    if (mode !== 'shapes') return;
    const animate = () => {
      setRotation((r) => (r + 0.3) % 360);
      rotRafRef.current = requestAnimationFrame(animate);
    };
    rotRafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rotRafRef.current) cancelAnimationFrame(rotRafRef.current);
    };
  }, [mode, index]);

  const goNext = useCallback(() => {
    setShowTransition(true);
    setTimeout(() => {
      setIndex((prev) => {
        const next = prev + 1;
        if (mode === 'colors' && next >= colorsList.length) {
          setMode('shapes');
          return 0;
        }
        if (mode === 'shapes' && next >= shapesList.length) {
          setMode('colors');
          return 0;
        }
        return next;
      });
      setShowTransition(false);
      setProgress(0);
    }, 300);
  }, [mode, colorsList.length, shapesList.length]);

  const goPrev = useCallback(() => {
    setShowTransition(true);
    setTimeout(() => {
      setIndex((prev) => {
        const next = prev - 1;
        if (next < 0) {
          if (mode === 'colors') {
            setMode('shapes');
            return shapesList.length - 1;
          }
          setMode('colors');
          return colorsList.length - 1;
        }
        return next;
      });
      setShowTransition(false);
      setProgress(0);
    }, 300);
  }, [mode, colorsList.length, shapesList.length]);

  // Auto-play
  useEffect(() => {
    if (isPaused) return;

    const intervalMs = 4000;
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
  }, [index, mode, isPaused, goNext]);

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

  if (mode === 'colors') {
    return (
      <div
        className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden transition-colors duration-1000"
        style={{ backgroundColor: currentColor.hex }}
      >
        {/* Dark overlay for contrast */}
        <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.3)' }} />

        {/* Back button */}
        <div className="absolute top-6 left-6 z-20">
          <span className="font-nunito text-sm text-white/50">← Back</span>
        </div>

        {/* Pause indicator */}
        {isPaused && (
          <div className="absolute top-6 right-6 z-20 px-4 py-2 rounded-full glass">
            <span className="font-kufi text-sm" style={{ color: '#FFBE3D' }}>⏸ متوقف</span>
          </div>
        )}

        {/* Content */}
        <div
          className="relative z-10 flex flex-col items-center text-center transition-all duration-500"
          style={{
            opacity: showTransition ? 0 : 1,
            transform: showTransition ? 'scale(0.8)' : 'scale(1)',
          }}
        >
          {/* Color swatch */}
          <div
            className="w-[200px] h-[200px] rounded-full mb-8 animate-scale-in"
            style={{
              background: currentColor.hex,
              boxShadow: `0 0 60px ${currentColor.hex}88, 0 0 120px ${currentColor.hex}44`,
              border: '4px solid rgba(255,255,255,0.3)',
            }}
          />

          {/* Arabic name */}
          <h1
            className="font-kufi text-6xl font-bold text-white mb-4 animate-fade-in-up"
            style={{ textShadow: '0 2px 20px rgba(0,0,0,0.5)' }}
          >
            {currentColor.ar}
          </h1>

          {/* English name */}
          <p
            className="font-nunito text-4xl text-white/70 animate-fade-in-up"
            style={{ animationDelay: '200ms' }}
          >
            {currentColor.en}
          </p>

          {/* Counter */}
          <div className="mt-8 font-nunito text-sm text-white/40">
            {index + 1} / {colorsList.length} — Colors
          </div>
        </div>

        <div className="absolute bottom-8 left-0 right-0 flex justify-between px-12 z-10">
          <span className="font-nunito text-lg text-white/30">← Previous</span>
          <span className="font-kufi text-sm text-white/30">OK: Pause</span>
          <span className="font-nunito text-lg text-white/30">Next →</span>
        </div>

        <AutoPlayProgress progress={progress} color="#FFFFFF" />
      </div>
    );
  }

  // Shapes mode
  return (
    <div
      className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden"
      style={{ backgroundColor: '#07090F' }}
    >
      {/* Back button */}
      <div className="absolute top-6 left-6 z-20" style={{ color: '#5C7A99' }}>
        <span className="font-nunito text-sm">← Back</span>
      </div>

      {/* Pause indicator */}
      {isPaused && (
        <div className="absolute top-6 right-6 z-20 px-4 py-2 rounded-full glass">
          <span className="font-kufi text-sm" style={{ color: '#FFBE3D' }}>⏸ متوقف</span>
        </div>
      )}

      {/* Content */}
      <div
        className="relative z-10 flex flex-col items-center text-center transition-all duration-500"
        style={{
          opacity: showTransition ? 0 : 1,
          transform: showTransition ? 'scale(0.8)' : 'scale(1)',
        }}
      >
        {/* Shape SVG */}
        <div className="mb-8 animate-scale-in">
          <svg
            width="300"
            height="300"
            viewBox="0 0 300 300"
            style={{
              filter: `drop-shadow(0 0 20px ${currentShape.glowColor}88)`,
              transform: `rotate(${rotation}deg)`,
              transition: 'transform 0.1s linear',
            }}
            dangerouslySetInnerHTML={{
              __html: currentShape.render(currentShape.glowColor),
            }}
          />
        </div>

        {/* Arabic name */}
        <h1
          className="font-kufi text-5xl font-bold mb-3 animate-fade-in-up"
          style={{ color: currentShape.glowColor, textShadow: `0 0 30px ${currentShape.glowColor}44` }}
        >
          {currentShape.ar}
        </h1>

        {/* English name */}
        <p className="font-nunito text-3xl animate-fade-in-up" style={{ color: '#5C7A99', animationDelay: '200ms' }}>
          {currentShape.en}
        </p>

        {/* Counter */}
        <div className="mt-8 font-nunito text-sm" style={{ color: '#5C7A99' }}>
          {index + 1} / {shapesList.length} — Shapes
        </div>
      </div>

      <div className="absolute bottom-8 left-0 right-0 flex justify-between px-12 z-10">
        <span className="font-nunito text-lg" style={{ color: '#5C7A9966' }}>← Previous</span>
        <span className="font-kufi text-sm" style={{ color: '#5C7A9966' }}>OK: Pause</span>
        <span className="font-nunito text-lg" style={{ color: '#5C7A9966' }}>Next →</span>
      </div>

      <AutoPlayProgress progress={progress} color={currentShape.glowColor} />
    </div>
  );
}
