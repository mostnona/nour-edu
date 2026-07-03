import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { CURRICULUM_DATA } from '../data';
import { useRemoteNavigation } from '../hooks/useRemoteNavigation';

type Screen = 'grades' | 'subjects' | 'units' | 'lessons';

const GRADE_GRADIENTS: Record<string, string[]> = {
  KG1: ['#6C3483', '#8E44AD'],
  KG2: ['#1A5276', '#2E86C1'],
  G1: ['#1E8449', '#28B463'],
  G2: ['#B7950B', '#F1C40F'],
  G3: ['#A04000', '#E67E22'],
  G4: ['#922B21', '#E74C3C'],
  G5: ['#76448A', '#A569BD'],
  G6: ['#1ABC9C', '#16A085'],
};

export default function Curriculum() {
  const navigate = useNavigate();
  const [screen, setScreen] = useState<Screen>('grades');
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedUnit, setSelectedUnit] = useState(0);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [showVideo, setShowVideo] = useState(false);
  const [videoLesson, setVideoLesson] = useState<{ title: string; yt?: string } | null>(null);

  const grades = Object.entries(CURRICULUM_DATA);

  const handleNavigate = useCallback(
    (dir: 'up' | 'down' | 'left' | 'right') => {
      if (showVideo) return;
      setFocusedIndex((prev) => {
        let next = prev;
        const cols = screen === 'grades' ? 4 : screen === 'subjects' ? 2 : 1;
        const row = Math.floor(prev / cols);
        const col = prev % cols;
        const total = getTotalItems();

        switch (dir) {
          case 'up':
            if (row > 0) next = prev - cols;
            break;
          case 'down':
            if (row < Math.floor((total - 1) / cols)) next = Math.min(prev + cols, total - 1);
            break;
          case 'left':
            if (col > 0) next = prev - 1;
            break;
          case 'right':
            if (col < cols - 1 && prev < total - 1) next = prev + 1;
            break;
        }
        return next;
      });
    },
    [screen, showVideo]
  );

  const getTotalItems = () => {
    switch (screen) {
      case 'grades':
        return grades.length;
      case 'subjects':
        return 2;
      case 'units': {
        const grade = CURRICULUM_DATA[selectedGrade];
        if (!grade) return 0;
        return grade.units[selectedSubject]?.length || 0;
      }
      case 'lessons': {
        const grade = CURRICULUM_DATA[selectedGrade];
        if (!grade) return 0;
        return grade.units[selectedSubject]?.[selectedUnit]?.lessons.length || 0;
      }
    }
  };

  const handleSelect = useCallback(() => {
    if (showVideo) {
      setShowVideo(false);
      setVideoLesson(null);
      return;
    }

    switch (screen) {
      case 'grades': {
        const [key] = grades[focusedIndex];
        setSelectedGrade(key);
        setFocusedIndex(0);
        setScreen('subjects');
        break;
      }
      case 'subjects': {
        setSelectedSubject(focusedIndex === 0 ? 'arabic' : 'english');
        setFocusedIndex(0);
        setScreen('units');
        break;
      }
      case 'units': {
        setSelectedUnit(focusedIndex);
        setFocusedIndex(0);
        setScreen('lessons');
        break;
      }
      case 'lessons': {
        const grade = CURRICULUM_DATA[selectedGrade];
        const lesson = grade?.units[selectedSubject]?.[selectedUnit]?.lessons[focusedIndex];
        if (lesson) {
          setVideoLesson(lesson);
          setShowVideo(true);
        }
        break;
      }
    }
  }, [screen, focusedIndex, grades, selectedGrade, selectedSubject, selectedUnit, showVideo]);

  const handleBack = useCallback(() => {
    if (showVideo) {
      setShowVideo(false);
      setVideoLesson(null);
      return;
    }
    switch (screen) {
      case 'grades':
        navigate('/');
        break;
      case 'subjects':
        setScreen('grades');
        setFocusedIndex(grades.findIndex(([k]) => k === selectedGrade));
        break;
      case 'units':
        setScreen('subjects');
        setFocusedIndex(selectedSubject === 'arabic' ? 0 : 1);
        break;
      case 'lessons':
        setScreen('units');
        setFocusedIndex(selectedUnit);
        break;
    }
  }, [screen, showVideo, navigate, grades, selectedGrade, selectedSubject, selectedUnit]);

  useRemoteNavigation(handleNavigate, handleSelect, handleBack, true);

  // Grade selection screen
  if (screen === 'grades') {
    return (
      <div className="relative min-h-screen w-full overflow-hidden" style={{ background: '#07090F' }}>
        {/* Header */}
        <div className="relative z-10 text-center pt-10 pb-6">
          <h1 className="font-kufi text-4xl font-bold mb-2" style={{ color: '#EEF4FF' }}>
            المنهج الدراسي
          </h1>
          <p className="font-nunito text-lg" style={{ color: '#5C7A99' }}>
            Curriculum — Select Grade
          </p>
        </div>

        {/* Grade Grid */}
        <div className="relative z-10 px-12">
          <div className="grid grid-cols-4 gap-6" style={{ direction: 'rtl' }}>
            {grades.map(([key, grade], idx) => {
              const colors = GRADE_GRADIENTS[key] || ['#333', '#555'];
              const focused = focusedIndex === idx;
              return (
                <button
                  key={key}
                  onClick={() => {
                    setFocusedIndex(idx);
                    setSelectedGrade(key);
                    setFocusedIndex(0);
                    setScreen('subjects');
                  }}
                  onFocus={() => setFocusedIndex(idx)}
                  onMouseEnter={() => setFocusedIndex(idx)}
                  tabIndex={0}
                  className="relative flex flex-col items-center justify-center p-6 rounded-2xl transition-all cursor-pointer h-[200px]"
                  style={{
                    background: `linear-gradient(135deg, ${colors[0]}, ${colors[1]})`,
                    border: focused ? '3px solid #FFBE3D' : '2px solid transparent',
                    boxShadow: focused
                      ? `0 0 20px ${colors[1]}66, 0 0 40px ${colors[1]}22`
                      : `0 4px 20px ${colors[0]}44`,
                    transform: focused ? 'scale(1.05)' : 'scale(1)',
                    outline: focused ? '4px solid #FFBE3D' : 'none',
                    outlineOffset: focused ? '4px' : '0',
                  }}
                >
                  <span className="text-5xl mb-3">{key.startsWith('K') ? '🎈' : '📖'}</span>
                  <span className="font-kufi text-xl font-bold text-white">{grade.name}</span>
                  <span className="font-nunito text-sm text-white/70 mt-1">{grade.age}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Back hint */}
        <div className="absolute bottom-6 left-0 right-0 text-center z-10">
          <span className="font-nunito text-sm" style={{ color: '#5C7A9966' }}>← Back</span>
        </div>
      </div>
    );
  }

  // Subject selection screen
  if (screen === 'subjects') {
    const grade = CURRICULUM_DATA[selectedGrade];
    const subjects = [
      { key: 'arabic', name: 'العربي', icon: '📜', count: grade?.units.arabic?.length || 0 },
      { key: 'english', name: 'English', icon: '🔤', count: grade?.units.english?.length || 0 },
    ];

    return (
      <div className="relative min-h-screen w-full overflow-hidden" style={{ background: '#07090F' }}>
        <div className="relative z-10 text-center pt-10 pb-6">
          <h1 className="font-kufi text-3xl font-bold mb-1" style={{ color: '#EEF4FF' }}>
            {grade?.name}
          </h1>
          <p className="font-nunito text-lg" style={{ color: '#5C7A99' }}>Select Subject</p>
        </div>

        <div className="relative z-10 flex justify-center gap-12 px-12 mt-8">
          {subjects.map((subj, idx) => {
            const focused = focusedIndex === idx;
            return (
              <button
                key={subj.key}
                onClick={() => {
                  setFocusedIndex(idx);
                  setSelectedSubject(subj.key);
                  setFocusedIndex(0);
                  setScreen('units');
                }}
                onFocus={() => setFocusedIndex(idx)}
                onMouseEnter={() => setFocusedIndex(idx)}
                tabIndex={0}
                className="flex flex-col items-center justify-center p-10 rounded-2xl transition-all cursor-pointer"
                style={{
                  width: '400px',
                  height: '300px',
                  background: focused ? '#131829' : '#0D1220',
                  border: focused ? '3px solid #B464FF' : '1px solid #1E2840',
                  boxShadow: focused ? '0 0 30px rgba(180,100,255,0.2)' : 'none',
                  transform: focused ? 'scale(1.05)' : 'scale(1)',
                  outline: focused ? '4px solid #FFBE3D' : 'none',
                  outlineOffset: focused ? '4px' : '0',
                }}
              >
                <span className="text-7xl mb-4">{subj.icon}</span>
                <span className="font-kufi text-3xl font-bold" style={{ color: '#EEF4FF' }}>
                  {subj.name}
                </span>
                <span className="font-nunito text-base mt-2" style={{ color: '#5C7A99' }}>
                  {subj.count} Units
                </span>
              </button>
            );
          })}
        </div>

        <div className="absolute bottom-6 left-0 right-0 text-center z-10">
          <span className="font-nunito text-sm" style={{ color: '#5C7A9966' }}>← Back</span>
        </div>
      </div>
    );
  }

  // Units screen
  if (screen === 'units') {
    const grade = CURRICULUM_DATA[selectedGrade];
    const units = grade?.units[selectedSubject] || [];

    return (
      <div className="relative min-h-screen w-full overflow-hidden" style={{ background: '#07090F' }}>
        <div className="relative z-10 text-center pt-10 pb-6">
          <h1 className="font-kufi text-3xl font-bold mb-1" style={{ color: '#EEF4FF' }}>
            {selectedSubject === 'arabic' ? 'العربي' : 'English'}
          </h1>
          <p className="font-nunito text-lg" style={{ color: '#5C7A99' }}>
            {grade?.name} — Select Unit
          </p>
        </div>

        <div className="relative z-10 flex flex-col items-center gap-4 px-12 mt-4">
          {units.map((unit, idx) => {
            const focused = focusedIndex === idx;
            return (
              <button
                key={idx}
                onClick={() => {
                  setFocusedIndex(idx);
                  setSelectedUnit(idx);
                  setFocusedIndex(0);
                  setScreen('lessons');
                }}
                onFocus={() => setFocusedIndex(idx)}
                onMouseEnter={() => setFocusedIndex(idx)}
                tabIndex={0}
                className="w-full max-w-3xl flex items-center justify-between px-8 py-5 rounded-xl transition-all cursor-pointer text-right"
                style={{
                  background: focused ? '#131829' : '#0D1220',
                  border: focused ? '2px solid #00C9C9' : '1px solid #1E2840',
                  boxShadow: focused ? '0 0 20px rgba(0,201,201,0.15)' : 'none',
                  outline: focused ? '4px solid #FFBE3D' : 'none',
                  outlineOffset: focused ? '4px' : '0',
                }}
              >
                <div className="flex items-center gap-4">
                  <span className="text-3xl">📂</span>
                  <div>
                    <span className="font-kufi text-xl font-bold block" style={{ color: '#EEF4FF' }}>
                      {unit.name}
                    </span>
                    <span className="font-nunito text-sm" style={{ color: '#5C7A99' }}>
                      {unit.lessons.length} Lessons
                    </span>
                  </div>
                </div>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#5C7A99" strokeWidth="2">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
            );
          })}
        </div>

        <div className="absolute bottom-6 left-0 right-0 text-center z-10">
          <span className="font-nunito text-sm" style={{ color: '#5C7A9966' }}>← Back</span>
        </div>
      </div>
    );
  }

  // Lessons screen
  const grade = CURRICULUM_DATA[selectedGrade];
  const unit = grade?.units[selectedSubject]?.[selectedUnit];
  const lessons = unit?.lessons || [];

  return (
    <div className="relative min-h-screen w-full overflow-hidden" style={{ background: '#07090F' }}>
      {/* Header */}
      <div className="relative z-10 text-center pt-10 pb-6">
        <h1 className="font-kufi text-3xl font-bold mb-1" style={{ color: '#EEF4FF' }}>
          {unit?.name}
        </h1>
        <p className="font-nunito text-lg" style={{ color: '#5C7A99' }}>
          {grade?.name} — {selectedSubject === 'arabic' ? 'العربي' : 'English'}
        </p>
      </div>

      {/* Lesson list */}
      <div className="relative z-10 flex flex-col items-center gap-3 px-12 mt-4">
        {lessons.map((lesson, idx) => {
          const focused = focusedIndex === idx;
          return (
            <button
              key={idx}
              onClick={() => {
                setFocusedIndex(idx);
                setVideoLesson(lesson);
                setShowVideo(true);
              }}
              onFocus={() => setFocusedIndex(idx)}
              onMouseEnter={() => setFocusedIndex(idx)}
              tabIndex={0}
              className="w-full max-w-3xl flex items-center justify-between px-8 py-4 rounded-xl transition-all cursor-pointer text-right"
              style={{
                background: focused ? '#131829' : '#0D1220',
                border: focused ? '2px solid #3B9EFF' : '1px solid #1E2840',
                boxShadow: focused ? '0 0 15px rgba(59,158,255,0.15)' : 'none',
                outline: focused ? '4px solid #FFBE3D' : 'none',
                outlineOffset: focused ? '4px' : '0',
              }}
            >
              <div className="flex items-center gap-4">
                <span className="text-2xl">▶️</span>
                <span className="font-kufi text-lg" style={{ color: '#EEF4FF' }}>
                  {lesson.title}
                </span>
              </div>
              <span className="font-nunito text-sm px-3 py-1 rounded-full" style={{ color: '#3B9EFF', background: 'rgba(59,158,255,0.1)' }}>
                Video
              </span>
            </button>
          );
        })}
      </div>

      {/* Video overlay */}
      {showVideo && videoLesson && (
        <div className="absolute inset-0 z-30 flex items-center justify-center" style={{ background: 'rgba(7,9,15,0.95)' }}>
          <div className="flex flex-col items-center">
            <div
              className="rounded-2xl overflow-hidden mb-6"
              style={{
                width: '800px',
                height: '450px',
                background: '#0D1220',
                border: '2px solid #1E2840',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {videoLesson.yt ? (
                <iframe
                  width="800"
                  height="450"
                  src={`https://www.youtube.com/embed/${videoLesson.yt}?autoplay=1`}
                  title={videoLesson.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="flex flex-col items-center">
                  <span className="text-6xl mb-4">🎬</span>
                  <span className="font-kufi text-2xl" style={{ color: '#5C7A99' }}>
                    {videoLesson.title}
                  </span>
                  <span className="font-nunito text-base mt-2" style={{ color: '#5C7A9966' }}>
                    (YouTube video placeholder)
                  </span>
                </div>
              )}
            </div>
            <h3 className="font-kufi text-xl mb-4" style={{ color: '#EEF4FF' }}>
              {videoLesson.title}
            </h3>
            <span className="font-nunito text-sm" style={{ color: '#5C7A99' }}>
              Press OK or Back to close
            </span>
          </div>
        </div>
      )}

      <div className="absolute bottom-6 left-0 right-0 text-center z-10">
        <span className="font-nunito text-sm" style={{ color: '#5C7A9966' }}>← Back</span>
      </div>
    </div>
  );
}
