import { useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  z: number;
  size: number;
  speed: number;
  opacity: number;
  color: string;
}

const StarField = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const createStars = () => {
      const stars: Star[] = [];
      const whiteColor = 'hsl(210, 40%, 98%)'; // white only

      for (let i = 0; i < 200; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          z: Math.random() * 1000,
          size: Math.random() * 2 + 0.5,
          speed: Math.random() * 0.5 + 0.1,
          opacity: Math.random() * 0.8 + 0.2,
          color: whiteColor
        });
      }
      starsRef.current = stars;
    };

    const drawStar = (star: Star) => {
      const x = (star.x - canvas.width / 2) * (1000 / star.z) + canvas.width / 2;
      const y = (star.y - canvas.height / 2) * (1000 / star.z) + canvas.height / 2;
      const size = star.size * (1000 / star.z);

      // Better boundary checking to keep stars within visible area
      if (x < -50 || x > canvas.width + 50 || y < -50 || y > canvas.height + 50 || star.z <= 0) {
        star.x = Math.random() * canvas.width;
        star.y = Math.random() * canvas.height;
        star.z = 1000;
        return; // Skip drawing this frame
      }

      // Only draw if star is within reasonable bounds
      if (x >= 0 && x <= canvas.width && y >= 0 && y <= canvas.height) {
        ctx.save();
        ctx.globalAlpha = star.opacity * (1000 / star.z) * 0.8; // Slightly dimmer
        ctx.fillStyle = star.color;
        
        // Subtle glow effect for white stars
        ctx.shadowColor = star.color;
        ctx.shadowBlur = size * 1.5;
        
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
        
        // Add subtle twinkle effect for larger stars
        if (size > 1.2) {
          ctx.shadowBlur = size * 2.5;
          ctx.globalAlpha = star.opacity * 0.2;
          ctx.beginPath();
          ctx.arc(x, y, size * 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
        
        ctx.restore();
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Keep background transparent for uniform color from CSS

      starsRef.current.forEach(star => {
        star.z -= star.speed;
        if (star.z <= 0) {
          star.x = Math.random() * canvas.width;
          star.y = Math.random() * canvas.height;
          star.z = 1000;
        }
        
        // Add subtle twinkle animation
        star.opacity = 0.2 + Math.sin(Date.now() * 0.001 + star.x * 0.01) * 0.3 + 0.3;
        
        drawStar(star);
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    resizeCanvas();
    createStars();
    animate();

    const handleResize = () => {
      resizeCanvas();
      createStars();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ background: 'transparent' }}
    />
  );
};

export default StarField;