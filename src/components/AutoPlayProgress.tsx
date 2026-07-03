import { useEffect, useRef } from 'react';

interface AutoPlayProgressProps {
  progress: number; // 0 to 1
  color?: string;
}

export default function AutoPlayProgress({ progress, color = '#FFBE3D' }: AutoPlayProgressProps) {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (barRef.current) {
      barRef.current.style.width = `${progress * 100}%`;
    }
  }, [progress]);

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '4px',
        backgroundColor: 'rgba(255,255,255,0.1)',
        zIndex: 100,
      }}
    >
      <div
        ref={barRef}
        style={{
          height: '100%',
          background: `linear-gradient(to left, ${color}, ${color}88)`,
          borderRadius: '2px',
          transition: 'width 0.1s linear',
          width: '0%',
        }}
      />
    </div>
  );
}
