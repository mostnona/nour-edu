import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  radius: number;
  speed: number;
  sway: number;
  swaySpeed: number;
  opacity: number;
  color: string;
}

const COLORS = ['#FFBE3D', '#3B9EFF', '#00D96F', '#B464FF', '#FF5078', '#00C9C9'];

export default function ParticleBackground({ count = 80 }: { count?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Initialize particles
    particlesRef.current = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: 2 + Math.random() * 2,
      speed: 0.3 + Math.random() * 0.5,
      sway: Math.random() * Math.PI * 2,
      swaySpeed: 0.005 + Math.random() * 0.01,
      opacity: 0.3 + Math.random() * 0.4,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    }));

    let frame = 0;
    const animate = () => {
      frame++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const p of particlesRef.current) {
        p.y -= p.speed;
        p.sway += p.swaySpeed;
        const swayX = Math.sin(p.sway) * 0.5;

        if (p.y < -10) {
          p.y = canvas.height + 10;
          p.x = Math.random() * canvas.width;
        }

        ctx.beginPath();
        ctx.arc(p.x + swayX, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity;
        ctx.fill();
        ctx.globalAlpha = 1;

        // Glow effect
        ctx.beginPath();
        ctx.arc(p.x + swayX, p.y, p.radius * 3, 0, Math.PI * 2);
        const gradient = ctx.createRadialGradient(
          p.x + swayX, p.y, 0,
          p.x + swayX, p.y, p.radius * 3
        );
        gradient.addColorStop(0, p.color);
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.globalAlpha = p.opacity * 0.15;
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(rafRef.current);
    };
  }, [count]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  );
}
