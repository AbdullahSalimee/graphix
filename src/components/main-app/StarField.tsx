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

    // Generate stars once
    const stars = Array.from({ length: 200 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      radius: Math.random() * 1.4 + 0.2,
      speed: Math.random() * 0.12 + 0.02,
      baseOpacity: Math.random() * 0.6 + 0.15,
      pulseOffset: Math.random() * Math.PI * 2,
    }));

    // Handle resize
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      // Optional: redistribute stars on resize (looks nicer)
      stars.forEach((star) => {
        star.x = Math.random() * canvas.width;
        star.y = Math.random() * canvas.height;
      });
    };

    resize();
    window.addEventListener("resize", resize);

    // Animation loop
    const draw = () => {
      ctx.fillStyle = "rgba(3,8,16,0.08)"; // very subtle trail / fade effect
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const time = Date.now() / 2000;

      stars.forEach((star) => {
        const pulse =
          Math.sin(time * star.speed * 10 + star.pulseOffset) * 0.3 + 0.7;
        const opacity = star.baseOpacity * pulse;

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(190, 215, 255, ${opacity})`;
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="
        starfield
        fixed inset-0 z-0 pointer-events-none
        bg-gradient-to-b from-[#0d1f3c] via-[#060d1a] to-[#020508]
      "
    />
  );
}
