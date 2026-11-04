import React, { useState } from 'react';
import {
  ListFilter,
  Search,
  Download,
  AlertTriangle,
  Flame,
  CheckCircle2,
  Trash2,
  Send,
  Info,
  ShieldAlert,
} from 'lucide-react';
import { AlertEvent } from '../../types/monitoring';
import { soundManager } from '../../services/soundEffects';

interface EventLogViewProps {
  alerts: AlertEvent[];
  onAcknowledge: (id: string) => void;
  onResolve: (id: string) => void;
  onClearResolved: () => void;
  onSelectRack?: (id: string) => void;
}

export const EventLogView: React.FC<EventLogViewProps> = ({
  alerts,
  onAcknowledge,
  onResolve,
  onClearResolved,
  onSelectRack,
}) => {
  const [search, setSearch] = useState<string>('');
  const [severityFilter, setSeverityFilter] = useState<'all' | 'critical' | 'warning' | 'info'>('all');

  const filteredAlerts = alerts.filter((item) => {
    if (severityFilter !== 'all' && item.severity !== severityFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        item.message.toLowerCase().includes(q) ||
        item.sourceName.toLowerCase().includes(q) ||
        item.sourceId.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const exportCSV = () => {
    soundManager.playClick();
    const headers = ['ID', 'Waktu', 'Tingkat', 'Tipe', 'Sumber', 'Pesan', 'Nilai', 'Status'];
    const rows = alerts.map((a) => [
      a.id,
      a.timestamp,
      a.severity.toUpperCase(),
      a.type,
      `"${a.sourceName.replace(/"/g, '""')}"`,
      `"${a.message.replace(/"/g, '""')}"`,
      `"${a.value}"`,
      a.resolved ? 'RESOLVED' : a.acknowledged ? 'ACKNOWLEDGED' : 'OPEN',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `server-room-alerts-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full h-full bg-[#0b0e14] text-slate-200 overflow-y-auto p-4 sm:p-6 space-y-5">
      {/* Top Bar with Search & Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#121824] border border-slate-800 p-4 rounded-xl shadow">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400">
            <ListFilter className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-base text-white">Log Kejadian & Riwayat Peringatan Dini</h2>
            <p className="text-xs text-slate-400">
              Audit trail peristiwa suhu, kelembaban, dan sensor asap ruang server
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Search box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cari sumber atau insiden..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-[#1a2333] border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-sky-500 w-56"
            />
          </div>

          {/* Severity selector */}
          <div className="flex items-center bg-[#1a2333] p-1 rounded-lg border border-slate-700 text-xs">
            <button
              onClick={() => setSeverityFilter('all')}
              className={`px-2.5 py-1 rounded transition-colors ${
                severityFilter === 'all' ? 'bg-sky-600 text-white font-medium' : 'text-slate-400 hover:text-white'
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => setSeverityFilter('critical')}
              className={`px-2.5 py-1 rounded transition-colors ${
                severityFilter === 'critical' ? 'bg-red-600 text-white font-medium' : 'text-slate-400 hover:text-white'
              }`}
            >
              Kritis
            </button>
            <button
              onClick={() => setSeverityFilter('warning')}
              className={`px-2.5 py-1 rounded transition-colors ${
                severityFilter === 'warning' ? 'bg-amber-600 text-white font-medium' : 'text-slate-400 hover:text-white'
              }`}
            >
              Peringatan
            </button>
            <button
              onClick={() => setSeverityFilter('info')}
              className={`px-2.5 py-1 rounded transition-colors ${
                severityFilter === 'info' ? 'bg-slate-700 text-white font-medium' : 'text-slate-400 hover:text-white'
              }`}
            >
              Info
            </button>
          </div>

          {/* Export CSV */}
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-white transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Ekspor CSV</span>
          </button>

          {/* Clear resolved */}
          <button
            onClick={onClearResolved}
            title="Bersihkan insiden yang telah diselesaikan"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-[#121824] border border-slate-800 rounded-xl overflow-hidden shadow">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#162032] border-b border-slate-800 text-slate-400 uppercase font-semibold text-[10px] tracking-wider">
                <th className="px-4 py-3">Waktu</th>
                <th className="px-4 py-3">Tingkat</th>
                <th className="px-4 py-3">Sumber / Lokasi</th>
                <th className="px-4 py-3">Rincian Peristiwa</th>
                <th className="px-4 py-3">Nilai Baca</th>
                <th className="px-4 py-3">Webhook</th>
                <th className="px-4 py-3 text-right">Tindakan Petugas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {filteredAlerts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500 italic">
                    Tidak ada catatan insiden yang sesuai kriteria pencarian.
                  </td>
                </tr>
              ) : (
                filteredAlerts.map((alert) => (
                  <tr key={alert.id} className="hover:bg-slate-800/30 transition-colors">
                    {/* Timestamp */}
                    <td className="px-4 py-3 font-mono text-slate-400 whitespace-nowrap">
                      {alert.timestamp}
                    </td>

                    {/* Severity */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          alert.severity === 'critical'
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : alert.severity === 'warning'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-slate-700 text-slate-300'
                        }`}
                      >
                        {alert.type === 'smoke' ? (
                          <Flame className="w-2.5 h-2.5" />
                        ) : alert.severity === 'critical' ? (
                          <ShieldAlert className="w-2.5 h-2.5" />
                        ) : alert.severity === 'warning' ? (
                          <AlertTriangle className="w-2.5 h-2.5" />
                        ) : (
                          <Info className="w-2.5 h-2.5" />
                        )}
                        <span>{alert.severity}</span>
                      </span>
                    </td>

                    {/* Source */}
                    <td className="px-4 py-3 font-semibold text-white whitespace-nowrap">
                      {alert.sourceName}
                    </td>

                    {/* Message */}
                    <td className="px-4 py-3 text-slate-300 max-w-md">
                      {alert.message}
                    </td>

                    {/* Value */}
                    <td className="px-4 py-3 font-mono font-bold text-slate-200 whitespace-nowrap">
                      {alert.value}
                    </td>

                    {/* Webhook delivery */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      {alert.dispatchedToWebhook ? (
                        <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                          <Send className="w-2.5 h-2.5" />
                          <span>Delivered</span>
                        </span>
                      ) : (
                        <span className="text-slate-500">-</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        {alert.resolved ? (
                          <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Resolved</span>
                          </span>
                        ) : (
                          <>
                            {!alert.acknowledged && (
                              <button
                                onClick={() => onAcknowledge(alert.id)}
                                className="px-2 py-1 rounded bg-amber-600/80 hover:bg-amber-600 text-[11px] font-semibold text-white transition-colors cursor-pointer"
                              >
                                Acknowledge
                              </button>
                            )}
                            <button
                              onClick={() => onResolve(alert.id)}
                              className="px-2.5 py-1 rounded bg-emerald-700 hover:bg-emerald-600 text-[11px] font-semibold text-white transition-colors cursor-pointer"
                            >
                              Resolve
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
