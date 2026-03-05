"use client";

import { useEffect, useRef } from "react";

export default function BgStars() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number | undefined;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resize();
    window.addEventListener("resize", resize);

    // Star generation (280 stars)
    const stars = Array.from({ length: 280 }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: Math.random() * 1.3 + 0.1,
      o: Math.random() * 0.45 + 0.04,
      s: Math.random() * 0.006 + 0.001,
      p: Math.random() * Math.PI * 2,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Radial background gradient
      const gradient = ctx.createRadialGradient(
        canvas.width * 0.3,
        canvas.height * 0.2,
        0,
        canvas.width * 0.5,
        canvas.height * 0.5,
        canvas.width * 0.9,
      );
      gradient.addColorStop(0, "#FFFAE3");
      gradient.addColorStop(0.55, "#3F88C5");
      gradient.addColorStop(1, "#000000");

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const time = Date.now() / 1000;

      stars.forEach((star) => {
        const pulse = Math.sin(time * star.s * 9 + star.p) * 0.35 + 0.65;

        ctx.beginPath();
        ctx.arc(
          star.x * canvas.width,
          star.y * canvas.height,
          star.r,
          0,
          Math.PI * 2,
        );
        ctx.fillStyle = `rgba(180,205,255,${star.o * pulse})`;
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationFrameId !== undefined) {
        cancelAnimationFrame(animationFrameId);
      }
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none bg-white" />
  );
}
