export type ActiveGesture =
  | 'None'
  | 'Move'
  | 'Left Click'
  | 'Right Click'
  | 'Double Click'
  | 'Drag'
  | 'Scroll'
  | 'Volume Up'
  | 'Volume Down'
  | 'Brightness Up'
  | 'Brightness Down';

export interface Point2D {
  x: number;
  y: number;
}

export interface Landmark {
  x: number;
  y: number;
  z: number;
}

export interface HistoryLogEntry {
  id: string;
  timestamp: string;
  gesture: ActiveGesture;
  details: string;
}

export type MotionSmoothingFilter = 'kalman' | 'exponential' | 'moving_average';

export interface GestureSettings {
  sensitivity: number;         // 1.0 - 5.0 speed scale
  clickThreshold: number;      // distance threshold for index-thumb click
  rightClickThreshold: number; // distance threshold for middle-thumb click
  doubleClickThreshold: number;// distance threshold for index-middle click
  dragThreshold: number;       // distance threshold for closed fist
  scrollThreshold: number;     // threshold for scroll vertical movement
  smoothingFilter: MotionSmoothingFilter;
  emaSmoothingFactor: number;  // Exponential factor (0.01 - 1.0)
  kalmanProcessNoise: number;  // Kalman filter setting
  kalmanMeasurementNoise: number;
  movingAverageWindow: number; // number of frames for moving average
  darkMode: boolean;
  minDetectionConfidence: number;
}

export interface SystemDiagnostics {
  fps: number;
  trackingFps: number;
  latency: number;             // Processing latency in ms
  confidenceScore: number;     // Model detection confidence (0.0 - 1.0)
  webglAccelerated: boolean;   // Whether GPU is being used
  webcamWidth: number;
  webcamHeight: number;
  handsDetectedCount: number;
}

export interface GestureState {
  // Coordinates
  cursorPos: Point2D;          // Smoothed screen coordinates (px)
  rawCursorPos: Point2D;       // Raw screen coordinates (px)
  handDetected: boolean;
  currentGesture: ActiveGesture;
  confidence: number;
  
  // Settings & Logs
  settings: GestureSettings;
  diagnostics: SystemDiagnostics;
  history: HistoryLogEntry[];
  
  // Interactive Component Highlights
  activeDragElementId: string | null;
  volumeLevel: number;         // 0 - 100
  brightnessLevel: number;     // 0 - 100
  isModalOpen: boolean;
  contextMenuOpen: boolean;
  contextMenuPos: Point2D;
  scrollPosition: number;      // Scroll height of test scroll pane
  
  // Actions
  setCursorPos: (pos: Point2D) => void;
  setRawCursorPos: (pos: Point2D) => void;
  setHandDetected: (detected: boolean) => void;
  setCurrentGesture: (gesture: ActiveGesture) => void;
  addHistoryEntry: (gesture: ActiveGesture, details: string) => void;
  updateSettings: (settings: Partial<GestureSettings>) => void;
  updateDiagnostics: (diagnostics: Partial<SystemDiagnostics>) => void;
  setVolumeLevel: (level: number) => void;
  setBrightnessLevel: (level: number) => void;
  setModalOpen: (open: boolean) => void;
  setContextMenuOpen: (open: boolean) => void;
  setContextMenuPos: (pos: Point2D) => void;
  setScrollPosition: (pos: number) => void;
  setActiveDragElementId: (id: string | null) => void;
  clearHistory: () => void;
}
