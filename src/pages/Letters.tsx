import { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { ARABIC_LETTERS, ENGLISH_LETTERS } from '../data';
import { useRemoteNavigation } from '../hooks/useRemoteNavigation';
import AutoPlayProgress from '../components/AutoPlayProgress';

export default function Letters() {
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<'arabic' | 'english'>('arabic');
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showTransition, setShowTransition] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const rafRef = useRef<number>(0);

  const currentList = phase === 'arabic' ? ARABIC_LETTERS : ENGLISH_LETTERS;
  const current = currentList[index];

  const goNext = useCallback(() => {
    setShowTransition(true);
    setTimeout(() => {
      setIndex((prev) => {
        const next = prev + 1;
        if (phase === 'arabic' && next >= ARABIC_LETTERS.length) {
          setPhase('english');
          return 0;
        }
        if (phase === 'english' && next >= ENGLISH_LETTERS.length) {
          setPhase('arabic');
          return 0;
        }
        return next;
      });
      setShowTransition(false);
      setProgress(0);
    }, 300);
  }, [phase]);

  const goPrev = useCallback(() => {
    setShowTransition(true);
    setTimeout(() => {
      setIndex((prev) => {
        const next = prev - 1;
        if (next < 0) {
          if (phase === 'arabic') {
            setPhase('english');
            return ENGLISH_LETTERS.length - 1;
          }
          setPhase('arabic');
          return ARABIC_LETTERS.length - 1;
        }
        return next;
      });
      setShowTransition(false);
      setProgress(0);
    }, 300);
  }, [phase]);

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
  }, [index, phase, isPaused, goNext]);

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

  const bgColor = phase === 'arabic'
    ? (current as typeof ARABIC_LETTERS[0]).color
    : (current as typeof ENGLISH_LETTERS[0]).color;

  return (
    <div
      className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden transition-colors duration-1000"
      style={{ backgroundColor: bgColor + '18' }}
    >
      {/* Background glow */}
      <div
        className="absolute inset-0 transition-opacity duration-1000"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${bgColor}22 0%, transparent 70%)`,
        }}
      />

      {/* Particle burst canvas */}
      <canvas
        id="letter-particles"
        className="absolute inset-0 pointer-events-none"
        style={{ zIndex: 1 }}
      />

      {/* Back button hint */}
      <div className="absolute top-6 left-6 z-20 flex items-center gap-2" style={{ color: '#5C7A99' }}>
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
        className="relative z-10 flex flex-col items-center justify-center text-center transition-all duration-500"
        style={{
          opacity: showTransition ? 0 : 1,
          transform: showTransition ? 'scale(0.8)' : 'scale(1)',
        }}
      >
        {/* Phase indicator */}
        <div className="mb-4 px-4 py-1 rounded-full" style={{ background: bgColor + '33' }}>
          <span className="font-nunito text-sm font-semibold" style={{ color: bgColor }}>
            {phase === 'arabic' ? 'الحروف العربية' : 'English Letters'}
          </span>
        </div>

        {/* Large Letter */}
        <h1
          className="font-kufi font-bold leading-none mb-6 animate-bounce-in"
          style={{
            fontSize: '280px',
            color: '#EEF4FF',
            textShadow: `0 0 40px ${bgColor}99, 0 0 80px ${bgColor}44`,
          }}
        >
          {phase === 'arabic' ? (current as typeof ARABIC_LETTERS[0]).letter : (current as typeof ENGLISH_LETTERS[0]).letter}
        </h1>

        {/* Letter name (Arabic only) */}
        {phase === 'arabic' && (
          <p
            className="font-kufi text-3xl mb-4 animate-fade-in-up"
            style={{ color: '#EEF4FF', animationDelay: '200ms' }}
          >
            {(current as typeof ARABIC_LETTERS[0]).name}
          </p>
        )}

        {/* Word + Emoji */}
        <div
          className="flex items-center gap-4 mb-3 animate-fade-in-up"
          style={{ animationDelay: '300ms' }}
        >
          <span className="text-7xl" role="img">
            {phase === 'arabic'
              ? (current as typeof ARABIC_LETTERS[0]).emoji
              : (current as typeof ENGLISH_LETTERS[0]).emoji}
          </span>
          <span className="font-kufi text-4xl font-bold" style={{ color: '#EEF4FF' }}>
            {phase === 'arabic'
              ? (current as typeof ARABIC_LETTERS[0]).word
              : (current as typeof ENGLISH_LETTERS[0]).word}
          </span>
        </div>

        {/* English translation */}
        <p
          className="font-nunito text-2xl animate-fade-in-up"
          style={{ color: '#5C7A99', animationDelay: '400ms' }}
        >
          {phase === 'arabic'
            ? (current as typeof ARABIC_LETTERS[0]).english
            : (current as typeof ENGLISH_LETTERS[0]).arabic}
        </p>

        {/* Letter index counter */}
        <div className="mt-8 flex items-center gap-2">
          <span className="font-nunito text-sm" style={{ color: '#5C7A99' }}>
            {index + 1} / {currentList.length}
          </span>
        </div>
      </div>

      {/* Navigation hints */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-between px-12 z-10">
        <span className="font-nunito text-lg" style={{ color: '#5C7A9966' }}>← Previous</span>
        <span className="font-kufi text-sm" style={{ color: '#5C7A9966' }}>
          OK: Pause/Resume
        </span>
        <span className="font-nunito text-lg" style={{ color: '#5C7A9966' }}>Next →</span>
      </div>

      <AutoPlayProgress progress={progress} color={bgColor} />
    </div>
  );
}
