import React from 'react';
import { useGestureStore } from '../store/gestureStore';
import { 
  MousePointer, 
  Sparkles, 
  Hand, 
  Settings,
  Info
} from 'lucide-react';

interface GestureGuideItem {
  id: string;
  name: string;
  gesture: string;
  action: string;
  icon: string;
  matchingGestures: string[];
}

interface SidebarLeftProps {
  onOpenSettings: () => void;
}

export const SidebarLeft: React.FC<SidebarLeftProps> = ({ onOpenSettings }) => {
  const { currentGesture, settings } = useGestureStore();

  const gestureGuides: GestureGuideItem[] = [
    {
      id: 'move',
      name: 'Cursor Movement',
      gesture: 'Extend Index Finger',
      action: 'Moves the virtual mouse pointer smoothly across screen space',
      icon: '☝️',
      matchingGestures: ['Move']
    },
    {
      id: 'left_click',
      name: 'Left Click',
      gesture: 'Pinch Thumb + Index Tip',
      action: 'Click buttons, toggle switches, or close modal overlays',
      icon: '👌',
      matchingGestures: ['Left Click']
    },
    {
      id: 'right_click',
      name: 'Right Click',
      gesture: 'Pinch Thumb + Middle Tip',
      action: 'Opens customizable glassmorphism context menu at cursor',
      icon: '🖕', // Actually middle pinch representational
      matchingGestures: ['Right Click']
    },
    {
      id: 'double_click',
      name: 'Double Click',
      gesture: 'Pinch Index + Middle Tips',
      action: 'Triggers double clicks (e.g. flips interactive cards in playground)',
      icon: '✌️',
      matchingGestures: ['Double Click']
    },
    {
      id: 'drag',
      name: 'Drag and Drop',
      gesture: 'Make a Closed Fist',
      action: 'Hold closed fist to grab cards; release fist to drop in target zones',
      icon: '✊',
      matchingGestures: ['Drag']
    },
    {
      id: 'scroll',
      name: 'Scroll Pane',
      gesture: 'Pinch Thumb + Pinky / Ring',
      action: 'Pinch thumb and outer fingers, move hand vertically to scroll panel',
      icon: '🤙',
      matchingGestures: ['Scroll']
    },
    {
      id: 'sliders',
      name: 'Slider Control',
      gesture: 'Hover + Stretch Thumb/Index',
      action: 'Hover cursor over Volume/Brightness and vary finger distance',
      icon: '🤏',
      matchingGestures: ['Volume Up', 'Volume Down', 'Brightness Up', 'Brightness Down']
    }
  ];

  return (
    <aside className="w-80 h-full flex flex-col glass-panel border-r border-white/5 relative z-10 select-none overflow-hidden">
      {/* Branding Header */}
      <div className="p-6 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Sparkles className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <h1 className="font-outfit text-xl font-bold tracking-tight text-white dark:text-white">
              Gesture<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">OS</span>
            </h1>
            <span className="text-[10px] text-cyan-400 uppercase tracking-widest font-black font-outfit">HCI Simulator</span>
          </div>
        </div>
        <div className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
          v1.0.0
        </div>
      </div>

      {/* Navigation Options */}
      <div className="px-4 py-3 flex flex-col gap-1.5 border-b border-white/5">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm bg-white/5 text-cyan-400 font-medium cursor-pointer border-l-2 border-cyan-400">
          <MousePointer className="w-4 h-4" />
          <span>Interactive Playground</span>
        </div>
        
        <div 
          onClick={onOpenSettings}
          className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm hover:bg-white/5 text-zinc-400 dark:hover:bg-white/5 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <Settings className="w-4 h-4" />
            <span>Sensitivity Config</span>
          </div>
          <span className="text-[11px] bg-zinc-800 text-zinc-400 px-1.5 py-0.2 rounded font-mono">
            {settings.sensitivity.toFixed(1)}x
          </span>
        </div>
      </div>

      {/* Interactive Gesture Guide */}
      <div className="flex-1 p-5 overflow-y-auto flex flex-col min-h-0">
        <div className="flex items-center gap-2 mb-4 text-xs font-semibold tracking-wider text-zinc-400 uppercase">
          <Hand className="w-3.5 h-3.5" />
          <span>Active Gesture Guide</span>
        </div>

        <div className="flex flex-col gap-2.5">
          {gestureGuides.map((guide) => {
            const isActive = guide.matchingGestures.includes(currentGesture);
            
            return (
              <div
                key={guide.id}
                className={`p-3.5 rounded-xl border text-left transition-all duration-300 relative overflow-hidden group ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-950/40 to-purple-950/40 border-cyan-500/50 shadow-[0_0_12px_rgba(6,182,212,0.15)] scale-[1.01]'
                    : 'bg-zinc-950/30 border-white/5 hover:border-zinc-800 hover:bg-zinc-900/10'
                }`}
              >
                {/* Visual Indicator of Active Recognition */}
                {isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-cyan-400 to-purple-500 animate-pulse" />
                )}

                <div className="flex items-start justify-between gap-2.5">
                  <div className="flex items-start gap-3">
                    <span className={`text-xl p-1.5 rounded-lg bg-zinc-900/50 border border-white/5 transition-all duration-300 ${isActive ? 'scale-110 rotate-3 border-cyan-500/20' : ''}`}>
                      {guide.icon}
                    </span>
                    <div>
                      <h4 className={`text-xs font-semibold transition-colors duration-300 ${isActive ? 'text-cyan-400' : 'text-zinc-200'}`}>
                        {guide.name}
                      </h4>
                      <p className={`text-[10px] font-mono mt-0.5 transition-colors duration-300 ${isActive ? 'text-purple-300' : 'text-zinc-500'}`}>
                        {guide.gesture}
                      </p>
                    </div>
                  </div>
                </div>

                <p className="text-[10px] text-zinc-400 leading-relaxed mt-2 pl-[42px] font-sans group-hover:text-zinc-300 transition-colors">
                  {guide.action}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Info Card */}
      <div className="p-4 bg-zinc-950/50 border-t border-white/5">
        <div className="p-3 bg-cyan-500/5 border border-cyan-500/20 rounded-xl flex gap-3 text-[10px] text-cyan-300 leading-relaxed">
          <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <div>
            <strong className="block text-cyan-200 mb-0.5">Privacy Guaranteed</strong>
            All computer vision processing is computed fully local in your browser. No video is ever sent to any remote servers.
          </div>
        </div>
      </div>
    </aside>
  );
};
export default SidebarLeft;
