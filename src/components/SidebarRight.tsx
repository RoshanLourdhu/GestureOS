import React, { useEffect, useState } from 'react';
import { useGestureStore } from '../store/gestureStore';
import { 
  Cpu, 
  Activity, 
  Trash2, 
  Camera, 
  CheckCircle,
  History
} from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, YAxis } from 'recharts';

export const SidebarRight: React.FC = () => {
  const { diagnostics, currentGesture, handDetected, history, clearHistory, settings } = useGestureStore();
  const [latencyHistory, setLatencyHistory] = useState<{ id: number; val: number }[]>([]);

  // Capture latency telemetry history for the Recharts diagnostics graph
  useEffect(() => {
    if (!handDetected) return;
    setLatencyHistory((prev) => {
      const next = [...prev, { id: Date.now(), val: diagnostics.latency }];
      if (next.length > 15) {
        next.shift();
      }
      return next;
    });
  }, [diagnostics.latency, handDetected]);

  // Handle color of current gesture
  const getGestureColor = () => {
    switch (currentGesture) {
      case 'Left Click': return 'text-pink-500';
      case 'Right Click': return 'text-purple-500';
      case 'Double Click': return 'text-pink-600';
      case 'Drag': return 'text-amber-400';
      case 'Scroll': return 'text-emerald-400';
      case 'Volume Up':
      case 'Volume Down':
      case 'Brightness Up':
      case 'Brightness Down':
        return 'text-indigo-400';
      case 'Move': return 'text-cyan-400';
      default: return 'text-zinc-400';
    }
  };

  return (
    <aside className="w-80 h-full flex flex-col glass-panel border-l border-white/5 relative z-10 select-none overflow-hidden">
      {/* Telemetry Header */}
      <div className="p-5 border-b border-white/5 flex items-center gap-3">
        <Activity className="w-5 h-5 text-cyan-400 animate-pulse" />
        <div>
          <h2 className="font-outfit text-sm font-bold uppercase tracking-wider text-zinc-100">
            System Telemetry
          </h2>
          <span className="text-[10px] text-zinc-500 font-mono">Real-time AI core stats</span>
        </div>
      </div>

      {/* Main Panel Content */}
      <div className="flex-1 p-5 overflow-y-auto flex flex-col gap-6 min-h-0">
        
        {/* Core Live Status Display */}
        <div className="p-4 bg-zinc-950/40 rounded-2xl border border-white/5 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3.5">
            <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Vision Engine</span>
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${handDetected ? 'bg-green-500 animate-ping' : 'bg-zinc-500'}`} />
              <span className={`text-[10px] font-bold ${handDetected ? 'text-green-500' : 'text-zinc-500'}`}>
                {handDetected ? 'TRACKING HAND' : 'NO HANDS DETECTED'}
              </span>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center py-2.5">
            <span className="text-[10px] text-zinc-500 font-mono mb-1">Active Recognition State</span>
            <h3 className={`font-outfit text-2xl font-black tracking-tight ${getGestureColor()} transition-colors duration-300`}>
              {currentGesture}
            </h3>
            <span className="text-[10px] text-zinc-500 mt-1 font-mono">
              Fidelity: {(diagnostics.confidenceScore * 100).toFixed(0)}%
            </span>
          </div>

          {/* Simple horizontal progress bar for tracking confidence */}
          <div className="w-full h-1 bg-zinc-800 rounded-full mt-3 overflow-hidden">
            <div 
              style={{ width: `${handDetected ? diagnostics.confidenceScore * 100 : 0}%` }}
              className="h-full bg-gradient-to-r from-cyan-400 to-purple-500 transition-all duration-300"
            />
          </div>
        </div>

        {/* Real-Time Processing Latency Graph (Recharts Area) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400">
              <Cpu className="w-3.5 h-3.5 text-zinc-400" />
              <span>Core Latency Monitor</span>
            </div>
            <span className="text-[10px] font-mono text-cyan-400 font-bold bg-cyan-950/40 px-1.5 py-0.5 rounded border border-cyan-800/30">
              {handDetected ? `${diagnostics.latency} ms` : '0 ms'}
            </span>
          </div>

          <div className="h-20 bg-zinc-950/40 border border-white/5 rounded-2xl p-2.5 overflow-hidden">
            {handDetected && latencyHistory.length > 1 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={latencyHistory} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
                  <defs>
                    <linearGradient id="latencyGlow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#a855f7" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <YAxis domain={[0, 'dataMax + 20']} hide />
                  <Area
                    type="monotone"
                    dataKey="val"
                    stroke="url(#latencyGlow)"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#latencyGlow)"
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-1.5 text-zinc-600 text-[10px] font-mono">
                <Camera className="w-5 h-5 opacity-40 animate-pulse text-zinc-500" />
                <span>Awaiting live video pipeline input...</span>
              </div>
            )}
          </div>
        </div>

        {/* System Diagnostics Stats Panel */}
        <div className="flex flex-col gap-2.5">
          <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">System State Diagnostics</span>
          
          <div className="grid grid-cols-2 gap-2">
            <div className="p-3 bg-zinc-950/30 border border-white/5 rounded-xl flex flex-col gap-1.5">
              <span className="text-[10px] text-zinc-500 font-medium">Renderer FPS</span>
              <span className="text-base font-bold font-mono text-zinc-200">
                {diagnostics.fps}
              </span>
            </div>
            
            <div className="p-3 bg-zinc-950/30 border border-white/5 rounded-xl flex flex-col gap-1.5">
              <span className="text-[10px] text-zinc-500 font-medium">Tracking FPS</span>
              <span className="text-base font-bold font-mono text-cyan-400">
                {handDetected ? diagnostics.trackingFps : 0}
              </span>
            </div>

            <div className="p-3 bg-zinc-950/30 border border-white/5 rounded-xl flex flex-col gap-1.5">
              <span className="text-[10px] text-zinc-500 font-medium">Hardware Accel.</span>
              <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                WebGL GPU
              </span>
            </div>

            <div className="p-3 bg-zinc-950/30 border border-white/5 rounded-xl flex flex-col gap-1.5">
              <span className="text-[10px] text-zinc-500 font-medium">Filter Kernel</span>
              <span className="text-[10px] font-mono uppercase text-purple-400 font-black">
                {settings.smoothingFilter}
              </span>
            </div>
          </div>
        </div>

        {/* Live Gesture History Log */}
        <div className="flex-1 flex flex-col min-h-[160px]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400">
              <History className="w-3.5 h-3.5" />
              <span>Gesture History Log</span>
            </div>
            {history.length > 0 && (
              <button 
                onClick={clearHistory}
                className="text-[10px] text-zinc-500 hover:text-red-400 flex items-center gap-1 transition-colors bg-white/5 px-2 py-0.5 rounded cursor-pointer"
              >
                <Trash2 className="w-2.5 h-2.5" />
                Clear
              </button>
            )}
          </div>

          <div className="flex-1 bg-zinc-950/40 border border-white/5 rounded-2xl p-3 overflow-y-auto max-h-[220px] flex flex-col gap-2">
            {history.length > 0 ? (
              history.map((log) => (
                <div key={log.id} className="p-2.5 bg-white/2 border border-white/2 rounded-xl flex justify-between items-start text-[10px] group transition-all duration-300">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-bold text-zinc-300 font-sans">{log.gesture}</span>
                    <span className="text-zinc-500 leading-normal">{log.details}</span>
                  </div>
                  <span className="text-[9px] font-mono text-zinc-600 bg-zinc-950/80 px-1 rounded shrink-0">
                    {log.timestamp}
                  </span>
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center gap-1.5 text-zinc-600 text-[10px] py-10 font-mono">
                <span>No actions registered yet.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
};
export default SidebarRight;
