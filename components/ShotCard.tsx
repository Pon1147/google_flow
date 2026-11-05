import React, { useState } from 'react';
import { Shot } from '../types';
import { Flow } from 'flow-sdk';

interface Props {
  index: number;
  shot: Shot;
  onUpdate: (id: string, updates: Partial<Shot>) => void;
  onRemove: () => void;
  onRender: () => void;
  aspectRatio: '16:9' | '9:16' | '1:1';
  t: any;
  onOpenUpscale?: () => void;
}

export const ShotCard: React.FC<Props> = ({
  index,
  shot,
  onUpdate,
  onRemove,
  onRender,
  aspectRatio,
  t,
  onOpenUpscale
}) => {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleRender = async () => {
    setLoading(true);
    setProgress(0);
    
    // Simulate progress
    const interval = setInterval(() => {
      setProgress(p => {
        if (p < 40) return p + Math.floor(Math.random() * 5);
        if (p < 85) return p + Math.floor(Math.random() * 2);
        if (p < 99) return p + 1;
        return p;
      });
    }, 150);

    try {
      await onRender();
      setProgress(100);
    } catch (err) {
      console.error(err);
    } finally {
      clearInterval(interval);
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!shot.renderedImage) return;
    const is4kSuffix = shot.renderedImage.is4k ? '_4K' : '';
    await Flow.download({
      base64: shot.renderedImage.base64,
      mimeType: shot.renderedImage.mimeType,
      filename: `Shot_${index}_${shot.type.replace(/\s/g, '_')}${is4kSuffix}.png`
    });
  };

  const ratioClass = aspectRatio === '9:16' ? 'aspect-[9/16]' : aspectRatio === '1:1' ? 'aspect-square' : 'aspect-video';

  return (
    <div className="group relative bg-[#121218] border border-slate-800 rounded-2xl overflow-hidden shadow-xl hover:border-slate-700 transition-all">
      <div className="flex flex-col lg:flex-row">
        <div className={`lg:w-1/2 bg-black flex items-center justify-center relative overflow-hidden ${ratioClass}`}>
          {shot.renderedImage ? (
            <img src={`data:${shot.renderedImage.mimeType};base64,${shot.renderedImage.base64}`} className="w-full h-full object-cover" />
          ) : (
            <div className="flex flex-col items-center gap-4">
              <span className="material-symbols-outlined text-slate-800 text-6xl">image_not_supported</span>
            </div>
          )}

          {/* Loading Overlay */}
          {loading && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center z-10">
              <div className="relative w-16 h-16 mb-4">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  <circle className="text-slate-800 stroke-current" strokeWidth="8" fill="transparent" r="40" cx="50" cy="50" />
                  <circle 
                    className="text-amber-500 stroke-current transition-all duration-300 ease-out" 
                    strokeWidth="8" 
                    strokeDasharray={251.2} 
                    strokeDashoffset={251.2 - (251.2 * progress) / 100}
                    strokeLinecap="round" 
                    fill="transparent" 
                    r="40" cx="50" cy="50" 
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-[10px] font-mono text-white font-bold">
                  {progress}%
                </div>
              </div>
              <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest animate-pulse">{t.rendering}</span>
            </div>
          )}
          
          <div className="absolute top-4 left-4 flex items-center gap-2 z-20">
            <span className="px-2 py-1 bg-black/60 backdrop-blur-md rounded text-[10px] font-mono text-amber-500 border border-white/10 uppercase tracking-tighter">
              {t.shot} {index.toString().padStart(2, '0')}
            </span>
            {shot.renderedImage?.is4k && (
              <span className="px-2 py-1 bg-amber-500/20 border border-amber-500/40 text-amber-400 rounded text-[9px] font-black uppercase tracking-wider flex items-center gap-1 backdrop-blur-md">
                <span className="material-symbols-outlined text-[11px]">hd</span>
                {t.badge4k}
              </span>
            )}
          </div>

          <div className="absolute top-4 right-4 flex items-center gap-2 z-20">
            {shot.renderedImage && onOpenUpscale && (
              <button 
                onClick={onOpenUpscale}
                className="px-2.5 py-1 bg-black/60 hover:bg-amber-600/80 backdrop-blur-md rounded text-[9px] font-mono text-slate-300 hover:text-white border border-white/10 flex items-center gap-1 transition-all shadow-md active:scale-95"
                title={t.upscale4k}
              >
                <span className="material-symbols-outlined text-[12px]">open_in_new</span>
                <span>{shot.renderedImage.is4k ? '4K Flow' : t.upscale4k}</span>
              </button>
            )}
          </div>

          <div className="absolute bottom-4 right-4 flex gap-2 z-20">
            {!loading && (
              <>
                <button 
                  onClick={handleRender} 
                  className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl transition-all active:scale-95"
                >
                  <span className="material-symbols-outlined text-sm">
                    {shot.renderedImage ? 'refresh' : 'auto_awesome'}
                  </span>
                  {shot.renderedImage ? t.regenerate : t.createImage}
                </button>
                {shot.renderedImage && (
                  <button onClick={handleDownload} className="p-2 bg-black/60 backdrop-blur-md rounded-full text-white border border-white/10 hover:bg-emerald-600 transition-all" title={t.download}>
                    <span className="material-symbols-outlined text-sm">download</span>
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        <div className="lg:w-1/2 p-6 flex flex-col border-t lg:border-t-0 lg:border-l border-slate-800">
          <div className="flex-1 space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">{t.visualIns}</label>
              <textarea className="w-full bg-transparent border-none text-sm text-slate-200 resize-none outline-none focus:ring-1 focus:ring-amber-500/20 rounded p-1" rows={2} value={shot.description} onChange={e => onUpdate(shot.id, { description: e.target.value })} />
            </div>
            
            <div className="p-3 bg-slate-900/50 rounded-xl border border-slate-800 relative">
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">{t.dialog}</label>
              <textarea className="w-full bg-transparent border-none text-xs text-slate-300 italic resize-none outline-none focus:ring-1 focus:ring-amber-500/20 rounded p-1" rows={3} value={shot.dialog} onChange={e => onUpdate(shot.id, { dialog: e.target.value })} />
              <span className="material-symbols-outlined absolute right-3 bottom-3 text-slate-700 text-sm">mic</span>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">{t.visualCue}</label>
              <input className="w-full bg-transparent border-none text-xs text-amber-500 font-bold outline-none focus:ring-1 focus:ring-amber-500/20 rounded p-1" value={shot.visualCue} onChange={e => onUpdate(shot.id, { visualCue: e.target.value })} />
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-slate-500 text-sm">schedule</span>
                <span className="text-[10px] text-slate-400 font-mono">{shot.timing}s</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={onRemove} className="p-1.5 text-slate-600 hover:text-red-400 transition-colors">
                <span className="material-symbols-outlined text-sm">delete</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
