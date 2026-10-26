import React, { useEffect, useRef } from 'react';

export default function CosmicBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    let mouse = { x: width / 2, y: height / 2, targetX: width / 2, targetY: height / 2 };

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initNodes();
    };

    const handleMouseMove = (e) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);

    // High-tech neural / circuit particle nodes
    const nodeCount = Math.floor((width * height) / 12000);
    let nodes = [];

    const initNodes = () => {
      nodes = [];
      for (let i = 0; i < Math.max(35, nodeCount); i++) {
        nodes.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: Math.random() * 2.5 + 1.2,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          color: Math.random() > 0.45 ? '#10b981' : '#0284c7', // Bright Green or Electric Blue
          baseAlpha: Math.random() * 0.5 + 0.3
        });
      }
    };

    initNodes();

    let tick = 0;

    const render = () => {
      tick++;

      // Mouse smoothing
      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      ctx.clearRect(0, 0, width, height);

      // Light background gradient: Crisp clean white-to-light-slate with subtle green-blue tint
      const bgGrad = ctx.createLinearGradient(0, 0, width, height);
      bgGrad.addColorStop(0, '#ffffff');
      bgGrad.addColorStop(0.35, '#f8fafc');
      bgGrad.addColorStop(0.7, '#f1f5f9');
      bgGrad.addColorStop(1, '#ecfdf5'); // very soft light emerald hint
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Subtle luminous ambient glows (Navy & Emerald)
      const glow1 = ctx.createRadialGradient(
        width * 0.15 + (mouse.x - width / 2) * 0.02,
        height * 0.2 + (mouse.y - height / 2) * 0.02,
        10,
        width * 0.15,
        height * 0.2,
        width * 0.4
      );
      glow1.addColorStop(0, 'rgba(16, 185, 129, 0.08)');
      glow1.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = glow1;
      ctx.fillRect(0, 0, width, height);

      const glow2 = ctx.createRadialGradient(
        width * 0.85 - (mouse.x - width / 2) * 0.02,
        height * 0.45 - (mouse.y - height / 2) * 0.02,
        20,
        width * 0.85,
        height * 0.45,
        width * 0.45
      );
      glow2.addColorStop(0, 'rgba(14, 165, 233, 0.07)');
      glow2.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = glow2;
      ctx.fillRect(0, 0, width, height);

      // Connecting lines between nearby nodes
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 130) {
            const alpha = (1 - dist / 130) * 0.15;
            ctx.strokeStyle = `rgba(16, 185, 129, ${alpha})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw and move nodes
      for (let node of nodes) {
        node.x += node.vx;
        node.y += node.vy;

        if (node.x < 0 || node.x > width) node.vx *= -1;
        if (node.y < 0 || node.y > height) node.vy *= -1;

        ctx.fillStyle = node.color;
        ctx.globalAlpha = node.baseAlpha;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      {/* Subtle Futuristic Tech Dot Grid */}
      <div 
        className="absolute inset-0 opacity-40 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle, rgba(11, 19, 43, 0.08) 1px, transparent 1px)`,
          backgroundSize: '32px 32px'
        }}
      />
    </div>
  );
}
