import React, { useState } from 'react';
import { ProductionPlan, AppState } from '../types';
import { Flow } from 'flow-sdk';
import { Language, translations } from '../lib/i18n';

interface Props {
  plan: ProductionPlan;
  appState: AppState;
  onClose: () => void;
  lang: Language;
}

export const ExportModal: React.FC<Props> = ({ plan, appState, onClose, lang }) => {
  const [isExporting, setIsExporting] = useState(false);
  const t = translations[lang];

  const exportCSV = async () => {
    const escapeCsv = (str: string | undefined | null) => `"${(str || '').replace(/"/g, '""')}"`;
    let csvContent = "Shot,Type,Description,Dialog,Cue,Timing\n";
    plan.shots.forEach((shot, i) => {
      csvContent += `${i + 1},${escapeCsv(shot.type)},${escapeCsv(shot.description)},${escapeCsv(shot.dialog)},${escapeCsv(shot.visualCue)},${escapeCsv(shot.timing)}\n`;
    });
    const base64 = btoa(unescape(encodeURIComponent(csvContent)));
    await Flow.download({
      base64,
      mimeType: 'text/csv',
      filename: `OmniScript_${plan.title.replace(/\s/g, '_')}_Shotlist.csv`
    });
  };

  const exportGridStoryboard = async () => {
    setIsExporting(true);
    const canvas = document.createElement('canvas');
    const cols = 3;
    const rows = Math.ceil(plan.shots.length / cols);
    const shotWidth = 400;
    const shotHeight = appState.settings.aspectRatio === '9:16' ? 711 : 225;
    const padding = 20;

    canvas.width = cols * shotWidth + (cols + 1) * padding;
    canvas.height = rows * shotHeight + (rows + 1) * padding + 100;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#0a0a0c';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText(plan.title.toUpperCase(), padding, 50);
    ctx.font = '14px sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.fillText(`STORYBOARD GRID / ASPECT: ${appState.settings.aspectRatio} / ${plan.shots.length} SHOTS`, padding, 80);

    for (let i = 0; i < plan.shots.length; i++) {
      const shot = plan.shots[i];
      if (!shot.renderedImage) continue;
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = padding + col * (shotWidth + padding);
      const y = 120 + row * (shotHeight + padding);
      const img = new Image();
      img.src = `data:${shot.renderedImage.mimeType};base64,${shot.renderedImage.base64}`;
      await new Promise(r => img.onload = r);
      ctx.drawImage(img, x, y, shotWidth, shotHeight);
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(x, y + shotHeight - 30, shotWidth, 30);
      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText(`${t.shot.toUpperCase()} ${(i+1).toString().padStart(2, '0')} - ${shot.type.toUpperCase()}`, x + 10, y + shotHeight - 10);
    }

    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    const base64 = dataUrl.split(',')[1];
    await Flow.download({ base64, mimeType: 'image/jpeg', filename: `Storyboard_${plan.title}.jpg` });
    setIsExporting(false);
  };

  const exportAnimatic = async () => {
    setIsExporting(true);
    try {
      const firstShot = plan.shots.find(s => s.renderedImage);
      if (!firstShot) {
        alert(lang === 'vi' ? "Vui lòng render ít nhất một cảnh trước." : "Render at least one shot first.");
        setIsExporting(false);
        return;
      }
      const video = await Flow.generate.video({
        prompt: `${firstShot.description}. Cinematic.`,
        firstFrameImageMediaId: firstShot.renderedImage?.mediaId,
        modelDisplayName: 'Omni 1.1 Flash',
        aspectRatio: appState.settings.aspectRatio,
        durationSeconds: 4
      });
      await Flow.download({ base64: video.base64, mimeType: video.mimeType, filename: `Animatic_${plan.title}.mp4` });
    } catch (err) {
      console.error(err);
      alert(lang === 'vi' ? "Tạo video nháp (Animatic) thất bại. Vui lòng thử lại." : "Failed to generate animatic video. Please try again.");
    }
    setIsExporting(false);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <div className="max-w-md w-full bg-[#121218] border border-slate-800 rounded-2xl p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">{t.export}</h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-800 rounded text-slate-500">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="space-y-3">
          <button onClick={exportCSV} className="w-full p-4 bg-[#1c1c24] hover:bg-slate-800 border border-slate-700 rounded-xl flex items-center gap-4 transition-colors text-left">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center"><span className="material-symbols-outlined text-emerald-500">table_chart</span></div>
            <div><p className="text-sm font-bold text-slate-200">{t.exportCSV}</p></div>
          </button>
          <button onClick={exportGridStoryboard} disabled={isExporting} className="w-full p-4 bg-[#1c1c24] hover:bg-slate-800 border border-slate-700 rounded-xl flex items-center gap-4 transition-colors text-left disabled:opacity-50">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center"><span className="material-symbols-outlined text-amber-500">grid_view</span></div>
            <div><p className="text-sm font-bold text-slate-200">{t.exportGrid}</p></div>
          </button>
          <button onClick={exportAnimatic} disabled={isExporting} className="w-full p-4 bg-[#1c1c24] hover:bg-slate-800 border border-slate-700 rounded-xl flex items-center gap-4 transition-colors text-left disabled:opacity-50">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center"><span className="material-symbols-outlined text-indigo-500">play_circle</span></div>
            <div><p className="text-sm font-bold text-slate-200">{t.exportAnimatic}</p></div>
          </button>
        </div>
        {isExporting ? (
          <div className="mt-6"><div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-amber-500 animate-pulse w-2/3"></div></div><p className="text-[10px] text-center text-slate-500 mt-2 uppercase font-mono tracking-widest">{t.processing}</p></div>
        ) : (
          <button onClick={onClose} className="w-full mt-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-sm transition-all">{t.return}</button>
        )}
      </div>
    </div>
  );
};
