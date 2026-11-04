import React from 'react';
import { X, Fan, Flame, Activity, CheckCircle2, ShieldAlert } from 'lucide-react';
import { CRACUnitData, SmokeDetectorData } from '../../types/monitoring';

interface DeviceDetailModalProps {
  crac: CRACUnitData | null;
  smoke: SmokeDetectorData | null;
  onClose: () => void;
}

export const DeviceDetailModal: React.FC<DeviceDetailModalProps> = ({ crac, smoke, onClose }) => {
  if (!crac && !smoke) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-[#0f172a] border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl text-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-[#141d33] border-b border-slate-700/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {crac ? <Fan className="w-5 h-5 text-sky-400" /> : <Flame className="w-5 h-5 text-red-400" />}
            <div>
              <h2 className="font-bold text-base text-white">{crac ? crac.name : smoke?.name}</h2>
              <p className="text-xs text-slate-400">{crac ? 'Precision Cooling Unit' : 'Optical Ceiling Smoke Detector'}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content for CRAC */}
        {crac && (
          <div className="p-6 space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#162032] p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400">Suhu Suplai (Supply)</span>
                <div className="text-xl font-bold font-mono text-sky-400 mt-1">{crac.supplyTemp}°C</div>
                <span className="text-[10px] text-slate-500">Setpoint: {crac.setPointTemp}°C</span>
              </div>
              <div className="bg-[#162032] p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400">Suhu Udara Balik</span>
                <div className="text-xl font-bold font-mono text-orange-400 mt-1">{crac.returnTemp}°C</div>
                <span className="text-[10px] text-slate-500">Hot Return Air</span>
              </div>
            </div>

            <div className="bg-[#162032] p-3.5 rounded-xl border border-slate-800 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Status Kompresor:</span>
                <span className={`font-semibold ${crac.compressorActive ? 'text-emerald-400' : 'text-red-400'}`}>
                  {crac.compressorActive ? 'Aktif (Compressor Running)' : 'OFFLINE (Kompresor Mati)'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Kecepatan Kipas Sirkulasi:</span>
                <span className="font-mono font-bold text-white">{crac.fanSpeedPercent}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Status Unit:</span>
                <span className="uppercase font-bold text-emerald-400">{crac.status}</span>
              </div>
            </div>
          </div>
        )}

        {/* Content for Smoke Detector */}
        {smoke && (
          <div className="p-6 space-y-4 text-xs">
            <div
              className={`p-4 rounded-xl border ${
                smoke.ppm > 120 ? 'bg-red-950/40 border-red-500' : 'bg-[#162032] border-slate-800'
              }`}
            >
              <span className="text-slate-400">Konsentrasi Partikel Gas / Asap:</span>
              <div className="text-2xl font-bold font-mono text-white mt-1">{smoke.ppm} PPM</div>
              <div className="text-[11px] mt-1 font-semibold text-emerald-400">
                {smoke.triggered ? '🚨 ALARM KEBAKARAN AKTIF' : 'Kondisi Udara Normal (<100 PPM)'}
              </div>
            </div>

            <div className="bg-[#162032] p-3.5 rounded-xl border border-slate-800 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Zona Plafon:</span>
                <span className="font-semibold text-white">{smoke.zone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Tipe Sensor:</span>
                <span className="text-slate-300">Photoelectric Optical Smoke Chamber</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Waktu Respon:</span>
                <span className="font-mono text-emerald-400">&lt; 10 ms</span>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-3 bg-[#141d33] border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-xs font-semibold text-white transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
