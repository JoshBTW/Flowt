import React, { useEffect, useState } from 'react';

export default function CustomCursor() {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [trail, setTrail] = useState({ x: -100, y: -100 });
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only engage on devices with hover capability (non-touch devices)
    const mediaQuery = window.matchMedia('(hover: hover) and (pointer: fine)');
    if (!mediaQuery.matches) return;

    let frameId: number;
    let targetX = -100;
    let targetY = -100;
    let currentX = -100;
    let currentY = -100;

    const onMouseMove = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
      setPosition({ x: targetX, y: targetY });
      if (!isVisible) setIsVisible(true);
    };

    const animateTrail = () => {
      // Linear interpolation for smooth delay effect
      const lerpFactor = 0.15; 
      currentX += (targetX - currentX) * lerpFactor;
      currentY += (targetY - currentY) * lerpFactor;

      setTrail({ x: currentX, y: currentY });
      frameId = requestAnimationFrame(animateTrail);
    };

    const onMouseDown = () => setIsPressed(true);
    const onMouseUp = () => setIsPressed(false);
    
    const onMouseLeave = () => {
      setIsVisible(false);
    };
    
    const onMouseEnter = () => {
      setIsVisible(true);
    };

    // Global listener to check if hovering over interactive elements
    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      
      const isInteractive = target.closest('button, a, input, select, textarea, [role="button"], .cursor-pointer') !== null;
      setIsHovered(isInteractive);
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('mousedown', onMouseDown, { passive: true });
    window.addEventListener('mouseup', onMouseUp, { passive: true });
    window.addEventListener('mouseover', onMouseOver, { passive: true });
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mouseenter', onMouseEnter);

    frameId = requestAnimationFrame(animateTrail);

    // Inject global CSS to disable default cursor in desktop premium mode
    const style = document.createElement('style');
    style.id = 'premium-cursor-mask';
    style.innerHTML = `
      @media (hover: hover) and (pointer: fine) {
        body, button, a, input, select, textarea, [role="button"], .cursor-pointer {
          cursor: none !important;
        }
      }
    `;
    document.head.appendChild(style);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('mouseover', onMouseOver);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mouseenter', onMouseEnter);
      cancelAnimationFrame(frameId);
      
      const injectedStyle = document.getElementById('premium-cursor-mask');
      if (injectedStyle) injectedStyle.remove();
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="hidden md:block" id="flowt-custom-cursor-layer">
      {/* Outer Glow / Reticle */}
      <div
        className="fixed pointer-events-none z-[9999] rounded-full border border-zinc-100 transition-transform duration-100 ease-out -translate-x-1/2 -translate-y-1/2"
        style={{
          left: `${trail.x}px`,
          top: `${trail.y}px`,
          width: isHovered ? '40px' : '24px',
          height: isHovered ? '40px' : '24px',
          transform: `translate(-50%, -50%) scale(${isPressed ? 0.8 : 1})`,
          opacity: isHovered ? 0.9 : 0.4,
          backgroundColor: isHovered ? 'rgba(255, 255, 255, 0.03)' : 'transparent',
        }}
      />
      {/* Inner Pinhead */}
      <div
        className="fixed pointer-events-none z-[9999] rounded-full bg-white -translate-x-1/2 -translate-y-1/2"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: '5px',
          height: '5px',
          transform: `translate(-50%, -50%) scale(${isPressed ? 1.5 : 1})`,
          transition: 'transform 0.05s ease-out',
        }}
      />
    </div>
  );
}
