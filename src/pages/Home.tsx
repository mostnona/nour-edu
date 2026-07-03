import { useState, useCallback, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router';
import ParticleBackground from '../components/ParticleBackground';
import NavButton from '../components/NavButton';
import { MENU_CARDS } from '../data';
import { useRemoteNavigation } from '../hooks/useRemoteNavigation';

export default function Home() {
  const navigate = useNavigate();
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update clock every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Grid layout: 3 columns × 2 rows + 1 curriculum banner
  const gridCols = 3;
  const totalCards = MENU_CARDS.length;

  const handleNavigate = useCallback(
    (direction: 'up' | 'down' | 'left' | 'right') => {
      setFocusedIndex((prev) => {
        let next = prev;
        const row = Math.floor(prev / gridCols);
        const col = prev % gridCols;

        switch (direction) {
          case 'up':
            if (row > 0) next = prev - gridCols;
            break;
          case 'down':
            if (row < Math.floor((totalCards - 1) / gridCols)) {
              next = Math.min(prev + gridCols, totalCards - 1);
            }
            break;
          case 'left':
            if (col > 0) next = prev - 1;
            break;
          case 'right':
            if (col < gridCols - 1 && prev < totalCards - 1) next = prev + 1;
            break;
        }
        return next;
      });
    },
    [totalCards]
  );

  const handleSelect = useCallback(() => {
    navigate(MENU_CARDS[focusedIndex].path);
  }, [focusedIndex, navigate]);

  const handleBack = useCallback(() => {
    // On home screen, back does nothing
  }, []);

  useRemoteNavigation(handleNavigate, handleSelect, handleBack, true);

  // Card entrance animation
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(t);
  }, []);

  const greeting = useMemo(() => {
    const hour = currentTime.getHours();
    if (hour >= 5 && hour < 12) return { ar: 'صباح الخير', en: 'Good Morning' };
    if (hour >= 12 && hour < 17) return { ar: 'مساء الخير', en: 'Good Afternoon' };
    return { ar: 'مساء الخير', en: 'Good Evening' };
  }, [currentTime]);

  const timeStr = currentTime.toLocaleTimeString('ar-SA', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="relative min-h-screen w-full overflow-hidden" style={{ background: '#07090F' }}>
      <ParticleBackground count={100} />

      {/* Top Bar */}
      <div className="relative z-10 flex items-center justify-between px-12 py-6">
        {/* App Logo */}
        <div className="flex flex-col items-end">
          <h1
            className="font-kufi text-4xl font-bold animate-pulse-glow"
            style={{ color: '#EEF4FF' }}
          >
            نور
          </h1>
          <span className="font-nunito text-sm" style={{ color: '#5C7A99' }}>
            Nour
          </span>
        </div>

        {/* Clock & Greeting */}
        <div className="flex flex-col items-start gap-1">
          <span className="font-nunito text-2xl font-semibold" style={{ color: '#5C7A99' }}>
            {timeStr}
          </span>
          <span className="font-kufi text-base" style={{ color: '#5C7A99' }}>
            {greeting.ar} — {greeting.en}
          </span>
        </div>
      </div>

      {/* Title Area */}
      <div className="relative z-10 text-center mt-4 mb-8">
        <h2
          className="font-kufi text-4xl font-bold mb-2"
          style={{ color: '#EEF4FF' }}
        >
          اختار نشاطك التعليمي
        </h2>
        <p className="font-nunito text-lg" style={{ color: '#5C7A99' }}>
          Choose Your Learning Activity
        </p>
      </div>

      {/* Cards Grid */}
      <div className="relative z-10 flex flex-col items-center gap-6 px-12">
        <div className="grid grid-cols-3 gap-6" style={{ direction: 'rtl' }}>
          {MENU_CARDS.slice(0, 6).map((card, index) => (
            <div
              key={card.id}
              className="transition-all"
              style={{
                opacity: mounted ? 1 : 0,
                transform: mounted ? 'translateY(0)' : 'translateY(30px)',
                transition: `all 0.4s cubic-bezier(0.4, 0, 0.2, 1) ${index * 100}ms`,
              }}
            >
              <NavButton
                icon={card.icon}
                labelAr={card.labelAr}
                labelEn={card.labelEn}
                color={card.color}
                path={card.path}
                focused={focusedIndex === index}
                onFocus={() => setFocusedIndex(index)}
              />
            </div>
          ))}
        </div>

        {/* Curriculum Quick Banner */}
        <div
          className="w-full transition-all"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(30px)',
            transition: `all 0.4s cubic-bezier(0.4, 0, 0.2, 1) 600ms`,
          }}
        >
          <button
            onClick={() => navigate('/curriculum')}
            onFocus={() => setFocusedIndex(6)}
            onMouseEnter={() => setFocusedIndex(6)}
            tabIndex={0}
            className="w-full flex items-center justify-between px-8 py-5 transition-all duration-200 cursor-pointer"
            style={{
              background: 'linear-gradient(to left, #0D1220, #131829)',
              border: focusedIndex === 6 ? '2px solid #00C9C9' : '1px solid #1E2840',
              borderRadius: '16px',
              boxShadow: focusedIndex === 6
                ? '0 0 20px rgba(0,201,201,0.3)'
                : 'none',
              outline: focusedIndex === 6 ? '4px solid #FFBE3D' : 'none',
              outlineOffset: focusedIndex === 6 ? '4px' : '0',
            }}
          >
            <div className="flex items-center gap-4">
              <span className="text-4xl">📚</span>
              <div className="text-right">
                <span className="font-kufi text-xl font-bold block" style={{ color: '#EEF4FF' }}>
                  المنهج الدراسي
                </span>
                <span className="font-nunito text-sm" style={{ color: '#5C7A99' }}>
                  KG1 → KG2 → G1 → G6
                </span>
              </div>
            </div>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#5C7A99" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
        </div>
      </div>

      {/* Footer hint */}
      <div className="relative z-10 text-center mt-8 pb-4">
        <p className="font-nunito text-sm" style={{ color: '#5C7A99' }}>
          Use arrow keys to navigate • Press OK to select
        </p>
      </div>
    </div>
  );
}
