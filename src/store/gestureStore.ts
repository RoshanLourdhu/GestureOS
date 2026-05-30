import { create } from 'zustand';
import type { GestureState, GestureSettings, SystemDiagnostics, HistoryLogEntry } from '../types/gesture';

const DEFAULT_SETTINGS: GestureSettings = {
  sensitivity: 2.2,
  clickThreshold: 0.030,
  rightClickThreshold: 0.030,
  doubleClickThreshold: 0.030,
  dragThreshold: 0.08,
  scrollThreshold: 0.045,
  smoothingFilter: 'kalman',
  emaSmoothingFactor: 0.18,
  kalmanProcessNoise: 0.003,
  kalmanMeasurementNoise: 0.12,
  movingAverageWindow: 6,
  darkMode: true,
  minDetectionConfidence: 0.5
};

const DEFAULT_DIAGNOSTICS: SystemDiagnostics = {
  fps: 60,
  trackingFps: 0,
  latency: 0,
  confidenceScore: 0,
  webglAccelerated: true,
  webcamWidth: 640,
  webcamHeight: 480,
  handsDetectedCount: 0
};

export const useGestureStore = create<GestureState>((set) => ({
  // Core tracking states
  cursorPos: { x: window.innerWidth / 2, y: window.innerHeight / 2 },
  rawCursorPos: { x: window.innerWidth / 2, y: window.innerHeight / 2 },
  handDetected: false,
  currentGesture: 'None',
  confidence: 0,

  // Settings & Diagnostics
  settings: DEFAULT_SETTINGS,
  diagnostics: DEFAULT_DIAGNOSTICS,
  history: [],

  // Testing sandbox states
  activeDragElementId: null,
  volumeLevel: 65,
  brightnessLevel: 80,
  isModalOpen: false,
  contextMenuOpen: false,
  contextMenuPos: { x: 0, y: 0 },
  scrollPosition: 0,

  // Actions
  setCursorPos: (pos) => set({ cursorPos: pos }),
  
  setRawCursorPos: (pos) => set({ rawCursorPos: pos }),
  
  setHandDetected: (detected) => set({ handDetected: detected }),
  
  setCurrentGesture: (gesture) => set({ currentGesture: gesture }),

  addHistoryEntry: (gesture, details) =>
    set((state) => {
      // Don't flood history with identical repetitive frames like "Move" or "None"
      const lastEntry = state.history[0];
      if (lastEntry && lastEntry.gesture === gesture && (gesture === 'Move' || gesture === 'None')) {
        return {};
      }

      const newEntry: HistoryLogEntry = {
        id: Math.random().toString(36).substring(2, 9),
        timestamp: new Date().toLocaleTimeString(),
        gesture,
        details
      };

      // Keep only the 50 most recent actions to save memory
      return {
        history: [newEntry, ...state.history].slice(0, 50)
      };
    }),

  updateSettings: (newSettings) =>
    set((state) => {
      const merged = { ...state.settings, ...newSettings };
      
      // Update HTML theme tag if dark mode changed
      if (newSettings.darkMode !== undefined) {
        if (newSettings.darkMode) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }

      return { settings: merged };
    }),

  updateDiagnostics: (newDiagnostics) =>
    set((state) => ({
      diagnostics: { ...state.diagnostics, ...newDiagnostics }
    })),

  setVolumeLevel: (level) => set({ volumeLevel: Math.max(0, Math.min(100, Math.round(level))) }),
  
  setBrightnessLevel: (level) => set({ brightnessLevel: Math.max(0, Math.min(100, Math.round(level))) }),
  
  setModalOpen: (open) => set({ isModalOpen: open }),
  
  setContextMenuOpen: (open) => set({ contextMenuOpen: open }),
  
  setContextMenuPos: (pos) => set({ contextMenuPos: pos }),
  
  setScrollPosition: (pos) => set({ scrollPosition: pos }),
  
  setActiveDragElementId: (id) => set({ activeDragElementId: id }),

  clearHistory: () => set({ history: [] })
}));
