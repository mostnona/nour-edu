import { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { EXERCISES_DATA } from '../data';

import { useRemoteNavigation } from '../hooks/useRemoteNavigation';

type Phase = 'countdown' | 'exercising' | 'rest';

export default function Exercise() {
  const navigate = useNavigate();
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [rep, setRep] = useState(0);
  const [phase, setPhase] = useState<Phase>('countdown');
  const [countdown, setCountdown] = useState(3);
  const [runTime, setRunTime] = useState(0);
  const phaseStartRef = useRef(Date.now());

  const exercise = EXERCISES_DATA[exerciseIndex];

  // Exercise cycle
  useEffect(() => {
    phaseStartRef.current = Date.now();

    if (phase === 'countdown') {
      setCountdown(3);
      const timer = setInterval(() => {
        setCountdown((c) => {
          if (c <= 1) {
            clearInterval(timer);
            setPhase('exercising');
            return 0;
          }
          return c - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }

    if (phase === 'exercising') {
      if (exercise.duration) {
        // Timed exercise (RUN!)
        const timer = setInterval(() => {
          const elapsed = Math.floor((Date.now() - phaseStartRef.current) / 1000);
          setRunTime(elapsed);
          if (elapsed >= exercise.duration!) {
            clearInterval(timer);
            setPhase('rest');
          }
        }, 100);
        return () => clearInterval(timer);
      } else {
        // Rep-based exercise
        const repDuration = 2000; // 2 seconds per rep
        const timer = setInterval(() => {
          const elapsed = Date.now() - phaseStartRef.current;
          const currentRep = Math.min(
            Math.floor(elapsed / repDuration) + 1,
            exercise.reps
          );
          setRep(currentRep);

          if (currentRep >= exercise.reps) {
            clearInterval(timer);
            setTimeout(() => setPhase('rest'), 500);
          }
        }, 100);
        return () => clearInterval(timer);
      }
    }

    if (phase === 'rest') {
      const timer = setTimeout(() => {
        setExerciseIndex((prev) => (prev + 1) % EXERCISES_DATA.length);
        setRep(0);
        setRunTime(0);
        setPhase('countdown');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [phase, exerciseIndex, exercise]);

  const handleNavigate = useCallback(() => {}, []);
  const handleSelect = useCallback(() => {}, []);
  const handleBack = useCallback(() => {
    navigate('/');
  }, [navigate]);

  useRemoteNavigation(handleNavigate, handleSelect, handleBack, true);

  // Animation values based on exercise type and current rep
  const getCharacterPose = (): Record<string, number> => {
    const progress = exercise.duration
      ? runTime / exercise.duration
      : rep / Math.max(exercise.reps, 1);

    switch (exercise.description) {
      case 'jump':
        return {
          bodyY: phase === 'exercising' && rep % 2 === 1 ? -30 : 0,
          armAngle: phase === 'exercising' && rep % 2 === 1 ? -120 : -30,
          legAngle: phase === 'exercising' && rep % 2 === 1 ? 20 : 0,
          bodyRotate: 0, legAngle1: 0, legAngle2: 0, armAngle1: 0, armAngle2: 0,
        };
      case 'bend':
        return {
          bodyRotate: phase === 'exercising' && rep % 2 === 1 ? 45 : 0,
          armAngle: phase === 'exercising' && rep % 2 === 1 ? 60 : -30,
          bodyY: 0, legAngle: 0, legAngle1: 0, legAngle2: 0, armAngle1: 0, armAngle2: 0,
        };
      case 'twist':
        return {
          bodyRotate: phase === 'exercising' ? Math.sin(progress * Math.PI * 6) * 30 : 0,
          bodyY: 0, armAngle: -30, legAngle: 0, legAngle1: 0, legAngle2: 0, armAngle1: 0, armAngle2: 0,
        };
      case 'spread':
        return {
          armAngle: phase === 'exercising' && rep % 2 === 1 ? -90 : -30,
          bodyY: 0, bodyRotate: 0, legAngle: 0, legAngle1: 0, legAngle2: 0, armAngle1: 0, armAngle2: 0,
        };
      case 'run':
        return {
          legAngle1: Math.sin(progress * Math.PI * 12) * 30,
          legAngle2: Math.sin(progress * Math.PI * 12 + Math.PI) * 30,
          armAngle1: Math.sin(progress * Math.PI * 12 + Math.PI) * 40,
          armAngle2: Math.sin(progress * Math.PI * 12) * 40,
          bodyY: 0, bodyRotate: 0, armAngle: -30, legAngle: 0,
        };
      case 'handsup':
        return {
          armAngle: phase === 'exercising' && rep % 2 === 1 ? -150 : -30,
          bodyY: 0, bodyRotate: 0, legAngle: 0, legAngle1: 0, legAngle2: 0, armAngle1: 0, armAngle2: 0,
        };
      case 'squat':
        return {
          bodyY: phase === 'exercising' && rep % 2 === 1 ? 25 : 0,
          legAngle: phase === 'exercising' && rep % 2 === 1 ? -30 : 0,
          bodyRotate: 0, armAngle: -30, legAngle1: 0, legAngle2: 0, armAngle1: 0, armAngle2: 0,
        };
      case 'touchtoes':
        return {
          bodyRotate: phase === 'exercising' && rep % 2 === 1 ? 60 : 0,
          armAngle: phase === 'exercising' && rep % 2 === 1 ? 80 : -30,
          bodyY: 0, legAngle: 0, legAngle1: 0, legAngle2: 0, armAngle1: 0, armAngle2: 0,
        };
      default:
        return { bodyY: 0, bodyRotate: 0, armAngle: -30, legAngle: 0, legAngle1: 0, legAngle2: 0, armAngle1: 0, armAngle2: 0 };
    }
  };

  const pose = getCharacterPose();

  // Character SVG component
  const Character = ({ scale = 1, pose }: { scale?: number; pose: Record<string, number> }) => {
    const s = scale;
    return (
      <svg width={200 * s} height={300 * s} viewBox="0 0 200 300">
        {/* Shadow */}
        <ellipse cx="100" cy="280" rx="50" ry="10" fill="rgba(0,0,0,0.2)" />

        {/* Legs */}
        <g transform={`translate(85, ${200 + (pose.bodyY || 0)})`}>
          <rect
            x="-8"
            y="0"
            width="16"
            height="70"
            rx="8"
            fill="#00D96F"
            transform={`rotate(${pose.legAngle || pose.legAngle1 || 0})`}
            style={{ transformOrigin: '0 0' }}
          />
        </g>
        <g transform={`translate(115, ${200 + (pose.bodyY || 0)})`}>
          <rect
            x="-8"
            y="0"
            width="16"
            height="70"
            rx="8"
            fill="#00D96F"
            transform={`rotate(${-(pose.legAngle || pose.legAngle2 || 0)})`}
            style={{ transformOrigin: '0 0' }}
          />
        </g>

        {/* Shoes */}
        <rect x="65" y="265" width="30" height="12" rx="4" fill="#FF5078" />
        <rect x="105" y="265" width="30" height="12" rx="4" fill="#FF5078" />

        {/* Body */}
        <g
          transform={`translate(100, ${150 + (pose.bodyY || 0)}) rotate(${pose.bodyRotate || 0})`}
          style={{ transformOrigin: '0 50' }}
        >
          {/* Torso */}
          <rect x="-30" y="0" width="60" height="80" rx="16" fill="#3B9EFF" />
          {/* Shirt stripe */}
          <rect x="-30" y="30" width="60" height="12" rx="4" fill="#00C9C9" />

          {/* Arms */}
          <g transform="translate(-30, 10)">
            <rect
              x="-10"
              y="0"
              width="16"
              height="55"
              rx="8"
              fill="#FFD60A"
              transform={`rotate(${pose.armAngle || pose.armAngle1 || -30})`}
              style={{ transformOrigin: '0 0' }}
            />
          </g>
          <g transform="translate(30, 10)">
            <rect
              x="-6"
              y="0"
              width="16"
              height="55"
              rx="8"
              fill="#FFD60A"
              transform={`rotate(${-(pose.armAngle || pose.armAngle2 || -30)})`}
              style={{ transformOrigin: '0 0' }}
            />
          </g>

          {/* Head */}
          <g transform="translate(0, -10)">
            <circle cx="0" cy="0" r="28" fill="#FFD60A" />
            {/* Eyes */}
            <circle cx="-8" cy="-4" r="4" fill="#07090F" />
            <circle cx="8" cy="-4" r="4" fill="#07090F" />
            <circle cx="-6" cy="-6" r="1.5" fill="#EEF4FF" />
            <circle cx="10" cy="-6" r="1.5" fill="#EEF4FF" />
            {/* Smile */}
            <path d="M-10 8 Q0 16 10 8" stroke="#07090F" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            {/* Hair */}
            <path d="M-28 -5 Q-20 -25 0 -28 Q20 -25 28 -5" fill="#8B4513" />
          </g>
        </g>
      </svg>
    );
  };

  return (
    <div
      className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden"
      style={{ background: 'linear-gradient(to bottom, #0D1220, #131829)' }}
    >
      {/* Background grid pattern */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `linear-gradient(rgba(0,201,201,0.3) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(0,201,201,0.3) 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
        }}
      />

      {/* Back button */}
      <div className="absolute top-6 left-6 z-20" style={{ color: '#5C7A99' }}>
        <span className="font-nunito text-sm">← Back</span>
      </div>

      {/* Exercise counter */}
      <div className="absolute top-6 right-6 z-20 px-4 py-2 rounded-full glass">
        <span className="font-nunito text-sm font-bold" style={{ color: '#00D96F' }}>
          {exerciseIndex + 1} / {EXERCISES_DATA.length}
        </span>
      </div>

      {/* Exercise Banner */}
      <div
        className="relative z-10 mb-6 px-10 py-4 rounded-2xl glass text-center"
        style={{
          border: '1px solid #1E2840',
          boxShadow: '0 0 30px rgba(0, 217, 111, 0.15)',
        }}
      >
        <h2 className="font-kufi text-3xl font-bold mb-1" style={{ color: '#00D96F' }}>
          {exercise.ar}
        </h2>
        <p className="font-nunito text-xl" style={{ color: '#5C7A99' }}>
          {exercise.en}
        </p>
      </div>

      {/* Repetition Counter */}
      {phase === 'exercising' && !exercise.duration && (
        <div className="relative z-10 mb-6">
          <span
            className="font-nunito text-6xl font-bold"
            style={{ color: '#FFBE3D', textShadow: '0 0 20px rgba(255,190,61,0.3)' }}
          >
            {rep} / {exercise.reps}
          </span>
        </div>
      )}

      {/* Timer for RUN exercise */}
      {phase === 'exercising' && exercise.duration && (
        <div className="relative z-10 mb-6">
          <span
            className="font-nunito text-6xl font-bold"
            style={{ color: '#FFBE3D', textShadow: '0 0 20px rgba(255,190,61,0.3)' }}
          >
            {runTime}s / {exercise.duration}s
          </span>
        </div>
      )}

      {/* Characters */}
      <div className="relative z-10 flex items-end justify-center gap-8">
        {/* Side character left */}
        <div className="opacity-60" style={{ transform: 'scaleX(-1)' }}>
          <Character scale={0.6} pose={pose} />
        </div>

        {/* Central character */}
        <div>
          <Character scale={1.2} pose={pose} />
        </div>

        {/* Side character right */}
        <div className="opacity-60">
          <Character scale={0.6} pose={pose} />
        </div>
      </div>

      {/* Phase indicator */}
      <div className="relative z-10 mt-8">
        {phase === 'countdown' && (
          <div className="flex flex-col items-center">
            <span className="font-kufi text-lg mb-2" style={{ color: '#5C7A99' }}>استعد...</span>
            <div className="flex gap-4">
              {[3, 2, 1].map((n) => (
                <span
                  key={n}
                  className="font-nunito text-5xl font-bold transition-all"
                  style={{
                    color: countdown === n ? '#FFBE3D' : '#1E2840',
                    transform: countdown === n ? 'scale(1.5)' : 'scale(1)',
                    textShadow: countdown === n ? '0 0 20px rgba(255,190,61,0.5)' : 'none',
                  }}
                >
                  {n}
                </span>
              ))}
            </div>
          </div>
        )}

        {phase === 'exercising' && (
          <div className="px-6 py-2 rounded-full" style={{ background: 'rgba(0,217,111,0.15)' }}>
            <span className="font-kufi text-lg" style={{ color: '#00D96F' }}>
              {exercise.duration ? 'اجري!' : 'كرر التمرين!'}
            </span>
          </div>
        )}

        {phase === 'rest' && (
          <div className="px-6 py-2 rounded-full" style={{ background: 'rgba(255,190,61,0.15)' }}>
            <span className="font-kufi text-lg" style={{ color: '#FFBE3D' }}>
              أحسنت! استراحة قصيرة...
            </span>
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 z-10">
        <div
          className="h-full transition-all"
          style={{
            width: `${((exerciseIndex + (phase === 'exercising' ? (exercise.duration ? runTime / exercise.duration : rep / exercise.reps) : 0)) / EXERCISES_DATA.length) * 100}%`,
            background: 'linear-gradient(to left, #00D96F, #00C9C9)',
          }}
        />
      </div>

      {/* Footer hint */}
      <div className="absolute bottom-6 left-0 right-0 text-center z-10">
        <span className="font-nunito text-sm" style={{ color: '#5C7A9966' }}>
          Back: Return to Menu
        </span>
      </div>
    </div>
  );
}
