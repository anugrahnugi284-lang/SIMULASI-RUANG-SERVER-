import React, { useState } from 'react';
import { X, Send, MessageSquare, CheckCircle2, ShieldCheck } from 'lucide-react';
import { WebhookConfig, WebhookDispatch } from '../../types/monitoring';
import { soundManager } from '../../services/soundEffects';

interface WebhookModalProps {
  config: WebhookConfig;
  logs: WebhookDispatch[];
  isOpen: boolean;
  onClose: () => void;
  onUpdateConfig: (cfg: Partial<WebhookConfig>) => void;
  onSendTestDispatch: () => void;
}

export const WebhookModal: React.FC<WebhookModalProps> = ({
  config,
  logs,
  isOpen,
  onClose,
  onUpdateConfig,
  onSendTestDispatch,
}) => {
  if (!isOpen) return null;

  const [activePlatform, setActivePlatform] = useState<'all' | 'telegram' | 'whatsapp'>('all');

  const filteredLogs = logs.filter((log) => {
    if (activePlatform === 'all') return true;
    return log.platform === activePlatform;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-[#0f172a] border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl text-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-[#141d33] border-b border-slate-700/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Send className="w-5 h-5 text-sky-400" />
            <div>
              <h2 className="font-bold text-base text-white">Integrasi Webhook Peringatan Dini</h2>
              <p className="text-xs text-slate-400">Telegram Bot & WhatsApp On-Call Alert Gateway</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs">
          {/* Channel Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Telegram Channel */}
            <div className="bg-[#162032] border border-slate-800 p-3.5 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold">
                    TG
                  </div>
                  <span className="font-bold text-slate-200">Telegram Bot Alert</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.telegramEnabled}
                    onChange={(e) => onUpdateConfig({ telegramEnabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-700 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-sky-600"></div>
                </label>
              </div>
              <div className="text-[11px] text-slate-400 font-mono space-y-0.5">
                <div>Bot: <span className="text-sky-300">{config.telegramBotName}</span></div>
                <div>Target: <span className="text-slate-300">{config.telegramChatId}</span></div>
              </div>
            </div>

            {/* WhatsApp Channel */}
            <div className="bg-[#162032] border border-slate-800 p-3.5 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                    WA
                  </div>
                  <span className="font-bold text-slate-200">WhatsApp Gateway</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.whatsappEnabled}
                    onChange={(e) => onUpdateConfig({ whatsappEnabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-700 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>
              <div className="text-[11px] text-slate-400 font-mono space-y-0.5">
                <div>Gateway: <span className="text-emerald-300">WABA Cloud API</span></div>
                <div>Target: <span className="text-slate-300">{config.whatsappPhone}</span></div>
              </div>
            </div>
          </div>

          {/* Test Dispatch Button */}
          <div className="flex items-center justify-between bg-[#141d33] border border-slate-800 p-3 rounded-xl">
            <span className="text-slate-300 text-[11px]">
              Verifikasi jalur webhook dengan mengirim pesan uji simulasi:
            </span>
            <button
              onClick={() => {
                soundManager.playClick();
                onSendTestDispatch();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold transition-colors cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Kirim Test Alert</span>
            </button>
          </div>

          {/* Dispatch Logs */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400">
                Log Transmisi Webhook Terakhir ({filteredLogs.length})
              </h3>
              <div className="flex items-center gap-1 text-[11px]">
                <button
                  onClick={() => setActivePlatform('all')}
                  className={`px-2 py-0.5 rounded ${
                    activePlatform === 'all' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Semua
                </button>
                <button
                  onClick={() => setActivePlatform('telegram')}
                  className={`px-2 py-0.5 rounded ${
                    activePlatform === 'telegram' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Telegram
                </button>
                <button
                  onClick={() => setActivePlatform('whatsapp')}
                  className={`px-2 py-0.5 rounded ${
                    activePlatform === 'whatsapp' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  WhatsApp
                </button>
              </div>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {filteredLogs.length === 0 ? (
                <div className="text-center py-8 text-slate-500">Belum ada transmisi webhook.</div>
              ) : (
                filteredLogs.map((log) => (
                  <div
                    key={log.id}
                    className="bg-[#121824] border border-slate-800/80 p-2.5 rounded-lg text-xs"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-1.5 py-0.2 rounded text-[10px] font-bold uppercase ${
                            log.platform === 'telegram'
                              ? 'bg-sky-500/20 text-sky-400'
                              : 'bg-emerald-500/20 text-emerald-400'
                          }`}
                        >
                          {log.platform}
                        </span>
                        <span className="font-semibold text-slate-200">{log.payload.title}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-400 text-[10px]">
                        <span className="font-mono">{log.timestamp}</span>
                        <span className="flex items-center gap-0.5 text-emerald-400">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Terkirim</span>
                        </span>
                      </div>
                    </div>
                    <div className="text-[11px] text-slate-400 bg-slate-900/60 p-1.5 rounded font-mono">
                      {log.payload.details}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-[#141d33] border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
