import React, { useState } from 'react';
import { ProductionPlan, AppState, Shot } from '../types';
import { Flow } from 'flow-sdk';
import { ShotCard } from './ShotCard';
import { ExportModal } from './ExportModal';
import { GalleryUpscaleModal } from './GalleryUpscaleModal';
import { Reorder } from 'motion/react';
import { Language, translations } from '../lib/i18n';
import { LanguagePicker } from './LanguagePicker';

interface Props {
  plan: ProductionPlan;
  appState: AppState;
  onBack: () => void;
  lang: Language;
  onLangChange: (l: Language) => void;
}

export const ProductionWorkspace: React.FC<Props> = ({ plan, appState, onBack, lang, onLangChange }) => {
  const [currentPlan, setCurrentPlan] = useState<ProductionPlan>(plan);
  const [isExporting, setIsExporting] = useState(false);
  const [renderingAll, setRenderingAll] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'storyboard'>('list');
  const [loadingShots, setLoadingShots] = useState<Record<string, number>>({});
  const [masterGridProgress, setMasterGridProgress] = useState<number | null>(null);
  const [upscaleShot, setUpscaleShot] = useState<{ shot: Shot; index: number } | null>(null);
  
  const t = translations[lang];

  const handleUpdateShot = (shotId: string, updates: Partial<Shot>) => {
    setCurrentPlan(prev => ({
      ...prev,
      shots: prev.shots.map(s => s.id === shotId ? { ...s, ...updates } : s)
    }));
  };

  const handleSelect4kShot = async (shotId: string) => {
    try {
      const selectedItem = await Flow.media.select({ filter: 'image' });
      if (selectedItem) {
        handleUpdateShot(shotId, {
          renderedImage: {
            base64: selectedItem.base64,
            mimeType: selectedItem.mimeType,
            mediaId: selectedItem.mediaId,
            name: selectedItem.name,
            is4k: true
          }
        });
      }
    } catch (err) {
      console.error("Failed to select 4k image from gallery:", err);
    }
  };

  const handleRenderShot = async (shotId: string) => {
    const shot = currentPlan.shots.find(s => s.id === shotId);
    if (!shot) return;

    setLoadingShots(prev => ({ ...prev, [shotId]: 0 }));
    
    const interval = setInterval(() => {
      setLoadingShots(prev => {
        const curr = prev[shotId] || 0;
        if (curr < 95) return { ...prev, [shotId]: curr + Math.floor(Math.random() * 5) };
        return prev;
      });
    }, 200);

    try {
      const dnaPrompt = `STRICT CONSTRAINTS: Colors: ${appState.dna.colors}. Materials: ${appState.dna.materials}. Dimensions: ${appState.dna.dimensions}. Style: ${appState.dna.brandStyle}. SPATIAL/ANATOMY LOCKS: ${appState.dna.anatomyLocks}.`;
      
      const prompt = `A highly detailed ${appState.settings.style} shot. ${shot.type}: ${shot.description}. ${dnaPrompt} Product category: ${appState.settings.category}. ${appState.characterImage ? 'Main character featured.' : ''} Ensure environment follows context references and decor style. MAINTAIN RIGOROUS PROPORTIONAL LOGIC BETWEEN PRODUCT AND HUMAN SUBJECTS.`;
      
      const referenceIds = [
        ...appState.productImages.map(img => img.mediaId),
        ...(appState.characterImage ? [appState.characterImage.mediaId] : []),
        ...appState.contextImages.map(img => img.mediaId),
        ...appState.decorImages.map(img => img.mediaId)
      ].slice(0, 10);

      const result = await Flow.generate.image({
        prompt,
        referenceImageMediaIds: referenceIds,
        aspectRatio: appState.settings.aspectRatio,
        modelDisplayName: '🍌 Nano Banana Pro'
      });

      handleUpdateShot(shotId, {
        renderedImage: {
          ...result,
          is4k: false
        }
      });
    } catch (error) {
      console.error("Render failed", error);
      alert(lang === 'vi' ? `Render cảnh #${shot.id} thất bại.` : `Failed to render shot #${shot.id}.`);
    } finally {
      clearInterval(interval);
      setLoadingShots(prev => {
        const next = { ...prev };
        delete next[shotId];
        return next;
      });
    }
  };

  const handleRenderAll = async () => {
    setRenderingAll(true);
    for (const shot of currentPlan.shots) {
      if (!shot.renderedImage) await handleRenderShot(shot.id);
    }
    setRenderingAll(false);
  };

  const handleGenerateMasterGrid = async () => {
    const renderedShots = currentPlan.shots.filter(s => s.renderedImage);
    if (renderedShots.length === 0) {
      alert(lang === 'vi' ? "Cần tạo ảnh cho ít nhất một cảnh trước khi tạo Master Grid." : "Render at least one shot before generating the Master Grid.");
      return;
    }

    setMasterGridProgress(0);
    const interval = setInterval(() => {
      setMasterGridProgress(p => (p !== null && p < 98) ? p + 2 : p);
    }, 100);

    try {
      const canvas = document.createElement('canvas');
      const cols = 3;
      const rows = Math.ceil(currentPlan.shots.length / cols);
      const shotWidth = 800;
      const shotHeight = appState.settings.aspectRatio === '9:16' ? 1422 : appState.settings.aspectRatio === '1:1' ? 800 : 450;
      const padding = 40;
      const headerHeight = 200;

      canvas.width = cols * shotWidth + (cols + 1) * padding;
      canvas.height = rows * shotHeight + (rows + 1) * padding + headerHeight;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      ctx.fillStyle = '#0a0a0c';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 60px sans-serif';
      ctx.fillText(currentPlan.title.toUpperCase(), padding, 100);
      
      ctx.font = '30px sans-serif';
      ctx.fillStyle = '#64748b';
      ctx.fillText(`MASTER STORYBOARD / ${currentPlan.shots.length} SCENES / STYLE: ${appState.settings.style}`, padding, 150);

      for (let i = 0; i < currentPlan.shots.length; i++) {
        const shot = currentPlan.shots[i];
        if (!shot.renderedImage) {
           const col = i % cols;
           const row = Math.floor(i / cols);
           const x = padding + col * (shotWidth + padding);
           const y = headerHeight + row * (shotHeight + padding);
           ctx.fillStyle = '#16161e';
           ctx.fillRect(x, y, shotWidth, shotHeight);
           ctx.fillStyle = '#334155';
           ctx.font = '30px sans-serif';
           ctx.textAlign = 'center';
           ctx.fillText("NOT RENDERED", x + shotWidth/2, y + shotHeight/2);
           ctx.textAlign = 'left';
           continue;
        }
        const col = i % cols;
        const row = Math.floor(i / cols);
        const x = padding + col * (shotWidth + padding);
        const y = headerHeight + row * (shotHeight + padding);
        
        const img = new Image();
        img.src = `data:${shot.renderedImage.mimeType};base64,${shot.renderedImage.base64}`;
        
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          setTimeout(reject, 10000);
        });
        
        ctx.drawImage(img, x, y, shotWidth, shotHeight);
        
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(x, y + shotHeight - 80, shotWidth, 80);
        
        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold 30px sans-serif';
        const is4kTag = shot.renderedImage.is4k ? ' [4K]' : '';
        ctx.fillText(`SCENE ${(i+1).toString().padStart(2, '0')} - ${shot.type.toUpperCase()}${is4kTag}`, x + 30, y + shotHeight - 30);
      }

      setMasterGridProgress(100);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      const base64 = dataUrl.split(',')[1];
      await Flow.download({ 
        base64, 
        mimeType: 'image/jpeg', 
        filename: `Master_Grid_${currentPlan.title.replace(/\s/g, '_')}.jpg` 
      });
    } catch (err) {
      console.error(err);
      alert(lang === 'vi' ? "Không thể xuất Master Grid. Vui lòng thử lại." : "Could not export Master Grid. Please try again.");
    } finally {
      clearInterval(interval);
      setTimeout(() => setMasterGridProgress(null), 1000);
    }
  };

  const handleAddShot = () => {
    const newId = String(Date.now());
    const newShot: Shot = {
      id: newId,
      type: "Medium Shot",
      description: "New visual description",
      dialog: "",
      visualCue: "",
      timing: "0.0"
    };
    setCurrentPlan(prev => ({ ...prev, shots: [...prev.shots, newShot] }));
  };

  const handleRemoveShot = (id: string) => {
    setCurrentPlan(prev => ({ ...prev, shots: prev.shots.filter(s => s.id !== id) }));
  };

  return (
    <div className="h-full flex flex-col bg-[#070709]">
      <header className="h-16 border-b border-slate-800 flex items-center justify-between px-6 bg-[#121218]/50 backdrop-blur-md z-30">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 transition-colors">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div>
            <h1 className="text-sm font-bold text-white truncate max-w-xs">{currentPlan.title}</h1>
            <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">{t.workspace} / {appState.settings.category}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="bg-[#1c1c24] rounded-lg p-1 flex gap-1 border border-slate-700 shadow-inner">
            <button 
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded flex items-center gap-1 text-[10px] font-bold transition-all ${viewMode === 'list' ? 'bg-amber-600 text-white shadow-lg shadow-amber-900/40' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <span className="material-symbols-outlined text-sm">list</span>
              {t.listView}
            </button>
            <button 
              onClick={() => setViewMode('storyboard')}
              className={`p-1.5 rounded flex items-center gap-1 text-[10px] font-bold transition-all ${viewMode === 'storyboard' ? 'bg-amber-600 text-white shadow-lg shadow-amber-900/40' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <span className="material-symbols-outlined text-sm">grid_view</span>
              {t.storyboardView}
            </button>
          </div>

          <div className="h-6 w-px bg-slate-800"></div>

          <LanguagePicker current={lang} onChange={onLangChange} variant="ghost" />

          <button 
            onClick={handleRenderAll}
            disabled={renderingAll}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg border border-slate-700 flex items-center gap-2 transition-all active:scale-95"
          >
            <span className={`material-symbols-outlined text-sm ${renderingAll ? 'animate-spin' : ''}`}>
              {renderingAll ? 'refresh' : 'photo_library'}
            </span>
            {renderingAll ? t.rendering : t.renderAll}
          </button>
          <button 
            onClick={() => setIsExporting(true)}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-lg flex items-center gap-2 transition-all shadow-lg shadow-amber-900/20 active:scale-95"
          >
            <span className="material-symbols-outlined text-sm">ios_share</span>
            {t.export}
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-hidden flex relative">
        <div className="w-80 border-r border-slate-800 flex flex-col bg-[#0a0a0c]">
          <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-[#121218]/30">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{t.sequences}</span>
            <button onClick={handleAddShot} className="p-1 hover:bg-slate-800 rounded text-amber-500 transition-colors">
              <span className="material-symbols-outlined text-sm font-bold">add</span>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
            <Reorder.Group axis="y" values={currentPlan.shots} onReorder={(shots) => setCurrentPlan({ ...currentPlan, shots })}>
              {currentPlan.shots.map((shot, idx) => (
                <Reorder.Item key={shot.id} value={shot}>
                  <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#16161e] cursor-grab active:cursor-grabbing border border-transparent hover:border-slate-800 transition-all group">
                    <span className="text-[10px] font-mono text-slate-600 w-4 font-bold">{(idx + 1).toString().padStart(2, '0')}</span>
                    <div className="flex-1 overflow-hidden">
                      <div className="flex items-center gap-1.5">
                        <p className="text-[11px] font-black text-slate-300 truncate uppercase tracking-tight group-hover:text-amber-500 transition-colors">{shot.type}</p>
                        {shot.renderedImage?.is4k && (
                          <span className="px-1 py-0.2 text-[8px] font-bold bg-amber-500/20 text-amber-400 rounded border border-amber-500/40">4K</span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500 truncate italic">{shot.description}</p>
                    </div>
                    {shot.renderedImage && (
                      <div className={`w-2 h-2 rounded-full ${shot.renderedImage.is4k ? 'bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.8)]' : 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]'}`}></div>
                    )}
                  </div>
                </Reorder.Item>
              ))}
            </Reorder.Group>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-[radial-gradient(circle_at_top_right,_#121218_0%,_#070709_100%)]">
          {viewMode === 'list' ? (
            <div className="max-w-4xl mx-auto space-y-12 pb-20">
              {currentPlan.shots.map((shot, idx) => (
                <ShotCard 
                  key={shot.id} 
                  index={idx + 1}
                  shot={shot} 
                  onUpdate={handleUpdateShot}
                  onRemove={() => handleRemoveShot(shot.id)}
                  onRender={() => handleRenderShot(shot.id)}
                  aspectRatio={appState.settings.aspectRatio}
                  t={t}
                  onOpenUpscale={() => setUpscaleShot({ shot, index: idx + 1 })}
                />
              ))}
              <button 
                onClick={handleAddShot} 
                className="w-full py-12 border-2 border-dashed border-slate-800 rounded-3xl flex flex-col items-center justify-center gap-4 hover:border-amber-500/50 hover:bg-amber-500/5 text-slate-600 hover:text-amber-500 transition-all group"
              >
                <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-2xl">add</span>
                </div>
                <span className="text-xs font-black uppercase tracking-[0.2em]">{t.addShot}</span>
              </button>
            </div>
          ) : (
            <div className="max-w-7xl mx-auto space-y-8 pb-20">
              <div className="flex flex-col md:flex-row gap-6 items-center justify-between p-6 bg-[#121218] border border-slate-800 rounded-2xl shadow-2xl">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                    <span className="material-symbols-outlined text-amber-500">grid_view</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white uppercase tracking-widest">{t.renderIndividual}</h3>
                    <p className="text-[10px] text-slate-500">{t.storyboardDesc}</p>
                  </div>
                </div>

                <div className="h-px md:h-12 w-full md:w-px bg-slate-800"></div>

                <div className="flex flex-1 items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                    <span className="material-symbols-outlined text-indigo-500">auto_fix_high</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-black text-white uppercase tracking-widest">{t.masterGrid}</h3>
                    <p className="text-[10px] text-slate-500">{t.masterGridDesc}</p>
                  </div>
                  <button 
                    onClick={handleGenerateMasterGrid}
                    disabled={masterGridProgress !== null}
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-indigo-900/20 active:scale-95 disabled:opacity-50 relative overflow-hidden"
                  >
                    {masterGridProgress !== null ? (
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined animate-spin text-sm">refresh</span>
                        {masterGridProgress}%
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">dashboard_customize</span>
                        {t.generateMaster}
                      </div>
                    )}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentPlan.shots.map((shot, idx) => (
                  <div key={shot.id} className="bg-[#121218] border border-slate-800 rounded-2xl overflow-hidden group hover:border-amber-500/40 transition-all shadow-xl relative">
                    <div className={`relative bg-black flex items-center justify-center overflow-hidden ${appState.settings.aspectRatio === '9:16' ? 'aspect-[9/16]' : appState.settings.aspectRatio === '1:1' ? 'aspect-square' : 'aspect-video'}`}>
                      {shot.renderedImage ? (
                        <img src={`data:${shot.renderedImage.mimeType};base64,${shot.renderedImage.base64}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                      ) : (
                        <div className="flex flex-col items-center gap-3">
                          <span className="material-symbols-outlined text-slate-900 text-6xl">movie</span>
                        </div>
                      )}
                      
                      <div className="absolute top-3 left-3 flex items-center gap-1.5 z-20">
                        <span className="px-2 py-1 bg-black/70 backdrop-blur rounded font-mono text-[10px] text-amber-500 border border-white/5">
                          #{idx+1}
                        </span>
                        {shot.renderedImage?.is4k && (
                          <span className="px-1.5 py-0.5 bg-amber-500/30 backdrop-blur rounded font-mono text-[9px] font-bold text-amber-400 border border-amber-500/40">
                            4K
                          </span>
                        )}
                      </div>

                      {shot.renderedImage && (
                        <div className="absolute top-3 right-3 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => setUpscaleShot({ shot, index: idx + 1 })}
                            className="p-1.5 bg-black/70 hover:bg-amber-600 backdrop-blur rounded-lg text-slate-300 hover:text-white border border-white/10 transition-colors"
                            title={t.upscale4k}
                          >
                            <span className="material-symbols-outlined text-xs">hd</span>
                          </button>
                        </div>
                      )}
                      
                      {loadingShots[shot.id] !== undefined && (
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center z-30">
                          <div className="text-xl font-mono text-white font-bold mb-2">{loadingShots[shot.id]}%</div>
                          <div className="w-24 h-1 bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-amber-500 transition-all duration-300" style={{ width: `${loadingShots[shot.id]}%` }}></div>
                          </div>
                        </div>
                      )}

                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10">
                        <button 
                          onClick={() => handleRenderShot(shot.id)}
                          className="px-5 py-2 bg-amber-600 text-white text-[10px] font-black rounded-full uppercase tracking-widest shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-all"
                        >
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm">{shot.renderedImage ? 'refresh' : 'auto_awesome'}</span>
                            {shot.renderedImage ? t.regenerate : t.createImage}
                          </div>
                        </button>
                      </div>
                    </div>
                    <div className="p-4 border-t border-slate-800">
                      <p className="text-[10px] font-black text-white uppercase truncate mb-1 tracking-wider">{shot.type}</p>
                      <p className="text-[10px] text-slate-500 line-clamp-2 italic font-serif leading-relaxed">{shot.description}</p>
                    </div>
                  </div>
                ))}
                <button onClick={handleAddShot} className="aspect-video border-2 border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center text-slate-800 hover:text-amber-500 hover:border-amber-500/50 transition-all bg-[#121218]/50">
                  <span className="material-symbols-outlined text-3xl">add</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest mt-2">{t.addShot}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {isExporting && (
        <ExportModal 
          plan={currentPlan} 
          appState={appState}
          onClose={() => setIsExporting(false)} 
          lang={lang}
        />
      )}

      {upscaleShot && (
        <GalleryUpscaleModal
          isOpen={true}
          shot={currentPlan.shots.find(s => s.id === upscaleShot.shot.id) || upscaleShot.shot}
          shotIndex={upscaleShot.index}
          onClose={() => setUpscaleShot(null)}
          onSelect4k={() => handleSelect4kShot(upscaleShot.shot.id)}
          lang={lang}
        />
      )}
    </div>
  );
};
