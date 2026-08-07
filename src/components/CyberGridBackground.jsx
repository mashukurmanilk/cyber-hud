import React, { useEffect, useRef } from 'react';

export default function CyberGridBackground({ enabled = true }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!enabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let offset = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const width = canvas.width;
      const height = canvas.height;
      const horizon = height * 0.55;

      // Dark background gradient
      const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
      bgGrad.addColorStop(0, '#04050a');
      bgGrad.addColorStop(0.55, '#0b0c16');
      bgGrad.addColorStop(1, '#06070d');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Sun / Neon horizon glow
      const sunGrad = ctx.createRadialGradient(width / 2, horizon, 10, width / 2, horizon, width * 0.4);
      sunGrad.addColorStop(0, 'rgba(255, 0, 127, 0.25)');
      sunGrad.addColorStop(0.5, 'rgba(0, 240, 255, 0.15)');
      sunGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = sunGrad;
      ctx.fillRect(0, 0, width, height);

      // Perspective Grid Below Horizon
      ctx.save();
      ctx.beginPath();

      // Vertical perspective lines
      const numLines = 36;
      const fov = width * 0.8;
      const centerX = width / 2;

      ctx.strokeStyle = 'rgba(0, 240, 255, 0.18)';
      ctx.lineWidth = 1.2;

      for (let i = -numLines / 2; i <= numLines / 2; i++) {
        const xAtHorizon = centerX + i * 20;
        const xAtBottom = centerX + i * (width / 14);

        ctx.moveTo(xAtHorizon, horizon);
        ctx.lineTo(xAtBottom, height);
      }
      ctx.stroke();

      // Horizontal perspective grid lines (moving forward)
      ctx.beginPath();
      offset = (offset + 0.6) % 30;

      for (let y = horizon; y < height; y += 12) {
        const perspectiveY = horizon + Math.pow((y - horizon) / (height - horizon), 1.6) * (height - horizon);
        const animY = perspectiveY + (offset * ((perspectiveY - horizon) / (height - horizon)));

        if (animY >= horizon && animY <= height) {
          const alpha = ((animY - horizon) / (height - horizon)) * 0.4;
          ctx.strokeStyle = `rgba(255, 0, 127, ${alpha})`;
          ctx.moveTo(0, animY);
          ctx.lineTo(width, animY);
        }
      }
      ctx.stroke();

      // Horizon glowing border line
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.8)';
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 15;
      ctx.lineWidth = 2;
      ctx.moveTo(0, horizon);
      ctx.lineTo(width, horizon);
      ctx.stroke();

      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 opacity-80 transition-opacity duration-500"
    />
  );
}
