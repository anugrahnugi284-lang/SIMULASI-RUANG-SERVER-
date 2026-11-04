import React from 'react';
import { AlertTriangle, Flame, CheckCircle, ShieldAlert, Send } from 'lucide-react';
import { AlertEvent } from '../../types/monitoring';

interface AlertBannerProps {
  alerts: AlertEvent[];
  onAcknowledge: (id: string) => void;
  onResolve: (id: string) => void;
  onSelectRack?: (rackId: string) => void;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({
  alerts,
  onAcknowledge,
  onResolve,
  onSelectRack,
}) => {
  // Only display unresolved alerts
  const activeAlerts = alerts.filter((a) => !a.resolved);
  if (activeAlerts.length === 0) return null;

  // Prioritize critical alert first
  const current = activeAlerts[0];

  return (
    <div
      className={`w-full px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-3 border-b shadow-lg transition-all ${
        current.severity === 'critical'
          ? 'bg-red-950/90 border-red-800 text-red-200'
          : 'bg-amber-950/90 border-amber-800 text-amber-200'
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`p-1.5 rounded-md ${
            current.severity === 'critical' ? 'bg-red-900/60 text-red-300' : 'bg-amber-900/60 text-amber-300'
          }`}
        >
          {current.type === 'smoke' ? (
            <Flame className="w-4 h-4 animate-bounce" />
          ) : current.severity === 'critical' ? (
            <ShieldAlert className="w-4 h-4 animate-pulse" />
          ) : (
            <AlertTriangle className="w-4 h-4" />
          )}
        </div>

        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold tracking-wide uppercase">
              [{current.severity}] {current.sourceName}
            </span>
            <span className="text-[10px] opacity-75 font-mono">{current.timestamp}</span>
            {current.dispatchedToWebhook && (
              <span className="flex items-center gap-1 text-[10px] bg-slate-800/80 px-1.5 py-0.5 rounded text-sky-300 border border-slate-700">
                <Send className="w-2.5 h-2.5" />
                <span>Webhook Telegram & WA Terkirim</span>
              </span>
            )}
          </div>
          <p className="text-[11px] opacity-90">{current.message}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {onSelectRack && current.sourceId.length <= 3 && (
          <button
            onClick={() => onSelectRack(current.sourceId)}
            className="px-2.5 py-1 rounded bg-slate-900/80 hover:bg-slate-800 text-[11px] font-semibold text-slate-200 border border-slate-700 transition-colors cursor-pointer"
          >
            Fokus ke {current.sourceId}
          </button>
        )}

        {!current.acknowledged ? (
          <button
            onClick={() => onAcknowledge(current.id)}
            className="px-3 py-1 rounded bg-amber-600 hover:bg-amber-500 text-[11px] font-semibold text-white shadow transition-colors cursor-pointer"
          >
            Acknowledge (Terima)
          </button>
        ) : (
          <span className="text-[11px] font-medium text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
            Diinvestigasi Petugas
          </span>
        )}

        <button
          onClick={() => onResolve(current.id)}
          className="flex items-center gap-1 px-3 py-1 rounded bg-emerald-700 hover:bg-emerald-600 text-[11px] font-semibold text-white shadow transition-colors cursor-pointer"
        >
          <CheckCircle className="w-3.5 h-3.5" />
          <span>Resolve (Selesai)</span>
        </button>

        {activeAlerts.length > 1 && (
          <span className="text-[10px] text-slate-400 font-mono ml-1">
            +{activeAlerts.length - 1} insiden lainnya
          </span>
        )}
      </div>
    </div>
  );
};
