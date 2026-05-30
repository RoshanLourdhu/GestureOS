import React from 'react';
import { useGestureStore } from '../store/gestureStore';

export const VirtualCursor: React.FC = () => {
  const { cursorPos, handDetected, currentGesture } = useGestureStore();

  if (!handDetected) return null;

  // Dynamically map gesture to styling classes and icons
  let cursorClass = 'border-cyan-400 bg-cyan-400/10 shadow-[0_0_15px_rgba(6,182,212,0.6)]';
  let innerDotClass = 'bg-cyan-400';
  let scale = 1.0;
  let customContent = null;

  switch (currentGesture) {
    case 'Left Click':
      cursorClass = 'border-pink-500 bg-pink-500/30 scale-75 shadow-[0_0_20px_rgba(236,72,153,0.8)]';
      innerDotClass = 'bg-pink-500 scale-150';
      scale = 0.8;
      break;
    case 'Right Click':
      cursorClass = 'border-purple-500 bg-purple-500/20 scale-110 shadow-[0_0_20px_rgba(168,85,247,0.8)]';
      innerDotClass = 'bg-purple-500';
      scale = 1.2;
      break;
    case 'Double Click':
      cursorClass = 'border-pink-600 bg-pink-600/20 scale-90 shadow-[0_0_25px_rgba(219,39,119,0.9)] animate-ping';
      innerDotClass = 'bg-pink-600';
      scale = 0.9;
      break;
    case 'Drag':
      cursorClass = 'border-amber-400 bg-amber-400/40 w-12 h-12 shadow-[0_0_20px_rgba(251,191,36,0.8)]';
      innerDotClass = 'bg-amber-400 scale-[2.0] rounded-sm'; // Represents grabbing square
      scale = 1.2;
      break;
    case 'Scroll':
      cursorClass = 'border-emerald-400 bg-emerald-400/20 w-14 h-14 shadow-[0_0_20px_rgba(52,211,153,0.7)]';
      innerDotClass = 'hidden';
      scale = 1.1;
      customContent = (
        <div className="absolute inset-0 flex flex-col items-center justify-between py-1 text-emerald-400 text-xs font-black animate-pulse">
          <span>▲</span>
          <span>▼</span>
        </div>
      );
      break;
    case 'Volume Up':
    case 'Volume Down':
    case 'Brightness Up':
    case 'Brightness Down':
      cursorClass = 'border-indigo-400 bg-indigo-400/30 w-12 h-12 shadow-[0_0_20px_rgba(129,140,248,0.7)]';
      innerDotClass = 'bg-indigo-400 scale-[1.5]';
      scale = 1.15;
      customContent = (
        <div className="absolute inset-0 flex items-center justify-center text-[10px] text-indigo-300 font-bold select-none">
          ↔️
        </div>
      );
      break;
    default:
      // Default pointer (Move / None)
      cursorClass = 'border-cyan-400 bg-cyan-400/10 shadow-[0_0_15px_rgba(6,182,212,0.5)]';
      innerDotClass = 'bg-cyan-400';
      break;
  }

  // Smooth standard virtual cursor tracking container with hardware accelerated translate3d
  return (
    <div
      style={{
        transform: `translate3d(${cursorPos.x - 20}px, ${cursorPos.y - 20}px, 0) scale(${scale})`,
        position: 'fixed',
        top: 0,
        left: 0,
        width: '40px',
        height: '40px',
        pointerEvents: 'none',
        zIndex: 999999, // Ensure it is on top of everything
        transition: 'transform 0.08s cubic-bezier(0.25, 0.46, 0.45, 0.94), width 0.2s ease, height 0.2s ease',
      }}
      className={`rounded-full border-2 flex items-center justify-center pointer-events-none ${cursorClass}`}
    >
      {/* Dynamic graphic children */}
      {customContent ? (
        customContent
      ) : (
        <div className={`w-2.5 h-2.5 rounded-full transition-transform duration-200 ${innerDotClass}`} />
      )}
    </div>
  );
};
export default VirtualCursor;
