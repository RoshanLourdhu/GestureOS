import React, { useState } from 'react';
import { useGestureStore } from '../store/gestureStore';
import { 
  Plus, 
  ExternalLink,
  Volume2, 
  Sun,
  Layers,
  RefreshCw,
  FolderOpen
} from 'lucide-react';

export const CenterPlayground: React.FC = () => {
  const {
    volumeLevel,
    brightnessLevel,
    scrollPosition,
    currentGesture,
    settings,
    updateSettings
  } = useGestureStore();

  // Local sandbox states
  const [clickCount, setClickCount] = useState(0);
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [systemPower, setSystemPower] = useState(true);
  const [activeDropdown, setActiveDropdown] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState('Cyberpunk Blue');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Simulated log entries for the scroll pane
  const simulatedLogs = [
    'System: GestureOS Core booting up...',
    'CV: MediaPipe WebGL shader pipeline compiled successfully.',
    'Tracking: Looking for hand landmarks in video feed...',
    'Telemetry: Frame rate locked at 60Hz. Jitter filters initialized.',
    'System: Security sandbox activated.',
    'Service: Local WASM hand model v1.0.8 loaded.',
    'Telemetry: Cursor responsiveness delay under 14ms.',
    'Gesture: System ready for Human Computer Interaction (HCI).',
    'Sim: Hover on sliders and pinch thumb-index to change values.',
    'Sim: Make a closed fist to grab cards in the drag field below.',
    'Log: Double pinch index-middle to flip the secure identity card.',
    'Log: Pinch thumb-pinky and raise/lower hand to scroll this box!',
    'Pipeline: Sensor fusion filters synchronized.',
    'CV: Hand index mapped successfully with high-confidence index.',
    'Hardware: WebGL shaders executing at 97% load capacity.',
    'System: Diagnostic logs dump complete. Waiting for user action...'
  ];

  const toggleCardFlip = () => {
    setIsCardFlipped(!isCardFlipped);
  };

  const handleDropdownSelect = (theme: string) => {
    setSelectedTheme(theme);
    setActiveDropdown(false);
  };

  return (
    <main className="flex-1 h-full p-6 bg-grid-pattern overflow-y-auto flex flex-col gap-6 relative select-none">
      
      {/* Welcome Title Banner */}
      <div className="flex items-center justify-between glass-panel p-5 rounded-2xl border-white/5 relative overflow-hidden">
        {/* Glow behind title */}
        <div className="absolute -left-12 -top-12 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div>
          <h2 className="font-outfit text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>OS Playground Simulator</span>
            <span className="text-xs bg-cyan-500/10 text-cyan-400 font-bold px-2 py-0.5 rounded border border-cyan-800/30 font-mono">
              Sandbox Active
            </span>
          </h2>
          <p className="text-xs text-zinc-400 mt-1 max-w-xl">
            Test and trigger OS functions completely through camera hand tracking. Hover over nodes, click buttons, drag items, scroll windows, or adjust sliders in real-time.
          </p>
        </div>

        {/* Global Dark Mode Switch */}
        <button
          onClick={() => updateSettings({ darkMode: !settings.darkMode })}
          className="p-2.5 rounded-xl border border-white/5 hover:border-zinc-800 bg-zinc-950/20 text-zinc-400 hover:text-cyan-400 transition-all cursor-pointer"
          title="Toggle system theme"
        >
          {settings.darkMode ? '☀️ Switch to Light' : '🌙 Switch to Dark'}
        </button>
      </div>

      {/* Interactive Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 flex-1">
        
        {/* LEFT COLUMN: Buttons, Sliders, Toggle, Card */}
        <div className="flex flex-col gap-6">
          
          {/* Card 1: Buttons and Switches Node */}
          <div className="glass-panel p-5 rounded-2xl border-white/5 flex flex-col gap-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
              <Layers className="w-3.5 h-3.5" />
              <span>Interactive Controls</span>
            </h3>

            {/* Click Counter Button and Power Toggle */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Tap Click Button */}
              <div className="p-4 bg-zinc-950/30 border border-white/5 rounded-xl flex flex-col gap-3">
                <span className="text-[10px] text-zinc-500 font-bold uppercase">Left-Click Node</span>
                <button
                  onClick={() => setClickCount(c => c + 1)}
                  className="w-full py-2.5 px-4 rounded-lg bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-white font-semibold text-xs transition-all shadow-md shadow-cyan-500/10 active:scale-95 cursor-pointer"
                >
                  Trigger Click ({clickCount})
                </button>
              </div>

              {/* Toggle Switch */}
              <div className="p-4 bg-zinc-950/30 border border-white/5 rounded-xl flex flex-col justify-between">
                <div className="flex items-center justify-between text-[10px] text-zinc-500 font-bold uppercase">
                  <span>System Power</span>
                  <span className={`font-mono ${systemPower ? 'text-green-400' : 'text-red-400'}`}>
                    {systemPower ? 'ON' : 'OFF'}
                  </span>
                </div>
                
                <div className="flex items-center gap-3 mt-3">
                  <button
                    onClick={() => setSystemPower(!systemPower)}
                    style={{ justifySelf: 'start' }}
                    className={`w-12 h-6 rounded-full relative p-0.5 transition-colors cursor-pointer ${
                      systemPower ? 'bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.4)]' : 'bg-zinc-800'
                    }`}
                  >
                    <div 
                      className={`w-5 h-5 rounded-full bg-white transition-transform ${
                        systemPower ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                  <span className="text-xs text-zinc-400 font-medium">Switch Toggle</span>
                </div>
              </div>
            </div>

            {/* Dropdown Menu Node and Modal Popup Node */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Dropdown */}
              <div className="p-4 bg-zinc-950/30 border border-white/5 rounded-xl flex flex-col gap-2 relative">
                <span className="text-[10px] text-zinc-500 font-bold uppercase">System Environment</span>
                <button
                  onClick={() => setActiveDropdown(!activeDropdown)}
                  className="w-full py-2 px-3 rounded-lg border border-white/5 bg-zinc-900/40 text-left text-xs font-semibold text-zinc-300 flex items-center justify-between cursor-pointer"
                >
                  <span>{selectedTheme}</span>
                  <Plus className={`w-3.5 h-3.5 text-zinc-500 transition-transform ${activeDropdown ? 'rotate-45' : ''}`} />
                </button>

                {/* Glass Dropdown Overlay */}
                {activeDropdown && (
                  <div className="absolute left-4 right-4 top-[68px] glass-panel border border-cyan-500/20 p-1.5 rounded-xl z-50 flex flex-col gap-1 shadow-2xl">
                    {['Cyberpunk Blue', 'Neon Purple', 'Matrix Green', 'Synthwave Pink'].map((theme) => (
                      <button
                        key={theme}
                        onClick={() => handleDropdownSelect(theme)}
                        className={`w-full py-1.5 px-3 rounded-lg text-left text-xs font-semibold transition-colors cursor-pointer ${
                          selectedTheme === theme 
                            ? 'bg-cyan-500/10 text-cyan-400' 
                            : 'hover:bg-white/5 text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        {theme}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Open Modal Button */}
              <div className="p-4 bg-zinc-950/30 border border-white/5 rounded-xl flex flex-col gap-3 justify-between">
                <span className="text-[10px] text-zinc-500 font-bold uppercase">Modal Overlays</span>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="w-full py-2 px-4 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-200 hover:text-white font-semibold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>Launch Secure Modal</span>
                  <ExternalLink className="w-3 h-3 text-zinc-400" />
                </button>
              </div>
            </div>
          </div>

          {/* Card 2: Interactive Double Click Flip Card */}
          <div className="glass-panel p-5 rounded-2xl border-white/5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Double-Click Target Node
              </h3>
              <span className="text-[9px] font-mono text-zinc-500">✌️ Double Pinch index-middle</span>
            </div>

            {/* Flipped card wrapper */}
            <div 
              onDoubleClick={toggleCardFlip}
              className="h-28 w-full cursor-pointer relative perspective-1000 select-none group"
            >
              <div 
                style={{ transformStyle: 'preserve-3d' }}
                className={`w-full h-full duration-700 transition-transform absolute ${
                  isCardFlipped ? 'rotate-y-180' : ''
                }`}
              >
                {/* Front Side */}
                <div 
                  style={{ backfaceVisibility: 'hidden' }}
                  className="absolute inset-0 bg-gradient-to-tr from-cyan-950/30 to-purple-950/30 border border-white/5 rounded-xl p-4 flex items-center justify-between"
                >
                  <div>
                    <h4 className="font-outfit font-bold text-sm text-zinc-200">Secure Access Card</h4>
                    <span className="text-[10px] text-zinc-500 font-mono mt-1 block">UID: ACC-93102-SYS</span>
                  </div>
                  <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-lg text-xs font-bold group-hover:scale-105 transition-transform">
                    DOUBLE CLICK TO UNLOCK
                  </div>
                </div>

                {/* Back Side */}
                <div 
                  style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                  className="absolute inset-0 bg-gradient-to-tr from-purple-950/30 to-pink-950/30 border border-purple-500/30 rounded-xl p-4 flex items-center justify-between"
                >
                  <div>
                    <h4 className="font-outfit font-bold text-sm text-purple-300">Identity Decrypted!</h4>
                    <span className="text-[10px] text-zinc-400 font-mono mt-1 block">Security Clearance: LEVEL A</span>
                  </div>
                  <div className="px-3 py-1.5 bg-purple-500/20 border border-purple-500/40 text-purple-400 rounded-lg text-[10px] font-mono font-bold animate-pulse">
                    🔓 ACCESS GRANTED
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Volume and Brightness Sliders */}
          <div className="glass-panel p-5 rounded-2xl border-white/5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Pinch Distance Sliders (Hover Trigger)
              </h3>
              <span className="text-[9px] font-mono text-zinc-500">🤏 Hover, then vary Thumb-Index distance</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Volume Slider Container */}
              <div 
                id="volume-slider-container"
                className={`p-4 bg-zinc-950/40 border rounded-2xl flex flex-col gap-3 transition-all duration-300 ${
                  currentGesture === 'Volume Up' ? 'border-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.15)] bg-indigo-950/10' : 'border-white/5'
                }`}
              >
                <div className="flex items-center justify-between text-xs text-zinc-300">
                  <div className="flex items-center gap-1.5">
                    <Volume2 className="w-4 h-4 text-indigo-400" />
                    <span className="font-semibold">Volume Control</span>
                  </div>
                  <span className="font-bold font-mono text-indigo-400">{volumeLevel}%</span>
                </div>

                <div className="w-full h-2 bg-zinc-900 rounded-full overflow-hidden relative">
                  <div 
                    style={{ width: `${volumeLevel}%` }}
                    className="h-full bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full transition-all duration-100"
                  />
                </div>
                <span className="text-[9px] text-zinc-500 leading-none">Hover here to modify level</span>
              </div>

              {/* Brightness Slider Container */}
              <div 
                id="brightness-slider-container"
                className={`p-4 bg-zinc-950/40 border rounded-2xl flex flex-col gap-3 transition-all duration-300 ${
                  currentGesture === 'Volume Up' ? 'border-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.15)] bg-indigo-950/10' : 'border-white/5'
                }`}
              >
                <div className="flex items-center justify-between text-xs text-zinc-300">
                  <div className="flex items-center gap-1.5">
                    <Sun className="w-4 h-4 text-amber-400" />
                    <span className="font-semibold">Display Brightness</span>
                  </div>
                  <span className="font-bold font-mono text-amber-400">{brightnessLevel}%</span>
                </div>

                <div className="w-full h-2 bg-zinc-900 rounded-full overflow-hidden relative">
                  <div 
                    style={{ width: `${brightnessLevel}%` }}
                    className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-100"
                  />
                </div>
                <span className="text-[9px] text-zinc-500 leading-none">Hover here to modify level</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Scroll Panel, Drag & Drop Field */}
        <div className="flex flex-col gap-6">
          
          {/* Scrollable Logging Console Panel */}
          <div className="glass-panel p-5 rounded-2xl border-white/5 flex flex-col gap-3 flex-1 min-h-[220px]">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Simulated System Console Output</span>
              </h3>
              <span className="text-[9px] font-mono text-zinc-500">🤙 Scroll Pinch + Vertical Hand move</span>
            </div>

            <div 
              id="playground-scroll-pane"
              className="flex-1 bg-black/60 border border-zinc-900 rounded-xl p-4 font-mono text-[10px] text-cyan-500/90 leading-relaxed overflow-y-auto max-h-[260px] scroll-smooth"
            >
              <div className="flex flex-col gap-2">
                {simulatedLogs.map((log, index) => (
                  <div key={index} className="flex gap-2 hover:bg-zinc-900/30 py-0.5 rounded transition-all">
                    <span className="text-zinc-600 select-none">[{index.toString().padStart(2, '0')}]</span>
                    <span>{log}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between text-[9px] text-zinc-500 font-mono mt-1">
              <span>Scroll bar position: {Math.round(scrollPosition)} px</span>
              <span>Encoding: UTF-8 standard</span>
            </div>
          </div>

          {/* Drag & Drop Field */}
          <div className="glass-panel p-5 rounded-2xl border-white/5 flex flex-col gap-3 min-h-[300px]">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                <FolderOpen className="w-3.5 h-3.5" />
                <span>Interactive Drag & Drop Field</span>
              </h3>
              <span className="text-[9px] font-mono text-zinc-500">✊ Fist to Grab | Release to Drop</span>
            </div>

            <div 
              id="drag-playground"
              className="flex-1 bg-zinc-950/40 border border-white/5 rounded-2xl p-4 flex flex-col md:flex-row gap-4 relative overflow-hidden min-h-[200px]"
            >
              {/* Bounding background grid lines */}
              <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />

              {/* Drop Zone Alpha */}
              <div 
                id="drop-zone-a"
                className="flex-1 border border-dashed border-zinc-800 rounded-xl p-4 flex flex-col items-center justify-center min-h-[140px] transition-all bg-zinc-950/20"
              >
                <span className="text-[10px] text-zinc-500 font-black uppercase mb-3">Zone Alpha</span>
                
                {/* Seed of Draggable Card */}
                <div 
                  id="draggable-element"
                  className="draggable-item w-full max-w-[150px] p-3 rounded-lg border border-white/5 bg-zinc-900/80 hover:border-cyan-500/40 text-left font-sans shadow-lg select-none cursor-grab active:cursor-grabbing gesture-card z-10"
                >
                  <div className="w-2.5 h-2.5 bg-cyan-400 rounded-full mb-2 animate-pulse" />
                  <h4 className="text-[11px] font-bold text-zinc-200">OS System Package</h4>
                  <span className="text-[9px] text-zinc-500 font-mono">pkg_db.config</span>
                </div>
              </div>

              {/* Drop Zone Beta */}
              <div 
                id="drop-zone-b"
                className="flex-1 border border-dashed border-zinc-800 rounded-xl p-4 flex flex-col items-center justify-center min-h-[140px] transition-all bg-zinc-950/20"
              >
                <span className="text-[10px] text-zinc-500 font-black uppercase">Zone Beta</span>
                <span className="text-[10px] text-zinc-600 mt-2 text-center max-w-[120px] leading-relaxed">
                  Drop packages here to transfer system states.
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Floating Modal Overlay in the center stage */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[99999] flex items-center justify-center p-4">
          <div 
            style={{ width: '420px' }}
            className="glass-panel p-6 rounded-2xl border-white/10 flex flex-col gap-4 text-center relative shadow-[0_0_50px_rgba(0,0,0,0.8)] animate-in zoom-in-95 duration-200"
          >
            <div className="w-12 h-12 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mx-auto text-xl animate-bounce">
              🔒
            </div>

            <div>
              <h3 className="font-outfit font-bold text-base text-zinc-100">Simulated Access Key Verification</h3>
              <p className="text-xs text-zinc-400 leading-relaxed mt-2">
                This secure modal represents high-priority window focuses inside GestureOS. Left-click the button below to close the window overlay.
              </p>
            </div>

            <div className="flex flex-col gap-2 mt-2">
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-full py-2 px-4 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs transition-all cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.4)]"
              >
                Dismiss Modal Window
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Real-time floating Context Menu on Right Click */}
      <ContextMenu />
    </main>
  );
};

/**
 * Custom glassmorphism Context Menu component triggered on Middle-Finger pinch right click.
 */
const ContextMenu: React.FC = () => {
  const { contextMenuOpen, contextMenuPos, setContextMenuOpen, addHistoryEntry } = useGestureStore();
  
  if (!contextMenuOpen) return null;

  const handleAction = (label: string) => {
    addHistoryEntry('None', `Context Menu selection: ${label}`);
    setContextMenuOpen(false);
  };

  return (
    <>
      {/* Background click intercept overlay */}
      <div 
        onClick={() => setContextMenuOpen(false)}
        className="fixed inset-0 z-[9999] bg-transparent"
      />
      <div
        style={{
          position: 'fixed',
          left: `${contextMenuPos.x}px`,
          top: `${contextMenuPos.y}px`,
          width: '160px'
        }}
        className="glass-panel border border-purple-500/20 p-1 rounded-xl z-[99999] shadow-2xl flex flex-col gap-0.5"
      >
        <div className="px-2.5 py-1 text-[9px] font-bold text-zinc-500 uppercase tracking-widest border-b border-white/5 mb-1 select-none">
          OS Options
        </div>
        {[
          { label: 'Refresh Grid', icon: '🔄' },
          { label: 'Clear Logs', icon: '🧹' },
          { label: 'Verify Keys', icon: '🔑' },
          { label: 'Close Panel', icon: '✖️' }
        ].map((item) => (
          <button
            key={item.label}
            onClick={() => handleAction(item.label)}
            className="w-full py-1.5 px-2.5 rounded-lg text-left text-xs text-zinc-300 hover:text-white hover:bg-purple-500/20 transition-all font-semibold flex items-center gap-2 cursor-pointer"
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </>
  );
};

export default CenterPlayground;
