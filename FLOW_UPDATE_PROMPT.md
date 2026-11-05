# Hướng dẫn & Prompt cập nhật Google Flow Tool

> **Cách dùng:** Copy toàn bộ nội dung từ mục **PROMPT GỬI CHO AI FLOW** bên dưới, dán vào khung chat **Trình tạo công cụ** (cột bên phải) trên `flow.google.com`.

---

## PROMPT GỬI CHO AI FLOW

Hãy cập nhật toàn bộ dự án với tính năng mới "Native Flow Gallery Bridge (4K Upscale Workflow)" và áp dụng các bản sửa lỗi theo đúng mã nguồn của từng file bên dưới.

### Yêu cầu thực hiện:
1. Thêm `is4k?: boolean` và `name?: string` vào `Shot.renderedImage` trong `types.ts`.
2. Tạo file mới `components/GalleryUpscaleModal.tsx` để hiển thị Media ID và nút nạp bản 4K từ Gallery bằng `Flow.media.select`.
3. Cập nhật `components/ShotCard.tsx` hiển thị badge `4K Ultra HD` và nút gọi Modal.
4. Cập nhật `components/ProductionWorkspace.tsx` để tích hợp `GalleryUpscaleModal` và cập nhật state khi người dùng chọn ảnh 4K.
5. Cập nhật `lib/i18n.ts` thêm từ khóa dịch thuật cho tính năng 4K.
6. Cập nhật `lib/utils.ts` sửa regex tránh xóa nhầm dấu xuống dòng/tab khi trích xuất JSON.
7. Cập nhật `components/ExportModal.tsx` escape dấu ngoặc kép chuẩn CSV và xử lý lỗi video.
8. Cập nhật `App.tsx` đồng bộ ngôn ngữ prompt theo ngôn ngữ giao diện đang chọn.

---

### FILE 1: `types.ts`

```typescript
import { MediaItem } from 'flow-sdk';
import { Language } from './lib/i18n';

export interface Shot {
  id: string;
  type: string;
  description: string;
  dialog: string;
  visualCue: string;
  timing: string;
  renderedImage?: {
    base64: string;
    mimeType: string;
    mediaId: string;
    is4k?: boolean;
    name?: string;
  };
}

export interface ProductionPlan {
  title: string;
  shots: Shot[];
}

export interface ProductDNA {
  features: string;
  benefits: string;
  dimensions: string;
  colors: string;
  materials: string;
  brandStyle: string;
  anatomyLocks: string;
}

export interface AppState {
  language: Language;
  productDescription: string;
  ideaDescription: string;
  productUrl: string;
  productImages: MediaItem[];
  contextImages: MediaItem[];
  decorImages: MediaItem[];
  characterImage: MediaItem | null;
  characterDescription: string;
  dna: ProductDNA;
  settings: {
    duration: string;
    aspectRatio: '16:9' | '9:16' | '1:1';
    style: string;
    category: string;
    language: string;
    toggles: {
      characters: boolean;
      textOnScreen: boolean;
      voiceOver: boolean;
      music: boolean;
    };
  };
}
```

---

### FILE 2: `components/GalleryUpscaleModal.tsx`

```typescript
import React, { useState } from 'react';
import { Shot } from '../types';
import { Language, translations } from '../lib/i18n';

interface Props {
  isOpen: boolean;
  shotIndex: number;
  shot: Shot;
  onClose: () => void;
  onSelect4k: () => Promise<void>;
  lang: Language;
}

export const GalleryUpscaleModal: React.FC<Props> = ({
  isOpen,
  shotIndex,
  shot,
  onClose,
  onSelect4k,
  lang
}) => {
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const t = translations[lang];

  if (!isOpen) return null;

  const mediaId = shot.renderedImage?.mediaId || '';

  const handleCopyId = async () => {
    if (!mediaId) return;
    try {
      await navigator.clipboard.writeText(mediaId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const input = document.createElement('input');
      input.value = mediaId;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePick4k = async () => {
    setLoading(true);
    try {
      await onSelect4k();
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="max-w-lg w-full bg-[#121218] border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5">
        <div className="flex justify-between items-center border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
              <span className="material-symbols-outlined text-amber-400 text-lg">hd</span>
            </div>
            <div>
              <h2 className="text-base font-bold text-white">{t.galleryGuideTitle}</h2>
              <p className="text-[10px] text-slate-500 uppercase font-mono">
                {t.shot} #{shotIndex.toString().padStart(2, '0')} - {shot.type}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-800 rounded text-slate-500 transition-colors">
            <span className="material-symbols-outlined text-base">close</span>
          </button>
        </div>

        {shot.renderedImage ? (
          <div className="space-y-4">
            <div className="bg-[#181822] border border-slate-800 rounded-xl p-3 flex items-center justify-between gap-3">
              <div className="flex-1 overflow-hidden">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">
                  {t.mediaIdLabel}
                </span>
                <span className="text-xs font-mono text-amber-400 truncate block select-all">
                  {mediaId}
                </span>
              </div>
              <button
                onClick={handleCopyId}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold flex items-center gap-1.5 border border-slate-700 transition-all active:scale-95 whitespace-nowrap"
              >
                <span className="material-symbols-outlined text-sm">{copied ? 'check' : 'content_copy'}</span>
                {copied ? t.copied : t.copyMediaId}
              </button>
            </div>

            <div className="space-y-2.5 text-xs text-slate-300 bg-[#16161e] border border-slate-800/60 rounded-xl p-3.5">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                  1
                </span>
                <p className="leading-relaxed">{t.galleryGuideStep1}</p>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                  2
                </span>
                <p className="leading-relaxed">{t.galleryGuideStep2}</p>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                  3
                </span>
                <p className="leading-relaxed">{t.galleryGuideStep3}</p>
              </div>
            </div>

            {shot.renderedImage.is4k && (
              <div className="flex items-center gap-2 p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 text-xs">
                <span className="material-symbols-outlined text-sm">verified</span>
                <span>{t.badge4k}: Đã đồng bộ thành công bản 4K Ultra HD.</span>
              </div>
            )}

            <button
              onClick={handlePick4k}
              disabled={loading}
              className="w-full py-3 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-bold rounded-xl transition-all shadow-lg shadow-amber-900/20 flex items-center justify-center gap-2 text-xs uppercase tracking-wider"
            >
              <span className="material-symbols-outlined text-sm">photo_library</span>
              {loading ? t.processing : t.load4kFromGallery}
            </button>
          </div>
        ) : (
          <div className="p-6 text-center text-slate-500 text-xs">
            {lang === 'vi' ? 'Cần render ảnh trước khi sử dụng tính năng này.' : 'Render an image first before upscaling.'}
          </div>
        )}

        <div className="flex justify-end pt-2 border-t border-slate-800/40">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold transition-colors"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
};
```

---

### FILE 3: `components/ShotCard.tsx`

```typescript
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
```

---

### FILE 4: `components/ProductionWorkspace.tsx`

```typescript
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
```

---

### FILE 5: `lib/i18n.ts`

```typescript
export type Language = 'vi' | 'en' | 'ko' | 'ja' | 'zh' | 'fr' | 'th';

export const translations: Record<Language, any> = {
  vi: {
    welcome: "Chào mừng",
    subtitle: "Bộ công cụ tiền kỳ video tự động",
    init: "Khởi tạo kế hoạch sản xuất",
    dna: "DNA Sản phẩm",
    config: "Cấu hình",
    description: "Mô tả sản phẩm",
    descPlaceholder: "Mô tả USP, đối tượng mục tiêu và thông điệp chính...",
    ideaDesc: "Mô tả ý tưởng",
    ideaPlaceholder: "Nhập ý tưởng của bạn (tuyến nội dung chính để tối ưu kịch bản)...",
    optional: "không bắt buộc",
    url: "URL tham khảo",
    photos: "Ảnh sản phẩm",
    addPhotos: "Thêm ảnh",
    refContext: "REF Bối cảnh",
    refDecor: "REF Vật dụng&Decor",
    addRef: "Thêm REF",
    duration: "Thời lượng",
    aspect: "Tỷ lệ khung hình",
    style: "Phong cách hình ảnh",
    category: "Thể loại nội dung",
    character: "Nhân vật / Diễn viên",
    charDesc: "Mô tả nhân vật (Không bắt buộc)",
    charDescPlaceholder: "Ví dụ: Nam, 25 tuổi, năng động, phong cách đường phố...",
    select: "Chọn",
    noCharacter: "Chưa có dữ liệu nhân vật",
    toggles: {
      characters: "Sử dụng nhân vật",
      textOnScreen: "Chữ trên màn hình",
      voiceOver: "Lời bình AI",
      music: "Nhạc nền"
    },
    generate: "Tạo kế hoạch sản xuất",
    synthesizing: "Đang tổng hợp...",
    workspace: "Không gian làm việc",
    renderAll: "Render tất cả",
    rendering: "Đang render...",
    export: "Xuất dự án",
    sequences: "Cảnh phim",
    addShot: "Thêm cảnh mới",
    shot: "Cảnh",
    visualIns: "Chỉ dẫn hình ảnh",
    dialog: "Lời thoại / Bình luận",
    visualCue: "Chữ & hiệu ứng",
    generateRef: "Tạo ảnh tham khảo",
    regenerate: "Tạo lại ảnh",
    createImage: "Tạo mới ảnh",
    download: "Tải ảnh",
    storyboardView: "Chế độ Storyboard",
    listView: "Chế độ danh sách",
    back: "Quay lại",
    exportCSV: "Danh sách cảnh (CSV)",
    exportGrid: "Storyboard Grid (JPG)",
    exportAnimatic: "Animatic mẫu (MP4)",
    processing: "Đang xử lý...",
    return: "Quay lại không gian",
    analysis: "Phân tích DNA sản phẩm",
    analysisDesc: "Quét sâu USP và phong cách hình ảnh.",
    storyboardDesc: "Tự động lên danh sách cảnh và tham khảo.",
    animaticDesc: "Xuất bản nháp video có âm thanh và nhạc.",
    langName: "Tiếng Việt",
    dnaLocks: "Thông số DNA (Khóa cứng)",
    aiAnalysis: "AI Phân tích DNA",
    features: "Tính năng nổi bật",
    benefits: "Lợi ích sản phẩm",
    dimensions: "Kích thước / Tỷ lệ",
    colors: "Màu sắc chủ đạo",
    materials: "Chất liệu & Vật liệu",
    styleLock: "Ràng buộc phong cách",
    analyzing: "Đang phân tích DNA...",
    masterGrid: "Ảnh Gridline bao quát",
    masterGridDesc: "Tạo duy nhất 1 ảnh chia Gridline cho toàn bộ storyboard",
    generateMaster: "Tạo Master Grid",
    renderIndividual: "Tạo từng frame/scene",
    anatomyLocks: "Logic tỉ lệ & Giải phẫu (Anatomy)",
    anatomyPlaceholder: "Ràng buộc tỉ lệ giữa sản phẩm và con người, bàn tay, không gian... (AI sẽ tự phân tích nếu dùng AI Analysis)",
    upscale4k: "Upscale 4K (Flow)",
    badge4k: "4K Ultra HD",
    copyMediaId: "Sao chép Media ID",
    copied: "Đã chép!",
    load4kFromGallery: "Nạp bản 4K từ Gallery",
    galleryGuideTitle: "Cầu nối Upscale 4K Google Flow",
    galleryGuideStep1: "Ảnh đã tự động lưu trong Gallery. Bấm 'Sao chép ID' để định danh.",
    galleryGuideStep2: "Mở tab Media/Gallery của dự án trên Flow, chọn ảnh này và bấm nút 'Upscale 4K'.",
    galleryGuideStep3: "Sau khi Flow xử lý xong, quay lại đây bấm 'Nạp bản 4K từ Gallery'.",
    mediaIdLabel: "Media ID:",
    close: "Đóng"
  },
  en: {
    welcome: "Welcome",
    subtitle: "Automated Video Pre-Production Suite",
    init: "Initialize Production Plan",
    dna: "Product DNA",
    config: "Configuration",
    description: "Product Description",
    descPlaceholder: "Describe product USP, target audience, and key messages...",
    ideaDesc: "Idea Description",
    ideaPlaceholder: "Enter your idea (main content track for optimization)...",
    optional: "optional",
    url: "Reference URL",
    photos: "Product Photos",
    addPhotos: "Add Photos",
    refContext: "Context REF",
    refDecor: "Props/Decor REF",
    addRef: "Add REF",
    duration: "Duration",
    aspect: "Aspect Ratio",
    style: "Visual Style",
    category: "Content Category",
    character: "Actor / Character",
    charDesc: "Character Description (Optional)",
    charDescPlaceholder: "E.g.: Male, 25 years old, energetic, street style...",
    select: "Select",
    noCharacter: "No character data",
    toggles: {
      characters: "Use Characters",
      textOnScreen: "Text Overlays",
      voiceOver: "AI Voiceover",
      music: "Background Music"
    },
    generate: "Generate Production Plan",
    synthesizing: "Synthesizing...",
    workspace: "Workspace",
    renderAll: "Render All",
    rendering: "Rendering...",
    export: "Export Project",
    sequences: "Sequences",
    addShot: "Add Shot",
    shot: "Shot",
    visualIns: "Visual Instruction",
    dialog: "Dialogue / Voiceover",
    visualCue: "Text & Cues",
    generateRef: "Generate Reference",
    regenerate: "Regenerate",
    createImage: "Create Image",
    download: "Download Image",
    storyboardView: "Storyboard Mode",
    listView: "List Mode",
    back: "Back",
    exportCSV: "Shotlist (CSV)",
    exportGrid: "Storyboard Grid (JPG)",
    exportAnimatic: "Animatic Sample (MP4)",
    processing: "Processing...",
    return: "Return to Workspace",
    analysis: "Product DNA Analysis",
    analysisDesc: "Deep scan of USP and visual style.",
    storyboardDesc: "Automatic shot-listing and references.",
    animaticDesc: "Export video drafts with audio.",
    langName: "English",
    dnaLocks: "DNA Parameter Locks",
    aiAnalysis: "AI DNA Analysis",
    features: "Key Features",
    benefits: "Product Benefits",
    dimensions: "Dimensions / Size",
    colors: "Core Colors",
    materials: "Materials & Fabric",
    styleLock: "Style Constraints",
    analyzing: "Analyzing DNA...",
    masterGrid: "Master Gridline",
    masterGridDesc: "Create a single grid image for the entire storyboard",
    generateMaster: "Generate Master Grid",
    renderIndividual: "Generate individual shots",
    anatomyLocks: "Anatomy & Proportional Logic",
    anatomyPlaceholder: "Hard locks for scale relative to humans, body parts, and environment...",
    upscale4k: "Upscale 4K (Flow)",
    badge4k: "4K Ultra HD",
    copyMediaId: "Copy Media ID",
    copied: "Copied!",
    load4kFromGallery: "Load 4K from Gallery",
    galleryGuideTitle: "Google Flow 4K Upscale Bridge",
    galleryGuideStep1: "Image is auto-saved in Gallery. Click 'Copy ID' to identify it.",
    galleryGuideStep2: "Open the project Media/Gallery tab in Flow, select this image, and click 'Upscale 4K'.",
    galleryGuideStep3: "Once Flow finishes upscaling, return here and click 'Load 4K from Gallery'.",
    mediaIdLabel: "Media ID:",
    close: "Close"
  },
  ko: { langName: "한국어" },
  ja: { langName: "日本語" },
  zh: { langName: "中文" },
  fr: { langName: "Français" },
  th: { langName: "ไทย" }
};

(Object.keys(translations) as Language[]).forEach(lang => {
  if (lang !== 'en' && lang !== 'vi') {
    translations[lang] = { ...translations.en, ...translations[lang] };
  }
});

export const languagePromptNames: Record<Language, string> = {
  vi: 'Vietnamese',
  en: 'English',
  ko: 'Korean',
  ja: 'Japanese',
  zh: 'Chinese',
  fr: 'French',
  th: 'Thai'
};
```

---

### FILE 6: `lib/utils.ts`

```typescript
export function extractJson<T>(text: string): T | null {
  if (!text) return null;

  try {
    let jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    const startIdx = jsonStr.indexOf('{');
    const endIdx = jsonStr.lastIndexOf('}');
    
    if (startIdx === -1 || endIdx === -1) {
      const arrStart = jsonStr.indexOf('[');
      const arrEnd = jsonStr.lastIndexOf(']');
      if (arrStart !== -1 && arrEnd !== -1) {
        jsonStr = jsonStr.substring(arrStart, arrEnd + 1);
      } else {
        return null;
      }
    } else {
      jsonStr = jsonStr.substring(startIdx, endIdx + 1);
    }
    
    const cleaned = jsonStr
      .replace(/,\s*([\]}])/g, '$1')
      .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, "");

    return JSON.parse(cleaned) as T;
  } catch (e) {
    console.error("JSON Extraction Error:", e, "\nOriginal Text:", text);
    return null;
  }
}
```

---

### FILE 7: `components/ExportModal.tsx`

```typescript
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
```

---

### FILE 8: `App.tsx`

```typescript
import React, { useState } from 'react';
import { WelcomeModal } from './components/WelcomeModal';
import { SetupForm } from './components/SetupForm';
import { ProductionWorkspace } from './components/ProductionWorkspace';
import { ProductionPlan, AppState } from './types';
import { Language, languagePromptNames } from './lib/i18n';
import { Flow } from 'flow-sdk';
import { extractJson } from './lib/utils';

export default function App() {
  const [step, setStep] = useState<'welcome' | 'setup' | 'workspace'>('welcome');
  const [lang, setLang] = useState<Language>('vi');
  const [plan, setPlan] = useState<ProductionPlan | null>(null);
  
  const [appState, setAppState] = useState<AppState>({
    language: 'vi',
    productDescription: '',
    ideaDescription: '',
    productUrl: '',
    productImages: [],
    contextImages: [],
    decorImages: [],
    characterImage: null,
    characterDescription: '',
    dna: {
      features: '',
      benefits: '',
      dimensions: '',
      colors: '',
      materials: '',
      brandStyle: '',
      anatomyLocks: ''
    },
    settings: {
      duration: '30s',
      aspectRatio: '16:9',
      style: 'Realistic',
      category: 'Tổng hợp Nội thất',
      language: 'Vietnamese',
      toggles: {
        characters: true,
        textOnScreen: true,
        voiceOver: true,
        music: true
      }
    }
  });

  const handleLanguageChange = (newLang: Language) => {
    setLang(newLang);
    setAppState(prev => ({
      ...prev,
      language: newLang,
      settings: {
        ...prev.settings,
        language: languagePromptNames[newLang] || prev.settings.language
      }
    }));
  };

  const handleGeneratePlan = async (state: AppState) => {
    const activeLanguageName = languagePromptNames[state.language] || state.settings.language || 'Vietnamese';
    const updatedState = {
      ...state,
      settings: {
        ...state.settings,
        language: activeLanguageName
      }
    };
    setAppState(updatedState);
    
    const dnaContext = `
      LOCKED PRODUCT DNA:
      - Features: ${updatedState.dna.features || 'Standard'}
      - Benefits: ${updatedState.dna.benefits || 'High quality'}
      - Dimensions: ${updatedState.dna.dimensions || 'Life-size'}
      - Colors: ${updatedState.dna.colors || 'Natural'}
      - Materials: ${updatedState.dna.materials || 'Standard'}
      - Brand Style: ${updatedState.dna.brandStyle || 'Modern'}
      - Spatial Logic: ${updatedState.dna.anatomyLocks || 'Realistic human-scale'}
    `;

    const prompt = `
      Act as a Creative Director. Generate a detailed video storyboard plan for: ${updatedState.productDescription}.
      
      DNA CONSTRAINTS:
      ${dnaContext}

      PRODUCTION SETTINGS:
      - Category: ${updatedState.settings.category}
      - Visual Style: ${updatedState.settings.style}
      - Core Idea: ${updatedState.ideaDescription || 'Direct Showcase'}
      - Ref URL: ${updatedState.productUrl}
      - Total Duration: ${updatedState.settings.duration}
      - Aspect Ratio: ${updatedState.settings.aspectRatio}
      - Content Language: ${activeLanguageName}
      - Character Details: ${updatedState.characterDescription || 'None'}
      
      Requirements:
      1. 'description' field MUST be in English for stable image generation.
      2. 'dialog', 'visualCue', and 'title' MUST be in ${activeLanguageName}.
      3. Create 5-8 distinct shots that follow a cinematic flow.
      
      OUTPUT FORMAT (STRICT JSON ONLY):
      {
        "title": "A catchy production title",
        "shots": [
          {
            "id": "1",
            "type": "Wide Shot / Medium Shot / Close Up / Macro",
            "description": "Visual instruction in English focusing on product detail and DNA colors",
            "dialog": "Voiceover/Dialogue in ${activeLanguageName}",
            "visualCue": "On-screen text in ${activeLanguageName}",
            "timing": "3.5"
          }
        ]
      }
    `;

    try {
      const imagePayload = updatedState.productImages.slice(0, 3).map(img => ({ 
        base64: img.base64, 
        mimeType: img.mimeType 
      }));

      const { text } = await Flow.generate.text(prompt, {
        images: imagePayload,
        thinkingLevel: 'high',
        systemInstruction: "You are a professional cinematographer. Return only a single valid JSON object. No markdown formatting outside the JSON block. Ensure spatial logic is preserved."
      });
      
      const generatedPlan = extractJson<ProductionPlan>(text);
      
      if (generatedPlan && Array.isArray(generatedPlan.shots) && generatedPlan.shots.length > 0) {
        setPlan(generatedPlan);
        setStep('workspace');
      } else {
        console.error("Malformed AI Response:", text);
        throw new Error("Phản hồi từ AI không đúng định dạng JSON hoặc thiếu dữ liệu cảnh quay.");
      }
    } catch (error) {
      console.error("Production Plan Generation Failed:", error);
      const errorMsg = lang === 'vi' 
        ? "Không thể tạo kế hoạch sản xuất. Lỗi: " + (error instanceof Error ? error.message : "AI bận hoặc phản hồi sai định dạng") 
        : "Failed to generate plan. Error: " + (error instanceof Error ? error.message : "AI timeout or format mismatch");
      alert(errorMsg);
      throw error;
    }
  };

  return (
    <div className="h-full w-full bg-[#0a0a0c] text-slate-200 overflow-hidden font-sans">
      {step === 'welcome' && (
        <WelcomeModal 
          onStart={() => setStep('setup')} 
          lang={lang} 
          onLangChange={handleLanguageChange} 
        />
      )}
      
      {step === 'setup' && (
        <SetupForm 
          initialState={appState} 
          onGenerate={handleGeneratePlan} 
          lang={lang}
          onLangChange={handleLanguageChange}
        />
      )}

      {step === 'workspace' && plan && (
        <ProductionWorkspace 
          plan={plan} 
          appState={appState}
          onBack={() => setStep('setup')}
          lang={lang}
          onLangChange={handleLanguageChange}
        />
      )}
    </div>
  );
}
```
