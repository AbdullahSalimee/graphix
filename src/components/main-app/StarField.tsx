// components/StarField.tsx
"use client";

import { useEffect, useRef } from "react";

export default function StarField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;

    // Soft floating dust particles — subtle on light bg
    const particles = Array.from({ length: 120 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      radius: Math.random() * 1.6 + 0.3,
      speed: Math.random() * 0.08 + 0.015,
      baseOpacity: Math.random() * 0.18 + 0.04,
      pulseOffset: Math.random() * Math.PI * 2,
      drift: (Math.random() - 0.5) * 0.12, // gentle horizontal drift
    }));

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      particles.forEach((p) => {
        p.x = Math.random() * canvas.width;
        p.y = Math.random() * canvas.height;
      });
    };

    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      // Fade with warm off-white — matches neutral-50 bg
      ctx.fillStyle = "rgba(247, 246, 244, 0.18)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const time = Date.now() / 2000;

      particles.forEach((p) => {
        const pulse =
          Math.sin(time * p.speed * 10 + p.pulseOffset) * 0.35 + 0.65;
        const opacity = p.baseOpacity * pulse;

        // Soft warm-neutral dot
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(100, 94, 88, ${opacity})`;
        ctx.fill();

        // Drift particles slowly upward + sideways
        p.y -= p.speed * 0.4;
        p.x += p.drift;

        // Wrap around
        if (p.y < -4) p.y = canvas.height + 4;
        if (p.x < -4) p.x = canvas.width + 4;
        if (p.x > canvas.width + 4) p.x = -4;
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none bg-gradient-to-br from-neutral-100 via-neutral-50 to-stone-100"
    />
  );
}
