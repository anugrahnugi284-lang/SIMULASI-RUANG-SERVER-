import React, { useState } from 'react';
import {
  BookOpen,
  FileText,
  Target,
  Cpu,
  Layers,
  ShieldCheck,
  Activity,
  Download,
  Copy,
  Check,
  Languages,
  ExternalLink,
  ChevronRight,
  Search,
} from 'lucide-react';
import { PRD_SECTIONS, PRD_METADATA, PRDSection } from '../../data/prdDocument';
import { soundManager } from '../../services/soundEffects';

const ICONS: Record<string, React.ElementType> = {
  FileText,
  Target,
  Cpu,
  Layers,
  ShieldCheck,
  Activity,
};

export const PRDViewer: React.FC = () => {
  const [lang, setLang] = useState<'id' | 'en'>('id');
  const [activeSectionId, setActiveSectionId] = useState<string>(PRD_SECTIONS[0].id);
  const [copied, setCopied] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const activeSection = PRD_SECTIONS.find((s) => s.id === activeSectionId) || PRD_SECTIONS[0];

  const handleCopySection = () => {
    soundManager.playClick();
    const content = lang === 'id' ? activeSection.content : activeSection.contentEn;
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadFullDoc = () => {
    soundManager.playClick();
    const title = lang === 'id' ? PRD_METADATA.title : PRD_METADATA.titleEn;
    let fullDoc = `# ${title}\n\n`;
    fullDoc += `**Document Code:** ${PRD_METADATA.documentCode}\n`;
    fullDoc += `**Author:** ${PRD_METADATA.author}\n`;
    fullDoc += `**Status:** ${PRD_METADATA.status}\n`;
    fullDoc += `**Date:** ${PRD_METADATA.lastUpdated}\n\n---\n\n`;

    PRD_SECTIONS.forEach((sec) => {
      fullDoc += `## ${lang === 'id' ? sec.title : sec.titleEn}\n\n`;
      fullDoc += `${lang === 'id' ? sec.content : sec.contentEn}\n\n---\n\n`;
    });

    const blob = new Blob([fullDoc], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PRD-Sistem-Monitoring-Ruangan-Server-3D-${lang.toUpperCase()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const filteredSections = PRD_SECTIONS.filter((sec) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const title = (lang === 'id' ? sec.title : sec.titleEn).toLowerCase();
    const content = (lang === 'id' ? sec.content : sec.contentEn).toLowerCase();
    return title.includes(q) || content.includes(q);
  });

  return (
    <div className="w-full h-full bg-[#0b0e14] text-slate-200 overflow-hidden flex flex-col">
      {/* Top Bar */}
      <div className="bg-[#121824] border-b border-slate-800 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-white/10 border border-slate-700/80 p-1 flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
            <img
              src="https://upload.wikimedia.org/wikipedia/id/c/ca/Logo_Poltekbang_Makassar.png"
              alt="Logo Poltekbang Makassar"
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-base text-white">
                {lang === 'id' ? PRD_METADATA.title : PRD_METADATA.titleEn}
              </h1>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-800 text-sky-400 border border-slate-700">
                {PRD_METADATA.documentCode}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Politeknik Penerbangan Makassar • Penulis & Pengembang: <strong className="text-sky-300 font-semibold">MUH. ANUGRAH NASIR</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Language Switcher */}
          <div className="flex items-center bg-[#1a2333] p-1 rounded-lg border border-slate-700 text-xs">
            <button
              onClick={() => {
                soundManager.playClick();
                setLang('id');
              }}
              className={`px-3 py-1 rounded-md font-semibold transition-colors ${
                lang === 'id' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              Bahasa Indonesia
            </button>
            <button
              onClick={() => {
                soundManager.playClick();
                setLang('en');
              }}
              className={`px-3 py-1 rounded-md font-semibold transition-colors ${
                lang === 'en' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              English
            </button>
          </div>

          {/* Download Markdown */}
          <button
            onClick={handleDownloadFullDoc}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-xs font-semibold text-white shadow transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Unduh PRD (.md)</span>
          </button>
        </div>
      </div>

      {/* Main Split Layout: TOC Sidebar & Content Viewer */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar: Table of Contents */}
        <aside className="w-80 bg-[#0f1420] border-r border-slate-800 flex flex-col shrink-0">
          {/* Metadata Card */}
          <div className="p-4 border-b border-slate-800/80 bg-[#141b2b]/50 text-xs space-y-2">
            <div className="flex justify-between text-slate-400">
              <span>Status:</span>
              <span className="text-emerald-400 font-semibold">{PRD_METADATA.status}</span>
            </div>
            <div className="flex flex-col gap-0.5 text-slate-400">
              <span className="text-[11px]">Penyusun / Pengembang:</span>
              <span className="text-white font-semibold text-xs">{PRD_METADATA.author}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Platform 3D:</span>
              <span className="text-sky-300 font-mono text-[11px]">{PRD_METADATA.targetPlatform}</span>
            </div>
            <div className="pt-1 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
              <span>Google Docs Ref:</span>
              <span className="font-mono text-slate-400 truncate max-w-[130px]" title={PRD_METADATA.docReference}>
                drive-uploaded-file
              </span>
            </div>
          </div>

          {/* Search Section */}
          <div className="p-3 border-b border-slate-800">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Cari bagian PRD..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#182133] border border-slate-700/80 rounded-lg pl-8 pr-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Section Navigation List */}
          <nav className="flex-1 overflow-y-auto p-2 space-y-1">
            {filteredSections.map((sec) => {
              const IconComp = ICONS[sec.icon] || FileText;
              const isSelected = sec.id === activeSectionId;
              return (
                <button
                  key={sec.id}
                  onClick={() => {
                    soundManager.playClick();
                    setActiveSectionId(sec.id);
                  }}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-xs transition-all flex items-start gap-3 cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/40 font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  <IconComp className={`w-4 h-4 mt-0.5 shrink-0 ${isSelected ? 'text-emerald-400' : 'text-slate-500'}`} />
                  <div className="flex-1">
                    <div className="line-clamp-1">{lang === 'id' ? sec.title : sec.titleEn}</div>
                    <div className="text-[11px] font-normal text-slate-400 line-clamp-1 mt-0.5">
                      {lang === 'id' ? sec.summary : sec.summaryEn}
                    </div>
                  </div>
                  {isSelected && <ChevronRight className="w-4 h-4 text-emerald-400 shrink-0 self-center" />}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Right Area: Document Reader */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-10 bg-[#0b0e14]">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Active Section Header */}
            <div className="bg-[#121824] border border-slate-800 p-6 rounded-2xl shadow-lg flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-400">
                  {PRD_METADATA.documentCode} • Section {PRD_SECTIONS.findIndex((s) => s.id === activeSection.id) + 1}
                </span>
                <h2 className="text-xl font-bold text-white mt-1">
                  {lang === 'id' ? activeSection.title : activeSection.titleEn}
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  {lang === 'id' ? activeSection.summary : activeSection.summaryEn}
                </p>
              </div>

              <button
                onClick={handleCopySection}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Tersalin!' : 'Salin Markdown'}</span>
              </button>
            </div>

            {/* Markdown Rendered Content */}
            <div className="bg-[#121824] border border-slate-800 p-6 lg:p-8 rounded-2xl shadow-lg text-slate-200 text-sm leading-relaxed prose prose-invert max-w-none">
              <div
                dangerouslySetInnerHTML={{
                  __html: formatMarkdown(lang === 'id' ? activeSection.content : activeSection.contentEn),
                }}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

/**
 * Clean procedural markdown-to-HTML parser for PRD reading
 */
function formatMarkdown(text: string): string {
  let html = text
    // Code blocks with syntax ASCII borders
    .replace(/```([\s\S]*?)```/g, '<pre class="bg-[#090d14] border border-slate-800 p-4 rounded-xl font-mono text-xs text-emerald-300 overflow-x-auto my-4"><code>$1</code></pre>')
    // Inline code
    .replace(/`([^`]+)`/g, '<code class="bg-slate-800 text-sky-300 px-1.5 py-0.5 rounded font-mono text-xs">$1</code>')
    // Headings
    .replace(/^### (.*$)/gim, '<h3 class="text-base font-bold text-white mt-6 mb-2 border-b border-slate-800 pb-1">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="text-lg font-bold text-white mt-8 mb-3">$1</h2>')
    // Bold
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-white">$1</strong>')
    // Italic
    .replace(/\*(.*?)\*/g, '<em class="italic text-slate-300">$1</em>')
    // Bullet lists
    .replace(/^\s*-\s+(.*$)/gim, '<li class="ml-4 list-disc text-slate-300 my-1">$1</li>')
    // Numbered lists
    .replace(/^\s*\d+\.\s+(.*$)/gim, '<li class="ml-4 list-decimal text-slate-300 my-1">$1</li>')
    // Paragraph breaks
    .replace(/\n\n/g, '<p class="my-3 text-slate-300 leading-relaxed"></p>');

  return html;
}
