import React from 'react';
import { useGestureStore } from '../store/gestureStore';
import { Settings, X, Eye, RefreshCw, Zap } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { settings, updateSettings } = useGestureStore();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[99999] flex items-center justify-center p-4">
      <div 
        style={{ width: '480px' }}
        className="glass-panel p-6 rounded-3xl border border-white/10 flex flex-col gap-5 relative shadow-[0_0_50px_rgba(0,0,0,0.8)] max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-cyan-400" />
            <h3 className="font-outfit font-bold text-base text-zinc-100">
              System Sensitivity & Filter Tuner
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/5 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Sections */}
        <div className="flex flex-col gap-5 text-sm select-none">
          
          {/* Section 1: Cursor Sensitivity */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center text-xs font-bold text-zinc-300">
              <span className="flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-cyan-400" />
                <span>Cursor Sensitivity Multiplier</span>
              </span>
              <span className="text-cyan-400 font-mono">{settings.sensitivity.toFixed(1)}x</span>
            </div>
            <p className="text-[10px] text-zinc-500 leading-normal">
              Amplifies physical finger coordinates to easily cover full viewport bounds.
            </p>
            <input 
              type="range" 
              min="1.0" 
              max="5.0" 
              step="0.1"
              value={settings.sensitivity}
              onChange={(e) => updateSettings({ sensitivity: parseFloat(e.target.value) })}
              className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
          </div>

          {/* Section 2: Motion Smoothing Filter Select */}
          <div className="flex flex-col gap-2 border-t border-white/5 pt-4">
            <div className="flex justify-between items-center text-xs font-bold text-zinc-300">
              <span className="flex items-center gap-1">
                <RefreshCw className="w-3.5 h-3.5 text-purple-400" />
                <span>Active Smoothing filter</span>
              </span>
              <span className="text-purple-400 font-mono uppercase text-[10px]">
                {settings.smoothingFilter} Active
              </span>
            </div>
            
            <div className="grid grid-cols-3 gap-2 mt-1">
              {[
                { id: 'kalman', label: 'Kalman Filter', desc: 'Noise covariance modeling' },
                { id: 'exponential', label: 'Holt\'s Linear', desc: 'EMA level & speed trend' },
                { id: 'moving_average', label: 'SMA Average', desc: 'Sliding window buffer' }
              ].map((filt) => (
                <button
                  key={filt.id}
                  onClick={() => updateSettings({ smoothingFilter: filt.id as any })}
                  className={`p-2.5 rounded-xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                    settings.smoothingFilter === filt.id
                      ? 'border-purple-500/50 bg-purple-500/10 text-purple-200 shadow-md shadow-purple-500/5'
                      : 'border-white/5 bg-zinc-950/20 hover:border-zinc-800 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <span className="text-[10px] font-bold">{filt.label}</span>
                  <span className="text-[8px] text-zinc-500 leading-normal">{filt.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Section 3: Fine-Tuning Constants based on active filter */}
          <div className="flex flex-col gap-3.5 bg-zinc-950/40 p-4 rounded-2xl border border-white/5">
            <span className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider">
              {settings.smoothingFilter === 'kalman' ? 'Kalman Matrix Constants' : settings.smoothingFilter === 'exponential' ? 'EMA Coefficient' : 'Sliding Window Width'}
            </span>

            {settings.smoothingFilter === 'kalman' && (
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-[10px] text-zinc-400 font-mono">
                    <span>Process Noise Covariance (Q):</span>
                    <span>{settings.kalmanProcessNoise.toFixed(4)}</span>
                  </div>
                  <input 
                    type="range" 
                    min="0.0005" 
                    max="0.010" 
                    step="0.0005"
                    value={settings.kalmanProcessNoise}
                    onChange={(e) => updateSettings({ kalmanProcessNoise: parseFloat(e.target.value) })}
                    className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-purple-400"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-[10px] text-zinc-400 font-mono">
                    <span>Measurement Variance (R):</span>
                    <span>{settings.kalmanMeasurementNoise.toFixed(2)}</span>
                  </div>
                  <input 
                    type="range" 
                    min="0.05" 
                    max="0.50" 
                    step="0.01"
                    value={settings.kalmanMeasurementNoise}
                    onChange={(e) => updateSettings({ kalmanMeasurementNoise: parseFloat(e.target.value) })}
                    className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-purple-400"
                  />
                </div>
              </div>
            )}

            {settings.smoothingFilter === 'exponential' && (
              <div className="flex flex-col gap-2">
                <div className="flex justify-between text-[10px] text-zinc-400 font-mono">
                  <span>EMA Alpha Weight (0.01 - 1.0):</span>
                  <span>{settings.emaSmoothingFactor.toFixed(2)}</span>
                </div>
                <input 
                  type="range" 
                  min="0.05" 
                  max="0.80" 
                  step="0.01"
                  value={settings.emaSmoothingFactor}
                  onChange={(e) => updateSettings({ emaSmoothingFactor: parseFloat(e.target.value) })}
                  className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-purple-400"
                />
              </div>
            )}

            {settings.smoothingFilter === 'moving_average' && (
              <div className="flex flex-col gap-2">
                <div className="flex justify-between text-[10px] text-zinc-400 font-mono">
                  <span>History Frames Window (N):</span>
                  <span>{settings.movingAverageWindow} frames</span>
                </div>
                <input 
                  type="range" 
                  min="2" 
                  max="15" 
                  step="1"
                  value={settings.movingAverageWindow}
                  onChange={(e) => updateSettings({ movingAverageWindow: parseInt(e.target.value) })}
                  className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-purple-400"
                />
              </div>
            )}
          </div>

          {/* Section 4: Gesture Detection Threshold */}
          <div className="flex flex-col gap-2 border-t border-white/5 pt-4">
            <div className="flex justify-between items-center text-xs font-bold text-zinc-300">
              <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5 text-indigo-400" />
                <span>Minimum Detection Confidence</span>
              </span>
              <span className="text-indigo-400 font-mono">{(settings.minDetectionConfidence * 100).toFixed(0)}%</span>
            </div>
            <p className="text-[10px] text-zinc-500 leading-normal">
              Clamps minimum threshold for MediaPipe hand node acceptance before firing pointer actions.
            </p>
            <input 
              type="range" 
              min="0.4" 
              max="0.8" 
              step="0.05"
              value={settings.minDetectionConfidence}
              onChange={(e) => updateSettings({ minDetectionConfidence: parseFloat(e.target.value) })}
              className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-400"
            />
          </div>

        </div>

        {/* Footer info text */}
        <div className="text-[10px] text-zinc-500 leading-relaxed text-center border-t border-white/5 pt-3 mt-2">
          Fine-tune constraints for optimal response relative to lighting and distance. Decreasing filter constraints increases reactivity but may introduce small tremor.
        </div>
      </div>
    </div>
  );
};
export default SettingsModal;
