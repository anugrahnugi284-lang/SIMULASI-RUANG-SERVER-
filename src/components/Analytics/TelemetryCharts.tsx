import React, { useState } from 'react';
import {
  Thermometer,
  Droplets,
  Flame,
  Zap,
  Activity,
  Layers,
  Download,
  Calendar,
  CheckCircle2,
} from 'lucide-react';
import { EnvironmentalHistoryPoint, RackData, ThresholdConfig } from '../../types/monitoring';

interface TelemetryChartsProps {
  history: EnvironmentalHistoryPoint[];
  racks: RackData[];
  thresholds: ThresholdConfig;
}

const RACK_COLORS: Record<string, string> = {
  A1: '#38bdf8', // sky
  A2: '#34d399', // emerald
  A3: '#818cf8', // indigo
  A4: '#f472b6', // pink
  B1: '#f59e0b', // amber
  B2: '#fb923c', // orange
  B3: '#a78bfa', // purple
  B4: '#2dd4bf', // teal
};

export const TelemetryCharts: React.FC<TelemetryChartsProps> = ({ history, racks, thresholds }) => {
  const [activeMetric, setActiveMetric] = useState<'temperature' | 'humidity' | 'smoke'>('temperature');
  const [selectedRacks, setSelectedRacks] = useState<string[]>(['A1', 'A2', 'B2', 'A4']);

  if (history.length < 2) {
    return (
      <div className="w-full h-full flex items-center justify-center text-slate-500 text-sm">
        Mengumpulkan data deret waktu telemetri...
      </div>
    );
  }

  const toggleRackFilter = (id: string) => {
    if (selectedRacks.includes(id)) {
      if (selectedRacks.length > 1) {
        setSelectedRacks(selectedRacks.filter((r) => r !== id));
      }
    } else {
      setSelectedRacks([...selectedRacks, id]);
    }
  };

  // Dimensions for SVG Charts
  const width = 800;
  const height = 280;
  const padLeft = 50;
  const padRight = 30;
  const padTop = 30;
  const padBottom = 40;
  const plotW = width - padLeft - padRight;
  const plotH = height - padTop - padBottom;

  // Temperature scales
  const minTemp = 16;
  const maxTemp = 40;
  const getYTemp = (v: number) => padTop + plotH - ((v - minTemp) / (maxTemp - minTemp)) * plotH;
  const getX = (i: number) => padLeft + (i / (history.length - 1)) * plotW;

  // Humidity scales
  const minHum = 20;
  const maxHum = 80;
  const getYHum = (v: number) => padTop + plotH - ((v - minHum) / (maxHum - minHum)) * plotH;

  // Smoke scales
  const minSmoke = 0;
  const maxSmoke = 500;
  const getYSmoke = (v: number) => padTop + plotH - ((v - minSmoke) / (maxSmoke - minSmoke)) * plotH;

  // Stat calculations
  const allTemps = racks.map((r) => r.temp);
  const minCurrentTemp = Math.min(...allTemps);
  const maxCurrentTemp = Math.max(...allTemps);
  const avgCurrentTemp = (allTemps.reduce((a, b) => a + b, 0) / allTemps.length).toFixed(1);
  const avgHum = (racks.reduce((a, b) => a + b.humidity, 0) / racks.length).toFixed(1);
  const maxSmokeCurrent = Math.max(...racks.map((r) => r.smokePpm));

  return (
    <div className="w-full h-full bg-[#0b0e14] text-slate-200 overflow-y-auto p-4 sm:p-6 space-y-6">
      {/* Top Banner & KPI Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Suhu Rata2 */}
        <div className="bg-[#121824] border border-slate-800 p-4 rounded-xl shadow">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Suhu Rata-rata Ruangan</span>
            <Thermometer className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">{avgCurrentTemp}°C</div>
          <div className="text-[11px] text-slate-400 mt-1 flex justify-between">
            <span>Min: {minCurrentTemp}°C</span>
            <span>Max: {maxCurrentTemp}°C</span>
          </div>
        </div>

        {/* Kelembaban */}
        <div className="bg-[#121824] border border-slate-800 p-4 rounded-xl shadow">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Kelembaban Rata-rata</span>
            <Droplets className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">{avgHum}% RH</div>
          <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>ASHRAE Envelope (40-60%)</span>
          </div>
        </div>

        {/* Sensor Asap */}
        <div
          className={`border p-4 rounded-xl shadow ${
            maxSmokeCurrent > 120
              ? 'bg-red-950/40 border-red-500/50 text-red-200'
              : 'bg-[#121824] border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between text-xs mb-1">
            <span className={maxSmokeCurrent > 120 ? 'text-red-300' : 'text-slate-400'}>
              Puncak Partikel Asap
            </span>
            <Flame className={`w-4 h-4 ${maxSmokeCurrent > 120 ? 'text-red-400' : 'text-slate-400'}`} />
          </div>
          <div
            className={`text-2xl font-bold font-mono ${
              maxSmokeCurrent > 120 ? 'text-red-400 animate-pulse' : 'text-white'
            }`}
          >
            {maxSmokeCurrent} PPM
          </div>
          <div className="text-[11px] mt-1">
            {maxSmokeCurrent > 240
              ? 'Kritis: Alarm Aktif'
              : maxSmokeCurrent > 120
              ? 'Peringatan Gas Terdeteksi'
              : 'Kondisi Udara Bersih'}
          </div>
        </div>

        {/* PUE & Total Power */}
        <div className="bg-[#121824] border border-slate-800 p-4 rounded-xl shadow">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Efisiensi Energi (PUE)</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">1.22</div>
          <div className="text-[11px] text-emerald-400 mt-1">Tier III Data Center Target: &lt;1.35</div>
        </div>
      </div>

      {/* Main Chart Container */}
      <div className="bg-[#121824] border border-slate-800 rounded-2xl p-5 shadow-lg">
        {/* Metric Selector Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-sky-400" />
            <div>
              <h2 className="font-bold text-sm text-white">Grafik Tren Waktu Nyata (Time-Series Telemetry)</h2>
              <p className="text-xs text-slate-400">Pembaruan telemetri streaming tiap 2 detik</p>
            </div>
          </div>

          <div className="flex items-center bg-[#1a2333] p-1 rounded-lg border border-slate-700 text-xs">
            <button
              onClick={() => setActiveMetric('temperature')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
                activeMetric === 'temperature' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Thermometer className="w-3.5 h-3.5" />
              <span>Suhu Rak (°C)</span>
            </button>

            <button
              onClick={() => setActiveMetric('humidity')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
                activeMetric === 'humidity' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Droplets className="w-3.5 h-3.5" />
              <span>Kelembaban (% RH)</span>
            </button>

            <button
              onClick={() => setActiveMetric('smoke')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
                activeMetric === 'smoke' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>Partikel Asap (PPM)</span>
            </button>
          </div>
        </div>

        {/* Rack Filters (When Temperature is active) */}
        {activeMetric === 'temperature' && (
          <div className="flex flex-wrap items-center gap-2 mb-4 text-xs">
            <span className="text-slate-400 font-semibold mr-1">Tampilkan Rak:</span>
            {['A1', 'A2', 'A3', 'A4', 'B1', 'B2', 'B3', 'B4'].map((id) => {
              const active = selectedRacks.includes(id);
              return (
                <button
                  key={id}
                  onClick={() => toggleRackFilter(id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-mono font-semibold transition-colors ${
                    active
                      ? 'bg-slate-800 text-white border-slate-600 shadow-xs'
                      : 'bg-transparent text-slate-500 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: active ? RACK_COLORS[id] : '#475569' }}
                  />
                  <span>{id}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* SVG Time-Series Chart */}
        <div className="w-full overflow-x-auto">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto max-h-[380px]">
            {/* Grid Lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
              const y = padTop + ratio * plotH;
              let label = '';
              if (activeMetric === 'temperature') {
                label = `${(maxTemp - ratio * (maxTemp - minTemp)).toFixed(0)}°C`;
              } else if (activeMetric === 'humidity') {
                label = `${(maxHum - ratio * (maxHum - minHum)).toFixed(0)}%`;
              } else {
                label = `${(maxSmoke - ratio * (maxSmoke - minSmoke)).toFixed(0)} PPM`;
              }
              return (
                <g key={ratio}>
                  <line
                    x1={padLeft}
                    y1={y}
                    x2={width - padRight}
                    y2={y}
                    stroke="#1e293b"
                    strokeDasharray="4 4"
                    strokeWidth="1"
                  />
                  <text
                    x={padLeft - 8}
                    y={y + 4}
                    fill="#64748b"
                    fontSize="10"
                    textAnchor="end"
                    fontFamily="monospace"
                  >
                    {label}
                  </text>
                </g>
              );
            })}

            {/* Threshold Reference Lines */}
            {activeMetric === 'temperature' && (
              <>
                {/* Warning Line (25°C) */}
                <line
                  x1={padLeft}
                  y1={getYTemp(thresholds.tempWarning)}
                  x2={width - padRight}
                  y2={getYTemp(thresholds.tempWarning)}
                  stroke="#f59e0b"
                  strokeWidth="1.5"
                  strokeDasharray="6 3"
                />
                <text
                  x={width - padRight - 5}
                  y={getYTemp(thresholds.tempWarning) - 6}
                  fill="#f59e0b"
                  fontSize="10"
                  textAnchor="end"
                  fontWeight="bold"
                >
                  Warning Threshold ({thresholds.tempWarning}°C)
                </text>

                {/* Critical Line (31°C) */}
                <line
                  x1={padLeft}
                  y1={getYTemp(thresholds.tempCritical)}
                  x2={width - padRight}
                  y2={getYTemp(thresholds.tempCritical)}
                  stroke="#ef4444"
                  strokeWidth="1.5"
                  strokeDasharray="6 3"
                />
                <text
                  x={width - padRight - 5}
                  y={getYTemp(thresholds.tempCritical) - 6}
                  fill="#ef4444"
                  fontSize="10"
                  textAnchor="end"
                  fontWeight="bold"
                >
                  Critical Overheat ({thresholds.tempCritical}°C)
                </text>
              </>
            )}

            {activeMetric === 'humidity' && (
              <>
                {/* ASHRAE Envelope Band (40% - 60% RH) */}
                <rect
                  x={padLeft}
                  y={getYHum(60)}
                  width={plotW}
                  height={getYHum(40) - getYHum(60)}
                  fill="#10b981"
                  fillOpacity="0.08"
                />
                <text
                  x={padLeft + 10}
                  y={getYHum(60) + 16}
                  fill="#10b981"
                  fontSize="10"
                  fontWeight="bold"
                >
                  ASHRAE TC 9.9 Recommended Envelope (40% - 60% RH)
                </text>
              </>
            )}

            {activeMetric === 'smoke' && (
              <>
                {/* Smoke Alarm Line */}
                <line
                  x1={padLeft}
                  y1={getYSmoke(thresholds.smokeCriticalPpm)}
                  x2={width - padRight}
                  y2={getYSmoke(thresholds.smokeCriticalPpm)}
                  stroke="#ef4444"
                  strokeWidth="1.5"
                  strokeDasharray="6 3"
                />
                <text
                  x={width - padRight - 5}
                  y={getYSmoke(thresholds.smokeCriticalPpm) - 6}
                  fill="#ef4444"
                  fontSize="10"
                  textAnchor="end"
                  fontWeight="bold"
                >
                  Fire Alarm Threshold ({thresholds.smokeCriticalPpm} PPM)
                </text>
              </>
            )}

            {/* Time X-axis Labels */}
            {history.map((pt, i) => {
              if (i % Math.ceil(history.length / 6) !== 0 && i !== history.length - 1) return null;
              return (
                <text
                  key={i}
                  x={getX(i)}
                  y={height - 12}
                  fill="#64748b"
                  fontSize="10"
                  textAnchor="middle"
                  fontFamily="monospace"
                >
                  {pt.timeFormatted}
                </text>
              );
            })}

            {/* Plot Lines */}
            {activeMetric === 'temperature' &&
              selectedRacks.map((rackId) => {
                const points = history
                  .map((h, i) => {
                    const temp = h.rackTemps[rackId] || 22;
                    return `${getX(i)},${getYTemp(temp)}`;
                  })
                  .join(' ');

                return (
                  <polyline
                    key={rackId}
                    fill="none"
                    stroke={RACK_COLORS[rackId] || '#38bdf8'}
                    strokeWidth="2.5"
                    points={points}
                  />
                );
              })}

            {activeMetric === 'humidity' && (
              <polyline
                fill="none"
                stroke="#06b6d4"
                strokeWidth="3"
                points={history.map((h, i) => `${getX(i)},${getYHum(h.humidityAvg)}`).join(' ')}
              />
            )}

            {activeMetric === 'smoke' && (
              <polyline
                fill="none"
                stroke="#ef4444"
                strokeWidth="3"
                points={history.map((h, i) => `${getX(i)},${getYSmoke(h.smokeMaxPpm)}`).join(' ')}
              />
            )}
          </svg>
        </div>
      </div>
    </div>
  );
};
