import React from 'react';
import {
  X,
  Flame,
  AlertTriangle,
  RotateCcw,
  Fan,
  BellRing,
  Send,
  CheckCircle2,
  Play,
} from 'lucide-react';
import { soundManager } from '../../services/soundEffects';

interface IncidentDrillModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeScenario: string;
  onSelectScenario: (scenario: 'none' | 'overheat-b2' | 'smoke-a' | 'crac-fail') => void;
  onSendTestWebhook: () => void;
}

export const IncidentDrillModal: React.FC<IncidentDrillModalProps> = ({
  isOpen,
  onClose,
  activeScenario,
  onSelectScenario,
  onSendTestWebhook,
}) => {
  if (!isOpen) return null;

  const runScenario = (scenario: 'none' | 'overheat-b2' | 'smoke-a' | 'crac-fail') => {
    soundManager.playClick();
    onSelectScenario(scenario);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-[#0f172a] border border-slate-700 rounded-2xl w-full max-w-xl shadow-2xl text-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-[#141d33] border-b border-slate-700/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <BellRing className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="font-bold text-base text-white">Simulasi & Uji Coba Insiden Darurat</h2>
              <p className="text-xs text-slate-400">
                Uji reaksi Early Warning System, visual 3D, suara alarm, dan webhook
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scenarios */}
        <div className="p-6 space-y-3.5 text-xs">
          {/* Scenario 1: Overheat B2 */}
          <div
            className={`p-4 rounded-xl border transition-all ${
              activeScenario === 'overheat-b2'
                ? 'bg-amber-950/40 border-amber-500 shadow-lg'
                : 'bg-[#162032] border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 mt-0.5">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">1. Overheating Rak Komputasi B2</h3>
                  <p className="text-slate-400 text-xs mt-1">
                    Suhu inlet melonjak drastis hingga <strong>36.8°C</strong>. Memverifikasi lampu suar kuning/merah,
                    pemberitahuan threshold di HUD, dan alert ke Telegram/WhatsApp.
                  </p>
                </div>
              </div>

              <button
                onClick={() => runScenario('overheat-b2')}
                className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
                  activeScenario === 'overheat-b2'
                    ? 'bg-amber-600 text-white'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                }`}
              >
                <Play className="w-3.5 h-3.5" />
                <span>{activeScenario === 'overheat-b2' ? 'Sedang Aktif' : 'Jalankan'}</span>
              </button>
            </div>
          </div>

          {/* Scenario 2: Smoke Fire Zone A */}
          <div
            className={`p-4 rounded-xl border transition-all ${
              activeScenario === 'smoke-a'
                ? 'bg-red-950/40 border-red-500 shadow-lg'
                : 'bg-[#162032] border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-red-500/20 text-red-400 mt-0.5">
                  <Flame className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">2. Deteksi Asap / Api Plafon Zona A</h3>
                  <p className="text-slate-400 text-xs mt-1">
                    Sensor optik SD-01 mendeteksi partikel asap <strong>380 PPM</strong>. Memverifikasi efek kepulan asap
                    volumetrik 3D, sirene audio buzzer darurat, dan strobo merah.
                  </p>
                </div>
              </div>

              <button
                onClick={() => runScenario('smoke-a')}
                className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
                  activeScenario === 'smoke-a'
                    ? 'bg-red-600 text-white'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                }`}
              >
                <Play className="w-3.5 h-3.5" />
                <span>{activeScenario === 'smoke-a' ? 'Sedang Aktif' : 'Jalankan'}</span>
              </button>
            </div>
          </div>

          {/* Scenario 3: CRAC Failure */}
          <div
            className={`p-4 rounded-xl border transition-all ${
              activeScenario === 'crac-fail'
                ? 'bg-orange-950/40 border-orange-500 shadow-lg'
                : 'bg-[#162032] border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-orange-500/20 text-orange-400 mt-0.5">
                  <Fan className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">3. Kegagalan Kompresor Pendingin CRAC 01</h3>
                  <p className="text-slate-400 text-xs mt-1">
                    Kompresor mati, suhu suplai naik ke <strong>28.5°C</strong>, menyebabkan pemanasan lambat pada seluruh
                    lorong dingin.
                  </p>
                </div>
              </div>

              <button
                onClick={() => runScenario('crac-fail')}
                className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
                  activeScenario === 'crac-fail'
                    ? 'bg-orange-600 text-white'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                }`}
              >
                <Play className="w-3.5 h-3.5" />
                <span>{activeScenario === 'crac-fail' ? 'Sedang Aktif' : 'Jalankan'}</span>
              </button>
            </div>
          </div>

          {/* Scenario 4: Normal Reset */}
          <div className="bg-[#141d33] border border-slate-800 p-4 rounded-xl flex items-center justify-between">
            <div>
              <h4 className="font-bold text-white">Reset Semua Parameter Normal</h4>
              <p className="text-slate-400 text-[11px] mt-0.5">
                Menghentikan simulasi, mematikan alarm suara, dan mengembalikan suhu ke 20-23°C nominal.
              </p>
            </div>
            <button
              onClick={() => runScenario('none')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Normalisasi</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-[#141d33] border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={() => {
              soundManager.playClick();
              onSendTestWebhook();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-400 text-xs font-semibold transition-colors cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Kirim Test Webhook</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-xs font-semibold text-white transition-colors cursor-pointer"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
};
