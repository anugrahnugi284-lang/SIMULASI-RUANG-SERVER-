import React, { useState } from 'react';
import {
  Thermometer,
  Droplets,
  Flame,
  Zap,
  Gauge,
  Server,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  Sliders,
} from 'lucide-react';
import { RadialGauge } from './RadialGauge';
import { RackData, CRACUnitData, SmokeDetectorData, ThresholdConfig, RackId } from '../../types/monitoring';
import { soundManager } from '../../services/soundEffects';

interface GaugeDashboardProps {
  racks: RackData[];
  cracs: CRACUnitData[];
  smokeDetectors: SmokeDetectorData[];
  thresholds: ThresholdConfig;
  onSelectRack3D?: (rackId: RackId) => void;
  onOpenThresholds: () => void;
  onSimulateScenario: (scenario: 'none' | 'overheat-b2' | 'smoke-a' | 'crac-fail') => void;
  simulationScenario: string;
}

export const GaugeDashboard: React.FC<GaugeDashboardProps> = ({
  racks,
  cracs,
  smokeDetectors,
  thresholds,
  onSelectRack3D,
  onOpenThresholds,
  onSimulateScenario,
  simulationScenario,
}) => {
  const [selectedRackId, setSelectedRackId] = useState<RackId>('B2');

  // Compute room aggregate metrics
  const avgTemp = racks.length ? racks.reduce((acc, r) => acc + r.temp, 0) / racks.length : 21.8;
  const avgHum = racks.length ? racks.reduce((acc, r) => acc + r.humidity, 0) / racks.length : 48.0;
  const maxSmoke = Math.max(...racks.map((r) => r.smokePpm), ...smokeDetectors.map((s) => s.ppm));
  const totalPower = racks.reduce((acc, r) => acc + r.powerKw, 0);

  // Status evaluations for room metrics
  const tempStatus: 'normal' | 'warning' | 'critical' =
    avgTemp >= thresholds.tempCritical
      ? 'critical'
      : avgTemp >= thresholds.tempWarning
      ? 'warning'
      : 'normal';

  const humStatus: 'normal' | 'warning' | 'critical' =
    avgHum <= thresholds.humidityCriticalMin || avgHum >= thresholds.humidityCriticalMax
      ? 'critical'
      : avgHum <= thresholds.humidityMin || avgHum >= thresholds.humidityMax
      ? 'warning'
      : 'normal';

  const smokeStatus: 'normal' | 'warning' | 'critical' =
    maxSmoke >= thresholds.smokeCriticalPpm
      ? 'critical'
      : maxSmoke >= thresholds.smokeWarningPpm
      ? 'warning'
      : 'normal';

  const powerStatus: 'normal' | 'warning' | 'critical' =
    totalPower >= 65 ? 'critical' : totalPower >= 52 ? 'warning' : 'normal';

  // Selected rack data
  const currentRack = racks.find((r) => r.id === selectedRackId) || racks[0];
  const rackDeltaT = +(currentRack.exhaustTemp - currentRack.temp).toFixed(1);

  return (
    <div className="w-full h-full bg-[#0b0e14] text-slate-200 overflow-y-auto p-4 sm:p-6 space-y-6">
      {/* Top Banner & Title */}
      <div className="bg-[#121824] border border-slate-800 p-5 rounded-2xl shadow flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-500/15 border border-sky-500/30 text-sky-400 flex items-center justify-center">
            <Gauge className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-base text-white">Dasbor Gauge Status Sensor Lingkungan</h1>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                ASHRAE TC 9.9
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Instrumen dial gauge sirkular presisi tinggi untuk monitoring real-time suhu, kelembaban, partikel asap, dan daya
            </p>
          </div>
        </div>

        {/* Quick controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenThresholds}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 transition-colors cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5 text-sky-400" />
            <span>Atur Ambang Batas</span>
          </button>

          <button
            onClick={() => onSimulateScenario('overheat-b2')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
              simulationScenario === 'overheat-b2'
                ? 'bg-amber-600 text-white border-amber-500'
                : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border-slate-700'
            }`}
          >
            Uji Overheat
          </button>

          <button
            onClick={() => onSimulateScenario('smoke-a')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
              simulationScenario === 'smoke-a'
                ? 'bg-red-600 text-white border-red-500'
                : 'bg-slate-800 hover:bg-slate-700 text-red-300 border-slate-700'
            }`}
          >
            Uji Asap
          </button>

          {simulationScenario !== 'none' && (
            <button
              onClick={() => onSimulateScenario('none')}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Primary Section: 4 Hero Radial Gauges */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <span>Instrumen Metrik Utama Ruangan (Room Ambient Gauges)</span>
          </h2>
          <span className="text-[11px] text-slate-400 font-mono">Frekuensi Streaming: 2 detik</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {/* Gauge 1: Suhu Lingkungan Rata-rata */}
          <RadialGauge
            value={avgTemp}
            min={10}
            max={45}
            title="Suhu Rata-rata Ruangan"
            unit="°C"
            subtitle="ASHRAE: 18 - 24°C"
            status={tempStatus}
            icon={<Thermometer className="w-4 h-4 text-sky-400" />}
            size={270}
            zones={[
              { from: 10, to: 18, color: '#0284c7', label: 'Cool' },
              { from: 18, to: 24, color: '#10b981', label: 'Optimal' },
              { from: 24, to: thresholds.tempCritical, color: '#f59e0b', label: 'Warning' },
              { from: thresholds.tempCritical, to: 45, color: '#ef4444', label: 'Critical' },
            ]}
          />

          {/* Gauge 2: Kelembaban Relatif RH */}
          <RadialGauge
            value={avgHum}
            min={10}
            max={90}
            title="Kelembaban Relatif"
            unit="% RH"
            subtitle="ASHRAE: 40 - 60% RH"
            status={humStatus}
            icon={<Droplets className="w-4 h-4 text-cyan-400" />}
            size={270}
            zones={[
              { from: 10, to: 30, color: '#ef4444', label: 'ESD Risk' },
              { from: 30, to: 40, color: '#f59e0b', label: 'Low RH' },
              { from: 40, to: 60, color: '#10b981', label: 'Optimal' },
              { from: 60, to: 70, color: '#f59e0b', label: 'High RH' },
              { from: 70, to: 90, color: '#ef4444', label: 'Kondensasi' },
            ]}
          />

          {/* Gauge 3: Deteksi Partikel Asap */}
          <RadialGauge
            value={maxSmoke}
            min={0}
            max={500}
            title="Kepadatan Partikel Asap"
            unit="PPM"
            subtitle="Batas Aman: <100 PPM"
            status={smokeStatus}
            icon={<Flame className="w-4 h-4 text-red-400" />}
            size={270}
            zones={[
              { from: 0, to: 100, color: '#10b981', label: 'Clean' },
              { from: 100, to: thresholds.smokeWarningPpm, color: '#06b6d4', label: 'Normal' },
              { from: thresholds.smokeWarningPpm, to: thresholds.smokeCriticalPpm, color: '#f59e0b', label: 'Pre-Alarm' },
              { from: thresholds.smokeCriticalPpm, to: 500, color: '#ef4444', label: 'FIRE ALARM' },
            ]}
          />

          {/* Gauge 4: Total Konsumsi Daya PDU */}
          <RadialGauge
            value={totalPower}
            min={0}
            max={80}
            title="Total Beban Daya PDU"
            unit="kW"
            subtitle="Kapasitas Gardu: 80 kW"
            status={powerStatus}
            icon={<Zap className="w-4 h-4 text-amber-400" />}
            size={270}
            zones={[
              { from: 0, to: 45, color: '#10b981', label: 'Efficient' },
              { from: 45, to: 60, color: '#f59e0b', label: 'Moderate' },
              { from: 60, to: 80, color: '#ef4444', label: 'High Load' },
            ]}
          />
        </div>
      </div>

      {/* Secondary Section: Rack-by-Rack Detailed Inspection Matrix */}
      <div className="bg-[#121824] border border-slate-800 rounded-2xl p-6 shadow-lg space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <Server className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="font-bold text-sm text-white">Inspeksi Dial Gauge Per Rak Server</h3>
              <p className="text-xs text-slate-400">Pilih rak untuk memeriksa gradien suhu masuk vs buang dan status sensor lokal</p>
            </div>
          </div>

          {/* Rack Selector Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 bg-[#182133] p-1 rounded-xl border border-slate-700/80">
            {racks.map((r) => {
              const isSelected = r.id === selectedRackId;
              let indicatorColor = 'bg-emerald-400';
              if (r.status === 'warning') indicatorColor = 'bg-amber-400';
              if (r.status === 'critical') indicatorColor = 'bg-red-400';

              return (
                <button
                  key={r.id}
                  onClick={() => {
                    soundManager.playClick();
                    setSelectedRackId(r.id);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-sky-600 text-white shadow'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${indicatorColor}`} />
                  <span>{r.id}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Rack Detailed Gauges Row */}
        <div>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <span className="font-bold text-base text-white">{currentRack.name}</span>
              <span className="text-xs text-slate-400 ml-2">({currentRack.zone})</span>
            </div>

            {onSelectRack3D && (
              <button
                onClick={() => onSelectRack3D(currentRack.id)}
                className="px-3 py-1 rounded-lg bg-sky-600/30 border border-sky-500/50 hover:bg-sky-600/50 text-xs font-semibold text-sky-200 transition-colors cursor-pointer"
              >
                Lihat di 3D Twin Ruangan →
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Rack Inlet Temp */}
            <RadialGauge
              value={currentRack.temp}
              min={15}
              max={45}
              title={`Inlet Air - ${currentRack.id}`}
              unit="°C"
              subtitle="Suhu Masuk Depan"
              status={currentRack.temp >= thresholds.tempCritical ? 'critical' : currentRack.temp >= thresholds.tempWarning ? 'warning' : 'normal'}
              icon={<Thermometer className="w-4 h-4 text-sky-400" />}
              size={240}
              zones={[
                { from: 15, to: 24, color: '#10b981' },
                { from: 24, to: thresholds.tempCritical, color: '#f59e0b' },
                { from: thresholds.tempCritical, to: 45, color: '#ef4444' },
              ]}
            />

            {/* Rack Exhaust Temp */}
            <RadialGauge
              value={currentRack.exhaustTemp}
              min={20}
              max={55}
              title={`Exhaust Air - ${currentRack.id}`}
              unit="°C"
              subtitle={`Delta T: +${rackDeltaT}°C`}
              status={currentRack.exhaustTemp >= 40 ? 'critical' : currentRack.exhaustTemp >= 32 ? 'warning' : 'normal'}
              icon={<Thermometer className="w-4 h-4 text-orange-400" />}
              size={240}
              zones={[
                { from: 20, to: 32, color: '#10b981' },
                { from: 32, to: 40, color: '#f59e0b' },
                { from: 40, to: 55, color: '#ef4444' },
              ]}
            />

            {/* Rack Smoke PPM */}
            <RadialGauge
              value={currentRack.smokePpm}
              min={0}
              max={500}
              title={`Sensor Asap - ${currentRack.id}`}
              unit="PPM"
              subtitle={currentRack.smokeTriggered ? 'BAHAYA KEBAKARAN' : 'Kondisi Aman'}
              status={currentRack.smokePpm >= thresholds.smokeCriticalPpm ? 'critical' : currentRack.smokePpm >= thresholds.smokeWarningPpm ? 'warning' : 'normal'}
              icon={<Flame className="w-4 h-4 text-red-400" />}
              size={240}
              zones={[
                { from: 0, to: 100, color: '#10b981' },
                { from: 100, to: thresholds.smokeWarningPpm, color: '#06b6d4' },
                { from: thresholds.smokeWarningPpm, to: thresholds.smokeCriticalPpm, color: '#f59e0b' },
                { from: thresholds.smokeCriticalPpm, to: 500, color: '#ef4444' },
              ]}
            />

            {/* Rack Power PDU */}
            <RadialGauge
              value={currentRack.powerKw}
              min={0}
              max={15}
              title={`Daya Rak - ${currentRack.id}`}
              unit="kW"
              subtitle={`Putaran Fan: ${currentRack.fanRpm} RPM`}
              status={currentRack.powerKw >= 9.5 ? 'critical' : currentRack.powerKw >= 7.5 ? 'warning' : 'normal'}
              icon={<Zap className="w-4 h-4 text-amber-400" />}
              size={240}
              zones={[
                { from: 0, to: 6.5, color: '#10b981' },
                { from: 6.5, to: 8.5, color: '#f59e0b' },
                { from: 8.5, to: 15, color: '#ef4444' },
              ]}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
