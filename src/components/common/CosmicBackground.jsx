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

    // High-tech neural / space arena particle nodes
    const nodeCount = Math.floor((width * height) / 14000);
    let nodes = [];

    const colors = ['#00f0ff', '#3b82f6', '#a855f7', '#10b981'];

    const initNodes = () => {
      nodes = [];
      for (let i = 0; i < Math.max(30, nodeCount); i++) {
        nodes.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: Math.random() * 2 + 1,
          vx: (Math.random() - 0.5) * 0.35,
          vy: (Math.random() - 0.5) * 0.35,
          color: colors[Math.floor(Math.random() * colors.length)],
          baseAlpha: Math.random() * 0.45 + 0.25
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

      // Deep space navy background gradient
      const bgGrad = ctx.createLinearGradient(0, 0, width, height);
      bgGrad.addColorStop(0, '#040711');
      bgGrad.addColorStop(0.4, '#070c1e');
      bgGrad.addColorStop(0.75, '#0b132b');
      bgGrad.addColorStop(1, '#050917');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Subtle luminous ambient nebula glows (Electric Cyan & Deep Purple)
      const glow1 = ctx.createRadialGradient(
        width * 0.2 + (mouse.x - width / 2) * 0.02,
        height * 0.25 + (mouse.y - height / 2) * 0.02,
        15,
        width * 0.2,
        height * 0.25,
        width * 0.45
      );
      glow1.addColorStop(0, 'rgba(0, 240, 255, 0.07)');
      glow1.addColorStop(1, 'rgba(4, 7, 17, 0)');
      ctx.fillStyle = glow1;
      ctx.fillRect(0, 0, width, height);

      const glow2 = ctx.createRadialGradient(
        width * 0.82 - (mouse.x - width / 2) * 0.02,
        height * 0.5 - (mouse.y - height / 2) * 0.02,
        25,
        width * 0.82,
        height * 0.5,
        width * 0.5
      );
      glow2.addColorStop(0, 'rgba(168, 85, 247, 0.06)');
      glow2.addColorStop(1, 'rgba(4, 7, 17, 0)');
      ctx.fillStyle = glow2;
      ctx.fillRect(0, 0, width, height);

      // Connecting lines between nearby nodes
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 125) {
            const alpha = (1 - dist / 125) * 0.12;
            ctx.strokeStyle = `rgba(0, 240, 255, ${alpha})`;
            ctx.lineWidth = 0.8;
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
      {/* Subtle Futuristic Tech Dot Matrix Grid */}
      <div 
        className="absolute inset-0 opacity-25 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle, rgba(0, 240, 255, 0.12) 1px, transparent 1px)`,
          backgroundSize: '36px 36px'
        }}
      />
    </div>
  );
}
