import React, { useState, useEffect } from 'react';
import {
  Server,
  Thermometer,
  Droplets,
  Flame,
  Volume2,
  VolumeX,
  Sliders,
  Bell,
  Send,
  Zap,
  BookOpen,
  LineChart,
  ListFilter,
  Layers,
  Gauge,
} from 'lucide-react';
import { RackData, CRACUnitData, SmokeDetectorData, AlertEvent } from '../../types/monitoring';
import { soundManager } from '../../services/soundEffects';

interface TopHeaderProps {
  racks: RackData[];
  cracs: CRACUnitData[];
  smokeDetectors: SmokeDetectorData[];
  alerts: AlertEvent[];
  activeTab: '3d' | 'gauges' | 'analytics' | 'logs' | 'prd';
  setActiveTab: (tab: '3d' | 'gauges' | 'analytics' | 'logs' | 'prd') => void;
  onOpenThresholds: () => void;
  onOpenWebhooks: () => void;
  onOpenDrills: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  racks,
  cracs,
  smokeDetectors,
  alerts,
  activeTab,
  setActiveTab,
  onOpenThresholds,
  onOpenWebhooks,
  onOpenDrills,
}) => {
  const [isMuted, setIsMuted] = useState<boolean>(soundManager.getMuted());
  const [timeStr, setTimeStr] = useState<string>('');
  const [logoError, setLogoError] = useState<boolean>(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleSound = () => {
    const next = !isMuted;
    setIsMuted(next);
    soundManager.setMuted(next);
    if (!next) soundManager.playClick();
  };

  // Metrics calculation
  const avgTemp = racks.length ? (racks.reduce((acc, r) => acc + r.temp, 0) / racks.length).toFixed(1) : '0';
  const avgHum = racks.length ? (racks.reduce((acc, r) => acc + r.humidity, 0) / racks.length).toFixed(1) : '0';
  const maxSmoke = Math.max(...racks.map((r) => r.smokePpm), ...smokeDetectors.map((s) => s.ppm));
  const totalPower = racks.reduce((acc, r) => acc + r.powerKw, 0).toFixed(1);

  // Overall system health status
  const unackCriticalCount = alerts.filter((a) => !a.resolved && a.severity === 'critical').length;
  const unackWarningCount = alerts.filter((a) => !a.resolved && a.severity === 'warning').length;

  let healthStatus: 'NORMAL' | 'WARNING' | 'CRITICAL' = 'NORMAL';
  if (unackCriticalCount > 0) healthStatus = 'CRITICAL';
  else if (unackWarningCount > 0) healthStatus = 'WARNING';

  return (
    <header className="w-full bg-[#0d1117] border-b border-slate-800 text-slate-200 px-4 py-2.5 z-30 flex flex-wrap items-center justify-between gap-3 shadow-md">
      {/* Brand & System Title with Poltekbang Makassar Logo */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-white/10 border border-slate-700/80 p-1 flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
          {!logoError ? (
            <img
              src="https://upload.wikimedia.org/wikipedia/id/c/ca/Logo_Poltekbang_Makassar.png"
              alt="Logo Poltekbang Makassar"
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
              onError={() => setLogoError(true)}
            />
          ) : (
            <Server className="w-5 h-5 text-emerald-400" />
          )}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-sm tracking-wide text-white">DataCenter Poltekbang Makassar</h1>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded tracking-wider uppercase ${
                healthStatus === 'CRITICAL'
                  ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                  : healthStatus === 'WARNING'
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                  : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
              }`}
            >
              {healthStatus === 'CRITICAL' ? 'CRITICAL ALERT' : healthStatus === 'WARNING' ? 'WARNING' : 'HEALTHY'}
            </span>
          </div>
          <p className="text-[11px] text-slate-400">Sistem Monitoring Ruangan Server 3D (Suhu, Kelembaban, Deteksi Asap)</p>
        </div>
      </div>

      {/* Real-time Environmental Telemetry Badges */}
      <div className="hidden lg:flex items-center gap-4 bg-[#161b22] px-3.5 py-1.5 rounded-lg border border-slate-800 text-xs">
        {/* Suhu */}
        <div className="flex items-center gap-1.5">
          <Thermometer className="w-4 h-4 text-sky-400" />
          <span className="text-slate-400">Suhu Rata2:</span>
          <span className="font-mono font-bold text-white">{avgTemp}°C</span>
          <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1 rounded">ASHRAE</span>
        </div>

        <div className="h-4 w-px bg-slate-700" />

        {/* Kelembaban */}
        <div className="flex items-center gap-1.5">
          <Droplets className="w-4 h-4 text-cyan-400" />
          <span className="text-slate-400">Kelembaban:</span>
          <span className="font-mono font-bold text-white">{avgHum}% RH</span>
        </div>

        <div className="h-4 w-px bg-slate-700" />

        {/* Deteksi Asap */}
        <div className="flex items-center gap-1.5">
          <Flame className={`w-4 h-4 ${maxSmoke > 120 ? 'text-red-400 animate-bounce' : 'text-slate-400'}`} />
          <span className="text-slate-400">Partikel Asap:</span>
          <span className={`font-mono font-bold ${maxSmoke > 120 ? 'text-red-400' : 'text-white'}`}>
            {maxSmoke} PPM
          </span>
        </div>

        <div className="h-4 w-px bg-slate-700" />

        {/* Daya & PUE */}
        <div className="flex items-center gap-1.5">
          <Zap className="w-4 h-4 text-amber-400" />
          <span className="text-slate-400">Beban Daya:</span>
          <span className="font-mono font-bold text-white">{totalPower} kW</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav className="flex items-center bg-[#161b22] p-1 rounded-lg border border-slate-800 text-xs">
        <button
          onClick={() => {
            soundManager.playClick();
            setActiveTab('3d');
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
            activeTab === '3d' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>3D Twin</span>
        </button>

        <button
          onClick={() => {
            soundManager.playClick();
            setActiveTab('gauges');
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
            activeTab === 'gauges' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Gauge className="w-3.5 h-3.5" />
          <span>Gauges</span>
        </button>

        <button
          onClick={() => {
            soundManager.playClick();
            setActiveTab('analytics');
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
            activeTab === 'analytics' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          <LineChart className="w-3.5 h-3.5" />
          <span>Analitik Tren</span>
        </button>

        <button
          onClick={() => {
            soundManager.playClick();
            setActiveTab('logs');
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors relative ${
            activeTab === 'logs' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          <ListFilter className="w-3.5 h-3.5" />
          <span>Event Log</span>
          {unackCriticalCount + unackWarningCount > 0 && (
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-red-500 text-white">
              {unackCriticalCount + unackWarningCount}
            </span>
          )}
        </button>

        <button
          onClick={() => {
            soundManager.playClick();
            setActiveTab('prd');
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
            activeTab === 'prd'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-emerald-400 hover:text-emerald-300'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Dokumen PRD</span>
        </button>
      </nav>

      {/* Quick Action Tools */}
      <div className="flex items-center gap-2">
        {/* Incident Drill Sandbox Trigger */}
        <button
          onClick={onOpenDrills}
          title="Uji Coba Insiden Darurat"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30 hover:bg-amber-500/25 transition-colors"
        >
          <Bell className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Uji Simulasi</span>
        </button>

        {/* Webhooks Logs Button */}
        <button
          onClick={onOpenWebhooks}
          title="Webhook Dispatch Gateway (Telegram / WhatsApp)"
          className="p-1.5 rounded-lg bg-[#161b22] border border-slate-700 text-slate-300 hover:text-sky-400 hover:border-slate-600 transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>

        {/* Threshold Configuration Button */}
        <button
          onClick={onOpenThresholds}
          title="Konfigurasi Ambang Batas Sensor"
          className="p-1.5 rounded-lg bg-[#161b22] border border-slate-700 text-slate-300 hover:text-sky-400 hover:border-slate-600 transition-colors"
        >
          <Sliders className="w-4 h-4" />
        </button>

        {/* Sound Alarm Mute / Unmute */}
        <button
          onClick={toggleSound}
          title={isMuted ? 'Nyalakan Suara Alarm' : 'Senyapkan Suara Alarm'}
          className={`p-1.5 rounded-lg border transition-colors ${
            isMuted
              ? 'bg-slate-800 border-slate-700 text-slate-500'
              : 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
          }`}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>

        {/* Live Clock */}
        <div className="hidden xl:block font-mono text-xs text-slate-400 pl-1 border-l border-slate-800">
          {timeStr}
        </div>
      </div>
    </header>
  );
};
