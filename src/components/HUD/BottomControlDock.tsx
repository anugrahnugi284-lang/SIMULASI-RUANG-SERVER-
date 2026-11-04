import React, { useState } from 'react';
import {
  Camera,
  Eye,
  ChevronDown,
  ChevronUp,
  Thermometer,
  Flame,
  Wind,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { CameraPreset, VisualizationMode } from '../../types/monitoring';
import { soundManager } from '../../services/soundEffects';

interface BottomControlDockProps {
  cameraPreset: CameraPreset;
  setCameraPreset: (preset: CameraPreset) => void;
  visualizationMode: VisualizationMode;
  setVisualizationMode: (mode: VisualizationMode) => void;
  simulationScenario: string;
  onSimulateScenario: (scenario: 'none' | 'overheat-b2' | 'smoke-a' | 'crac-fail') => void;
}

export const BottomControlDock: React.FC<BottomControlDockProps> = ({
  cameraPreset,
  setCameraPreset,
  visualizationMode,
  setVisualizationMode,
  simulationScenario,
  onSimulateScenario,
}) => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  const handleCameraChange = (preset: CameraPreset) => {
    soundManager.playClick();
    setCameraPreset(preset);
  };

  const handleModeChange = (mode: VisualizationMode) => {
    soundManager.playClick();
    setVisualizationMode(mode);
  };

  return (
    <div
      className="fixed z-30 transition-transform duration-300 ease-in-out pointer-events-auto"
      style={{
        bottom: '16px',
        left: '50%',
        transform: isCollapsed ? 'translate(-50%, calc(100% - 32px))' : 'translate(-50%, 0)',
        width: 'min(960px, 95vw)',
      }}
    >
      {/* Collapse / Expand Toggle Tab */}
      <div className="flex justify-center mb-1">
        <button
          onClick={() => {
            soundManager.playClick();
            setIsCollapsed(!isCollapsed);
          }}
          className="flex items-center gap-1.5 px-3 py-1 rounded-t-lg bg-[#0f172a] border border-b-0 border-slate-700/80 text-[11px] font-semibold text-slate-300 hover:text-white shadow-lg transition-colors cursor-pointer"
        >
          {isCollapsed ? (
            <>
              <ChevronUp className="w-3.5 h-3.5 text-sky-400" />
              <span>Tampilkan Kontrol 3D</span>
            </>
          ) : (
            <>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              <span>Sembunyikan Panel (Zen Mode)</span>
            </>
          )}
        </button>
      </div>

      {/* Main Glassmorphic Dock Container */}
      <div className="bg-[#0f172a]/95 border border-slate-700/80 rounded-xl p-3 shadow-2xl text-slate-200">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Group 1: Camera Presets */}
          <div className="flex items-center gap-1.5">
            <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 mr-1">
              <Camera className="w-3.5 h-3.5 text-sky-400" />
              <span>Kamera:</span>
            </span>

            <div className="flex items-center gap-1 bg-slate-900/80 p-0.5 rounded-lg border border-slate-800 text-xs">
              <button
                onClick={() => handleCameraChange('overview')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  cameraPreset === 'overview'
                    ? 'bg-sky-600 text-white font-medium shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => handleCameraChange('cold-aisle')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  cameraPreset === 'cold-aisle'
                    ? 'bg-sky-600 text-white font-medium shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Lorong Dingin
              </button>
              <button
                onClick={() => handleCameraChange('hot-aisle')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  cameraPreset === 'hot-aisle'
                    ? 'bg-sky-600 text-white font-medium shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Lorong Panas
              </button>
              <button
                onClick={() => handleCameraChange('crac-units')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  cameraPreset === 'crac-units'
                    ? 'bg-sky-600 text-white font-medium shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                CRAC AC
              </button>
              <button
                onClick={() => handleCameraChange('smoke-ceiling')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  cameraPreset === 'smoke-ceiling'
                    ? 'bg-sky-600 text-white font-medium shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Sensor Plafon
              </button>
              <button
                onClick={() => handleCameraChange('top-down')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  cameraPreset === 'top-down'
                    ? 'bg-sky-600 text-white font-medium shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Tampak Atas
              </button>
            </div>
          </div>

          {/* Group 2: Visualization Mode (PBR, Thermal Heatmap, Airflow) */}
          <div className="flex items-center gap-1.5">
            <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 mr-1">
              <Eye className="w-3.5 h-3.5 text-emerald-400" />
              <span>Layer:</span>
            </span>

            <div className="flex items-center gap-1 bg-slate-900/80 p-0.5 rounded-lg border border-slate-800 text-xs">
              <button
                onClick={() => handleModeChange('pbr')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  visualizationMode === 'pbr'
                    ? 'bg-emerald-600 text-white font-medium shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Standar PBR
              </button>
              <button
                onClick={() => handleModeChange('thermal')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors ${
                  visualizationMode === 'thermal'
                    ? 'bg-gradient-to-r from-amber-600 to-rose-600 text-white font-medium shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Thermometer className="w-3 h-3" />
                <span>Heatmap Termal</span>
              </button>
              <button
                onClick={() => handleModeChange('airflow')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors ${
                  visualizationMode === 'airflow'
                    ? 'bg-cyan-600 text-white font-medium shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Wind className="w-3 h-3" />
                <span>Aliran Udara</span>
              </button>
            </div>
          </div>

          {/* Group 3: Quick Simulation Triggers */}
          <div className="flex items-center gap-1.5 border-t sm:border-t-0 sm:border-l border-slate-800 pt-2 sm:pt-0 sm:pl-3">
            <span className="text-[11px] font-semibold text-slate-400 mr-1">Simulasi:</span>
            <div className="flex items-center gap-1.5 text-xs">
              <button
                onClick={() => onSimulateScenario('overheat-b2')}
                title="Simulasi Overheat Rak B2 (>35°C)"
                className={`flex items-center gap-1 px-2 py-1 rounded-md border text-[11px] font-medium transition-colors ${
                  simulationScenario === 'overheat-b2'
                    ? 'bg-amber-500/30 border-amber-500 text-amber-200'
                    : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <AlertTriangle className="w-3 h-3 text-amber-400" />
                <span>Overheat B2</span>
              </button>

              <button
                onClick={() => onSimulateScenario('smoke-a')}
                title="Simulasi Deteksi Asap Plafon & Rak A2 (>300 PPM)"
                className={`flex items-center gap-1 px-2 py-1 rounded-md border text-[11px] font-medium transition-colors ${
                  simulationScenario === 'smoke-a'
                    ? 'bg-red-500/30 border-red-500 text-red-200'
                    : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <Flame className="w-3 h-3 text-red-400" />
                <span>Asap Zona A</span>
              </button>

              <button
                onClick={() => onSimulateScenario('none')}
                title="Reset seluruh parameter kembali normal"
                className="flex items-center gap-1 px-2 py-1 rounded-md border bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700 text-[11px] font-medium transition-colors"
              >
                <RotateCcw className="w-3 h-3 text-emerald-400" />
                <span>Reset</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
