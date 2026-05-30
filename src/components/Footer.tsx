import React from 'react';
import { useGestureStore } from '../store/gestureStore';
import { Compass, Cpu, Target } from 'lucide-react';

export const Footer: React.FC = () => {
  const { cursorPos, rawCursorPos, diagnostics, handDetected } = useGestureStore();

  // Dynamic color for latency speed representation
  const getLatencyColor = (latency: number) => {
    if (!handDetected) return 'text-zinc-500';
    if (latency < 25) return 'text-emerald-400 font-bold';
    if (latency < 50) return 'text-amber-400 font-bold';
    return 'text-red-400 font-bold';
  };

  return (
    <footer className="h-12 w-full glass-panel border-t border-white/5 px-6 flex items-center justify-between relative z-10 text-[11px] select-none text-zinc-400 font-mono">
      {/* Platform Branding */}
      <div className="flex items-center gap-2">
        <Target className="w-3.5 h-3.5 text-cyan-400" />
        <span className="text-zinc-300 font-sans font-semibold">GestureOS Core Dashboard</span>
        <span className="h-3 w-px bg-zinc-800" />
        <span className="text-zinc-500 font-mono">Pipeline: client-side-wasm</span>
      </div>

      {/* Screen Coordinates Telemetry */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <Compass className="w-3.5 h-3.5 text-purple-400" />
          <span>Cursor:</span>
          {handDetected ? (
            <div className="flex gap-2">
              <span className="text-zinc-200">
                X: <strong className="text-cyan-400">{Math.round(cursorPos.x)}</strong>px
              </span>
              <span className="text-zinc-500 font-bold">|</span>
              <span className="text-zinc-200">
                Y: <strong className="text-cyan-400">{Math.round(cursorPos.y)}</strong>px
              </span>
            </div>
          ) : (
            <span className="text-zinc-600 italic">No Hand Lock</span>
          )}
        </div>

        {/* Raw Comparison coordinates showing the filter effectiveness! */}
        {handDetected && (
          <div className="hidden md:flex items-center gap-1.5 opacity-60">
            <span className="text-[10px] text-zinc-500">Raw Tracker:</span>
            <span className="text-[10px] font-mono text-zinc-400">
              ({Math.round(rawCursorPos.x)}, {Math.round(rawCursorPos.y)})
            </span>
          </div>
        )}
      </div>

      {/* Speed & Processing Metrics */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <Cpu className="w-3.5 h-3.5 text-zinc-400" />
          <span>Pipeline Latency:</span>
          <span className={getLatencyColor(diagnostics.latency)}>
            {handDetected ? `${diagnostics.latency} ms` : 'N/A'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span>GPU Render Lock:</span>
          <span className="text-emerald-400 font-bold bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-800/30 text-[10px]">
            ACTIVE
          </span>
        </div>
      </div>
    </footer>
  );
};
export default Footer;
