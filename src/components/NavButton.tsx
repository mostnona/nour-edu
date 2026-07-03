import { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router';

interface NavButtonProps {
  icon: string;
  labelAr: string;
  labelEn: string;
  color: string;
  path: string;
  focused: boolean;
  onFocus: () => void;
  size?: 'normal' | 'large';
}

export default function NavButton({
  icon,
  labelAr,
  labelEn,
  color,
  path,
  focused,
  onFocus,
  size = 'normal',
}: NavButtonProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (focused && ref.current) {
      ref.current.focus();
    }
  }, [focused]);

  const handleClick = () => {
    navigate(path);
  };

  const isLarge = size === 'large';

  return (
    <button
      ref={ref}
      onClick={handleClick}
      onFocus={onFocus}
      onMouseEnter={onFocus}
      tabIndex={0}
      className={`
        relative flex flex-col items-center justify-center gap-2
        transition-all duration-200 cursor-pointer
        ${isLarge ? 'w-full h-[100px]' : 'w-[360px] h-[240px]'}
      `}
      style={{
        background: 'rgba(13, 18, 32, 0.85)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: focused ? `3px solid ${color}` : '1px solid #1E2840',
        borderRadius: '16px',
        boxShadow: focused
          ? `0 0 20px ${color}66, 0 0 60px ${color}22, inset 0 0 20px ${color}11`
          : 'none',
        transform: focused ? 'scale(1.05)' : 'scale(1)',
        outline: focused ? '4px solid #FFBE3D' : 'none',
        outlineOffset: focused ? '4px' : '0',
      }}
    >
      <span className="text-6xl" role="img" aria-label={labelEn}>
        {icon}
      </span>
      <span className="font-kufi text-[22px] font-bold" style={{ color: '#EEF4FF' }}>
        {labelAr}
      </span>
      <span className="font-nunito text-sm" style={{ color: '#5C7A99' }}>
        {labelEn}
      </span>
    </button>
  );
}
