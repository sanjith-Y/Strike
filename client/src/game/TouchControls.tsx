import React, { useEffect, useRef, useState } from 'react';
import { Crosshair, RotateCcw, ArrowUp, Zap } from 'lucide-react';

interface TouchControlsProps {
  onMove: (forward: number, right: number) => void;
  onLook: (deltaX: number, deltaY: number) => void;
  onFire: (isFiring: boolean) => void;
  onJump: () => void;
  onReload: () => void;
}

export const TouchControls: React.FC<TouchControlsProps> = ({
  onMove,
  onLook,
  onFire,
  onJump,
  onReload,
}) => {
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const joystickBaseRef = useRef<HTMLDivElement>(null);
  const joystickKnobRef = useRef<HTMLDivElement>(null);

  const moveTouchId = useRef<number | null>(null);
  const lookTouchId = useRef<number | null>(null);
  const joystickCenter = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const lastLookPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    setIsTouchDevice(hasTouch);
  }, []);

  if (!isTouchDevice) return null;

  const handleJoystickStart = (e: React.TouchEvent) => {
    const touch = e.changedTouches[0];
    moveTouchId.current = touch.identifier;

    if (joystickBaseRef.current) {
      const rect = joystickBaseRef.current.getBoundingClientRect();
      joystickCenter.current = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      };
    }
  };

  const handleJoystickMove = (e: React.TouchEvent) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === moveTouchId.current) {
        const dx = touch.clientX - joystickCenter.current.x;
        const dy = touch.clientY - joystickCenter.current.y;
        const dist = Math.min(45, Math.hypot(dx, dy));
        const angle = Math.atan2(dy, dx);

        const knobX = Math.cos(angle) * dist;
        const knobY = Math.sin(angle) * dist;

        if (joystickKnobRef.current) {
          joystickKnobRef.current.style.transform = `translate(${knobX}px, ${knobY}px)`;
        }

        // Forward: -Y, Right: +X
        onMove(-Math.sin(angle) * (dist / 45), Math.cos(angle) * (dist / 45));
      }
    }
  };

  const handleJoystickEnd = (e: React.TouchEvent) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === moveTouchId.current) {
        moveTouchId.current = null;
        if (joystickKnobRef.current) {
          joystickKnobRef.current.style.transform = `translate(0px, 0px)`;
        }
        onMove(0, 0);
      }
    }
  };

  const handleLookStart = (e: React.TouchEvent) => {
    const touch = e.changedTouches[0];
    lookTouchId.current = touch.identifier;
    lastLookPos.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleLookMove = (e: React.TouchEvent) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === lookTouchId.current) {
        const dx = touch.clientX - lastLookPos.current.x;
        const dy = touch.clientY - lastLookPos.current.y;
        lastLookPos.current = { x: touch.clientX, y: touch.clientY };
        onLook(dx, dy);
      }
    }
  };

  const handleLookEnd = (e: React.TouchEvent) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === lookTouchId.current) {
        lookTouchId.current = null;
      }
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none select-none z-30">
      {/* Left Movement Virtual Joystick */}
      <div
        className="absolute bottom-8 left-8 w-36 h-36 rounded-full bg-slate-900/60 border-2 border-arena-neon/30 pointer-events-auto flex items-center justify-center backdrop-blur-sm"
        ref={joystickBaseRef}
        onTouchStart={handleJoystickStart}
        onTouchMove={handleJoystickMove}
        onTouchEnd={handleJoystickEnd}
        onTouchCancel={handleJoystickEnd}
      >
        <div
          ref={joystickKnobRef}
          className="w-14 h-14 rounded-full bg-arena-neon/50 border border-arena-neon shadow-neon transition-transform duration-75 pointer-events-none"
        />
      </div>

      {/* Right Aim Drag Surface */}
      <div
        className="absolute top-1/4 right-0 bottom-36 left-1/2 pointer-events-auto opacity-0"
        onTouchStart={handleLookStart}
        onTouchMove={handleLookMove}
        onTouchEnd={handleLookEnd}
        onTouchCancel={handleLookEnd}
      />

      {/* Action Buttons */}
      <div className="absolute bottom-8 right-8 flex flex-col items-end gap-3 pointer-events-auto">
        {/* Fire Button */}
        <button
          onTouchStart={() => onFire(true)}
          onTouchEnd={() => onFire(false)}
          className="w-20 h-20 rounded-full bg-arena-laser/80 border-2 border-arena-laser shadow-laser active:scale-95 flex items-center justify-center text-white font-orbitron"
          aria-label="Fire Weapon"
        >
          <Crosshair className="w-9 h-9" />
        </button>

        <div className="flex gap-3">
          {/* Reload Button */}
          <button
            onTouchStart={onReload}
            className="w-14 h-14 rounded-full bg-slate-800/80 border border-slate-600 active:scale-95 flex items-center justify-center text-white"
            aria-label="Reload"
          >
            <RotateCcw className="w-6 h-6" />
          </button>

          {/* Jump Button */}
          <button
            onTouchStart={onJump}
            className="w-14 h-14 rounded-full bg-arena-accent/80 border border-arena-neon shadow-neon active:scale-95 flex items-center justify-center text-black font-bold"
            aria-label="Jump"
          >
            <ArrowUp className="w-7 h-7" />
          </button>
        </div>
      </div>
    </div>
  );
};
