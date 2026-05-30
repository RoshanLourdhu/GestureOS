import React, { useState } from 'react';
import { useWebcam } from './hooks/useWebcam';
import { SidebarLeft } from './components/SidebarLeft';
import { SidebarRight } from './components/SidebarRight';
import { CenterPlayground } from './components/CenterPlayground';
import { Footer } from './components/Footer';
import { VirtualCursor } from './components/VirtualCursor';
import { SettingsModal } from './components/SettingsModal';
import { useGestureStore } from './store/gestureStore';

export const App: React.FC = () => {
  // Mount invisible camera and MediaPipe computer vision loop
  useWebcam();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { settings } = useGestureStore();

  return (
    <div className={`w-screen h-screen flex flex-col overflow-hidden select-none bg-[#09090b] transition-colors duration-300 ${settings.darkMode ? 'dark' : 'light'}`}>
      
      {/* Dynamic Background visual highlights */}
      <div className="absolute inset-0 bg-grid-pattern opacity-60 pointer-events-none z-0" />
      
      {/* Glowing Neon ambient backdrop lights */}
      <div className="absolute left-[20%] top-[20%] w-[350px] h-[350px] bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none z-0 animate-neon-pulse" />
      <div className="absolute right-[25%] bottom-[15%] w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[120px] pointer-events-none z-0" />

      {/* Main Responsive Dashboard Split Layout */}
      <div className="flex-1 flex overflow-hidden z-10 relative">
        {/* Left Hand Guide Sidebar */}
        <SidebarLeft onOpenSettings={() => setIsSettingsOpen(true)} />

        {/* Center OS Playground Stage */}
        <CenterPlayground />

        {/* Right Live Telemetry Dashboard */}
        <SidebarRight />
      </div>

      {/* Footer statistics bar */}
      <Footer />

      {/* Real-time Hardware Accelerated Cursor */}
      <VirtualCursor />

      {/* Floating System Param Config Modal */}
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />
    </div>
  );
};

export default App;
