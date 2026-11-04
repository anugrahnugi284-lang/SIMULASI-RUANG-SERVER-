import React, { useState } from 'react';
import { X, Sliders, Thermometer, Droplets, Flame, RotateCcw, Save } from 'lucide-react';
import { ThresholdConfig } from '../../types/monitoring';
import { soundManager } from '../../services/soundEffects';

interface ThresholdSettingsModalProps {
  thresholds: ThresholdConfig;
  isOpen: boolean;
  onClose: () => void;
  onSave: (newThresholds: Partial<ThresholdConfig>) => void;
}

export const ThresholdSettingsModal: React.FC<ThresholdSettingsModalProps> = ({
  thresholds,
  isOpen,
  onClose,
  onSave,
}) => {
  if (!isOpen) return null;

  const [form, setForm] = useState<ThresholdConfig>({ ...thresholds });

  const handleSave = () => {
    soundManager.playAcknowledge();
    onSave(form);
    onClose();
  };

  const handleReset = () => {
    soundManager.playClick();
    setForm({
      tempWarning: 25.0,
      tempCritical: 31.0,
      tempOptimalMin: 18.0,
      tempOptimalMax: 24.0,
      humidityMin: 40.0,
      humidityMax: 60.0,
      humidityCriticalMin: 30.0,
      humidityCriticalMax: 70.0,
      smokeWarningPpm: 120,
      smokeCriticalPpm: 240,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-[#0f172a] border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl text-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-[#141d33] border-b border-slate-700/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Sliders className="w-5 h-5 text-sky-400" />
            <h2 className="font-bold text-base text-white">Konfigurasi Ambang Batas Peringatan</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-xs">
          {/* Suhu */}
          <div className="space-y-3 bg-[#162032] p-4 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2 font-bold text-slate-300">
              <Thermometer className="w-4 h-4 text-sky-400" />
              <span>Ambang Batas Suhu Ruangan (°C)</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 mb-1">Peringatan (Warning) °C</label>
                <input
                  type="number"
                  step="0.5"
                  value={form.tempWarning}
                  onChange={(e) => setForm({ ...form, tempWarning: parseFloat(e.target.value) || 25 })}
                  className="w-full bg-[#0d131f] border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:border-sky-500 focus:outline-hidden"
                />
                <span className="text-[10px] text-amber-400">Default: 25.0°C</span>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Kritis (Critical Alarm) °C</label>
                <input
                  type="number"
                  step="0.5"
                  value={form.tempCritical}
                  onChange={(e) => setForm({ ...form, tempCritical: parseFloat(e.target.value) || 31 })}
                  className="w-full bg-[#0d131f] border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:border-red-500 focus:outline-hidden"
                />
                <span className="text-[10px] text-red-400">Default: 31.0°C</span>
              </div>
            </div>
          </div>

          {/* Kelembaban */}
          <div className="space-y-3 bg-[#162032] p-4 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2 font-bold text-slate-300">
              <Droplets className="w-4 h-4 text-cyan-400" />
              <span>Ambang Batas Kelembaban Udara (% RH)</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 mb-1">Batas Bawah Normal (% RH)</label>
                <input
                  type="number"
                  step="1"
                  value={form.humidityMin}
                  onChange={(e) => setForm({ ...form, humidityMin: parseFloat(e.target.value) || 40 })}
                  className="w-full bg-[#0d131f] border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:border-cyan-500 focus:outline-hidden"
                />
                <span className="text-[10px] text-slate-400">Mencegah ESD (&lt;40% RH)</span>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Batas Atas Normal (% RH)</label>
                <input
                  type="number"
                  step="1"
                  value={form.humidityMax}
                  onChange={(e) => setForm({ ...form, humidityMax: parseFloat(e.target.value) || 60 })}
                  className="w-full bg-[#0d131f] border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:border-cyan-500 focus:outline-hidden"
                />
                <span className="text-[10px] text-slate-400">Mencegah Kondensasi (&gt;60% RH)</span>
              </div>
            </div>
          </div>

          {/* Partikel Asap */}
          <div className="space-y-3 bg-[#162032] p-4 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2 font-bold text-slate-300">
              <Flame className="w-4 h-4 text-red-400" />
              <span>Sensitivitas Sensor Partikel Asap (PPM)</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 mb-1">Pre-Alarm Gas (PPM)</label>
                <input
                  type="number"
                  step="10"
                  value={form.smokeWarningPpm}
                  onChange={(e) => setForm({ ...form, smokeWarningPpm: parseInt(e.target.value) || 120 })}
                  className="w-full bg-[#0d131f] border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:border-amber-500 focus:outline-hidden"
                />
                <span className="text-[10px] text-amber-400">Default: 120 PPM</span>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Sirene & Strobe Aktif (PPM)</label>
                <input
                  type="number"
                  step="10"
                  value={form.smokeCriticalPpm}
                  onChange={(e) => setForm({ ...form, smokeCriticalPpm: parseInt(e.target.value) || 240 })}
                  className="w-full bg-[#0d131f] border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:border-red-500 focus:outline-hidden"
                />
                <span className="text-[10px] text-red-400">Default: 240 PPM</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-[#141d33] border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 text-xs transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Standar ASHRAE</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg text-slate-400 hover:text-white text-xs transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 font-semibold text-xs text-white shadow-md transition-colors cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Simpan Konfigurasi</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
