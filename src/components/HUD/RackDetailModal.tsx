import React from 'react';
import {
  X,
  Server,
  Thermometer,
  Droplets,
  Flame,
  Zap,
  Fan,
  Activity,
  ShieldAlert,
  CheckCircle2,
} from 'lucide-react';
import { RackData } from '../../types/monitoring';

interface RackDetailModalProps {
  rack: RackData | null;
  onClose: () => void;
}

export const RackDetailModal: React.FC<RackDetailModalProps> = ({ rack, onClose }) => {
  const [activeView, setActiveView] = React.useState<'storage-chassis' | 'blades'>('storage-chassis');
  if (!rack) return null;

  const deltaT = (rack.exhaustTemp - rack.temp).toFixed(1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-[#0f172a] border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl text-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-[#141d33] border-b border-slate-700/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm border ${
                rack.status === 'critical'
                  ? 'bg-red-500/20 text-red-400 border-red-500/40'
                  : rack.status === 'warning'
                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                  : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
              }`}
            >
              <Server className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-lg text-white">{rack.name}</h2>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded tracking-wider uppercase ${
                    rack.status === 'critical'
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                      : rack.status === 'warning'
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  }`}
                >
                  {rack.status}
                </span>
              </div>
              <p className="text-xs text-slate-400">{rack.zone} • Koordinat 3D: [{rack.position.join(', ')}]</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Telemetry Metric Cards */}
        <div className="p-6 overflow-y-auto space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Inlet Temp */}
            <div className="bg-[#1e293b]/70 border border-slate-700/60 p-3 rounded-xl">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                <span>Suhu Masuk (Inlet)</span>
                <Thermometer className="w-4 h-4 text-sky-400" />
              </div>
              <div className="text-xl font-bold font-mono text-white">{rack.temp.toFixed(1)}°C</div>
              <div className="text-[10px] text-emerald-400 mt-1">Target: 18 - 24°C</div>
            </div>

            {/* Exhaust Temp */}
            <div className="bg-[#1e293b]/70 border border-slate-700/60 p-3 rounded-xl">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                <span>Suhu Buang (Exhaust)</span>
                <Thermometer className="w-4 h-4 text-orange-400" />
              </div>
              <div className="text-xl font-bold font-mono text-white">{rack.exhaustTemp.toFixed(1)}°C</div>
              <div className="text-[10px] text-slate-400 mt-1">ΔT Thermal: +{deltaT}°C</div>
            </div>

            {/* Kelembaban */}
            <div className="bg-[#1e293b]/70 border border-slate-700/60 p-3 rounded-xl">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                <span>Kelembaban RH</span>
                <Droplets className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-xl font-bold font-mono text-white">{rack.humidity.toFixed(1)}%</div>
              <div className="text-[10px] text-slate-400 mt-1">Rentang: 40 - 60% RH</div>
            </div>

            {/* Partikel Asap */}
            <div
              className={`p-3 rounded-xl border ${
                rack.smokePpm > 120
                  ? 'bg-red-950/40 border-red-500/50 text-red-200'
                  : 'bg-[#1e293b]/70 border-slate-700/60'
              }`}
            >
              <div className="flex items-center justify-between text-xs mb-1">
                <span className={rack.smokePpm > 120 ? 'text-red-300' : 'text-slate-400'}>Sensor Asap</span>
                <Flame className={`w-4 h-4 ${rack.smokePpm > 120 ? 'text-red-400' : 'text-slate-400'}`} />
              </div>
              <div
                className={`text-xl font-bold font-mono ${
                  rack.smokePpm > 120 ? 'text-red-400 animate-pulse' : 'text-white'
                }`}
              >
                {rack.smokePpm} PPM
              </div>
              <div className="text-[10px] mt-1">
                {rack.smokePpm > 240
                  ? '🚨 ALARM KEBAKARAN'
                  : rack.smokePpm > 120
                  ? '⚠️ PRE-ALARM GAS'
                  : 'Normal (<100 PPM)'}
              </div>
            </div>
          </div>

          {/* Electrical & Airflow Auxiliary Row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#141d33] border border-slate-800 p-3.5 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-slate-400">Konsumsi Daya PDU</div>
                  <div className="text-base font-bold font-mono text-white">{rack.powerKw.toFixed(1)} kW</div>
                </div>
              </div>
              <span className="text-[11px] text-slate-400">Tegangan 3-Phase 400V</span>
            </div>

            <div className="bg-[#141d33] border border-slate-800 p-3.5 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400">
                  <Fan className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-slate-400">Kecepatan Kipas Exhaust</div>
                  <div className="text-base font-bold font-mono text-white">{rack.fanRpm} RPM</div>
                </div>
              </div>
              <span className="text-[11px] text-slate-400">Exhaust CFM ~1450</span>
            </div>
          </div>

          {/* Server Hardware View Mode Toggle */}
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3 border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Arsitektur Perangkat Keras Rak ({rack.id})
                </h3>
              </div>

              <div className="flex items-center bg-[#162032] p-1 rounded-lg border border-slate-700 text-xs">
                <button
                  onClick={() => setActiveView('storage-chassis')}
                  className={`px-3 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                    activeView === 'storage-chassis'
                      ? 'bg-sky-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Sasis 4U 24-Bay Hot-Swap (Sesuai Referensi)
                </button>
                <button
                  onClick={() => setActiveView('blades')}
                  className={`px-3 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                    activeView === 'blades'
                      ? 'bg-sky-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Daftar Bilah Komputasi ({rack.servers.length})
                </button>
              </div>
            </div>

            {/* View 1: 24-Bay Hot-Swap Storage Chassis View (Matching Reference Photo) */}
            {activeView === 'storage-chassis' && (
              <div className="space-y-4">
                {/* Reference Photo Showcase Container */}
                <div className="bg-[#0b0e14] border border-slate-700/80 rounded-xl p-3 flex flex-col sm:flex-row items-center gap-4 shadow-inner">
                  <div className="w-full sm:w-1/2 flex flex-col items-center">
                    <div className="relative rounded-lg overflow-hidden border border-slate-600 shadow-md bg-black/60 p-1">
                      <img
                        src="/assets/aistudio/image_590b66d0.png"
                        alt="Tampilan Depan Server 4U 24-Bay Hot-Swap Storage"
                        className="w-full h-auto max-h-48 object-contain rounded"
                      />
                      <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-slate-900/90 text-sky-300 border border-slate-700">
                        Referensi 4U 24-Bay
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 italic">
                      Tampilan depan fisik diadopsi ke Three.js 3D Twin
                    </span>
                  </div>

                  <div className="w-full sm:w-1/2 space-y-2 text-xs">
                    <div className="font-bold text-white text-sm">
                      Enterprise High-Density Storage Chassis (4U)
                    </div>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      Sasis penyimpanan data enterprise berkapasitas 24 unit hard drive hot-swap (susunan 4 kolom × 6 baris) dengan pegangan handle perak dan cincin indikator LED aktivitas biru.
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-slate-800">
                      <div>
                        <span className="text-slate-500">Form Factor:</span>
                        <div className="font-mono font-semibold text-slate-200">4U Rackmount</div>
                      </div>
                      <div>
                        <span className="text-slate-500">Total Drive Bays:</span>
                        <div className="font-mono font-semibold text-sky-400">24x Hot-Swap SAS/SATA</div>
                      </div>
                      <div>
                        <span className="text-slate-500">Interface:</span>
                        <div className="font-mono font-semibold text-slate-200">SAS-3 12Gbps Dual-Port</div>
                      </div>
                      <div>
                        <span className="text-slate-500">Backplane:</span>
                        <div className="font-mono font-semibold text-emerald-400">Direct-Attached Expander</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 24-Bay Hot-Swap Drive Grid Matrix (4 cols x 6 rows) */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
                      Matriks Telemetri 24 Drive Bays (SAS Caddy Status)
                    </span>
                    <span className="text-emerald-400 font-mono text-[11px]">24/24 Drive Online • Sehat</span>
                  </div>

                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5 font-mono text-[10px]">
                    {Array.from({ length: 24 }).map((_, dIdx) => {
                      const dNum = dIdx + 1;
                      const driveTemp = +(38 + (dIdx % 5) * 0.8).toFixed(1);
                      return (
                        <div
                          key={dIdx}
                          className="bg-[#141b29] border border-slate-800 hover:border-sky-500/60 p-1.5 rounded-lg flex flex-col justify-between transition-colors"
                        >
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="font-bold text-sky-300">#BAY {dNum}</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          </div>
                          <div className="text-slate-400 text-[9px]">18TB SAS</div>
                          <div className="flex items-center justify-between mt-1 text-[9px]">
                            <span className="text-slate-500">Temp:</span>
                            <span className="text-emerald-300 font-bold">{driveTemp}°C</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* View 2: Compute Blade Inventory */}
            {activeView === 'blades' && (
              <div className="space-y-2">
                {rack.servers.map((srv, idx) => (
                  <div
                    key={idx}
                    className="bg-[#161f30] border border-slate-800 p-3 rounded-lg flex items-center justify-between gap-4 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-slate-400 w-8">Slot {srv.slot}</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">
                        {srv.uSize}U
                      </span>
                      <span className="font-semibold text-slate-200">{srv.model}</span>
                    </div>

                    <div className="flex items-center gap-6">
                      <div>
                        <span className="text-slate-400 mr-1.5">CPU Temp:</span>
                        <span
                          className={`font-mono font-bold ${
                            srv.cpuTemp > 65 ? 'text-red-400' : srv.cpuTemp > 55 ? 'text-amber-400' : 'text-emerald-400'
                          }`}
                        >
                          {srv.cpuTemp}°C
                        </span>
                      </div>

                      <div className="w-28">
                        <div className="flex justify-between text-[10px] text-slate-400 mb-0.5">
                          <span>Beban</span>
                          <span>{srv.loadPercent}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              srv.loadPercent > 80 ? 'bg-red-500' : srv.loadPercent > 60 ? 'bg-amber-500' : 'bg-sky-500'
                            }`}
                            style={{ width: `${srv.loadPercent}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        {srv.status === 'normal' ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <ShieldAlert className="w-4 h-4 text-amber-400" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-[#141d33] border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 font-semibold text-xs text-white transition-colors cursor-pointer"
          >
            Tutup Inspeksi
          </button>
        </div>
      </div>
    </div>
  );
};
