import React, { useState } from 'react';
import { AppState, ProductDNA } from '../types';
import { Flow } from 'flow-sdk';
import { Language, translations } from '../lib/i18n';
import { LanguagePicker } from './LanguagePicker';
import { contentCategories } from '../lib/categories';
import { extractJson } from '../lib/utils';

interface Props {
  initialState: AppState;
  onGenerate: (state: AppState) => void;
  lang: Language;
  onLangChange: (l: Language) => void;
}

export const SetupForm: React.FC<Props> = ({ initialState, onGenerate, lang, onLangChange }) => {
  const [state, setState] = useState<AppState>(initialState);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [analyzingDNA, setAnalyzingDNA] = useState(false);
  const t = translations[lang];

  const handleSelectProductImages = async () => {
    const items = await Flow.media.selectMultiple({ filter: 'image', maxCount: 7 });
    if (items.length > 0) setState(prev => ({ ...prev, productImages: [...prev.productImages, ...items].slice(0, 7) }));
  };

  const handleRemoveProductImage = (index: number) => {
    setState(prev => ({
      ...prev,
      productImages: prev.productImages.filter((_, i) => i !== index)
    }));
  };

  const handleReplaceProductImage = async (index: number) => {
    const item = await Flow.media.select({ filter: 'image' });
    if (item) {
      setState(prev => ({
        ...prev,
        productImages: prev.productImages.map((img, i) => i === index ? item : img)
      }));
    }
  };

  const handleSelectContextImages = async () => {
    const items = await Flow.media.selectMultiple({ filter: 'image', maxCount: 3 });
    if (items.length > 0) setState(prev => ({ ...prev, contextImages: [...prev.contextImages, ...items].slice(0, 3) }));
  };

  const handleRemoveContextImage = (index: number) => {
    setState(prev => ({
      ...prev,
      contextImages: prev.contextImages.filter((_, i) => i !== index)
    }));
  };

  const handleReplaceContextImage = async (index: number) => {
    const item = await Flow.media.select({ filter: 'image' });
    if (item) {
      setState(prev => ({
        ...prev,
        contextImages: prev.contextImages.map((img, i) => i === index ? item : img)
      }));
    }
  };

  const handleSelectDecorImages = async () => {
    const items = await Flow.media.selectMultiple({ filter: 'image', maxCount: 3 });
    if (items.length > 0) setState(prev => ({ ...prev, decorImages: [...prev.decorImages, ...items].slice(0, 3) }));
  };

  const handleRemoveDecorImage = (index: number) => {
    setState(prev => ({
      ...prev,
      decorImages: prev.decorImages.filter((_, i) => i !== index)
    }));
  };

  const handleReplaceDecorImage = async (index: number) => {
    const item = await Flow.media.select({ filter: 'image' });
    if (item) {
      setState(prev => ({
        ...prev,
        decorImages: prev.decorImages.map((img, i) => i === index ? item : img)
      }));
    }
  };

  const handleSelectCharacter = async () => {
    const item = await Flow.media.select({ filter: 'image' });
    if (item) setState(prev => ({ ...prev, characterImage: item }));
  };

  const handleAIAnalysis = async () => {
    if (!state.productDescription && state.productImages.length === 0) {
      alert(lang === 'vi' ? "Cần ít nhất mô tả hoặc ảnh để phân tích DNA." : "Need at least a description or photos to analyze DNA.");
      return;
    }
    
    setAnalyzingDNA(true);
    try {
      const { text } = await Flow.generate.text(
        `Analyze the product DNA for this: 
        Description: ${state.productDescription}
        URL: ${state.productUrl}
        
        Mandatory Tasks:
        1. Extract Features, Benefits, Dimensions/Size, Core Colors, and Materials.
        2. INTERPRET SPATIAL LOGIC (Anatomy Locks): Define hard constraints for proportions when the product is placed next to humans or body parts. How big is it relative to a hand/face/person? How should it interact spatially?
        
        Return strictly valid JSON: { 
          "features": "", 
          "benefits": "", 
          "dimensions": "", 
          "colors": "", 
          "materials": "", 
          "brandStyle": "",
          "anatomyLocks": "detailed description of spatial logic and human-scale proportions"
        }`,
        {
          images: state.productImages.map(img => ({ base64: img.base64, mimeType: img.mimeType })),
          systemInstruction: "You are a professional product analyst and spatial director. Define rigorous visual and proportional locks for product-to-human relationships."
        }
      );

      const dna = extractJson<ProductDNA>(text);
      if (dna) {
        setState(prev => ({ ...prev, dna: { ...prev.dna, ...dna } }));
      } else {
        throw new Error("Could not parse DNA JSON.");
      }
    } catch (error) {
      console.error("DNA Analysis failed", error);
      alert(lang === 'vi' ? "Phân tích DNA thất bại. Vui lòng kiểm tra kết nối." : "DNA Analysis failed. Please check your connection.");
    } finally {
      setAnalyzingDNA(false);
    }
  };

  const handleSubmit = async () => {
    if (!state.productDescription && !state.productUrl && !state.ideaDescription) {
      alert(t.descPlaceholder);
      return;
    }
    
    setLoading(true);
    setProgress(0);
    
    const interval = setInterval(() => {
      setProgress(p => {
        if (p < 30) return p + 5;
        if (p < 70) return p + 2;
        if (p < 98) return p + 1;
        return p;
      });
    }, 200);

    try {
      await onGenerate(state);
      setProgress(100);
    } catch (err) {
      console.error(err);
      alert(lang === 'vi' ? "Có lỗi xảy ra khi tạo kế hoạch." : "An error occurred while generating the plan.");
    } finally {
      clearInterval(interval);
      setLoading(false);
    }
  };

  const updateDnaField = (field: keyof ProductDNA, value: string) => {
    setState(prev => ({ ...prev, dna: { ...prev.dna, [field]: value } }));
  };

  const ImageThumbnail: React.FC<{ 
    img: any; 
    onRemove: () => void; 
    onReplace: () => void;
  }> = ({ img, onRemove, onReplace }) => (
    <div className="relative group/thumb w-full h-full rounded overflow-hidden border border-slate-800 bg-black">
      <img src={`data:${img.mimeType};base64,${img.base64}`} className="w-full h-full object-cover" />
      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center gap-1">
        <button 
          onClick={onReplace}
          className="p-1 bg-amber-500 rounded text-white hover:bg-amber-400 transition-colors"
          title="Thay đổi"
        >
          <span className="material-symbols-outlined text-[14px]">sync</span>
        </button>
        <button 
          onClick={onRemove}
          className="p-1 bg-red-600 rounded text-white hover:bg-red-500 transition-colors"
          title="Xóa"
        >
          <span className="material-symbols-outlined text-[14px]">delete</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col max-w-6xl mx-auto p-6 overflow-y-auto custom-scrollbar">
      <header className="mb-8 flex justify-between items-end">
        <div>
          <h2 className="text-sm font-mono text-amber-500 uppercase tracking-widest mb-1">{t.config}</h2>
          <h1 className="text-3xl font-bold text-white uppercase tracking-tight">{t.dna}</h1>
        </div>
        <div className="flex items-center gap-6">
          <LanguagePicker current={lang} onChange={onLangChange} variant="ghost" />
          <button 
            onClick={handleAIAnalysis}
            disabled={analyzingDNA}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-lg text-xs font-bold uppercase hover:bg-amber-500/20 transition-all"
          >
            <span className={`material-symbols-outlined text-sm ${analyzingDNA ? 'animate-spin' : ''}`}>
              {analyzingDNA ? 'refresh' : 'psychology'}
            </span>
            {analyzingDNA ? t.analyzing : t.aiAnalysis}
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
        {/* Left Col: Basics */}
        <div className="lg:col-span-4 space-y-6">
          <section>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">{t.description}</label>
            <textarea 
              className="w-full bg-[#16161e] border border-slate-800 rounded-xl p-4 text-slate-200 focus:border-amber-500 outline-none min-h-[100px] transition-colors text-sm"
              placeholder={t.descPlaceholder}
              value={state.productDescription}
              onChange={e => setState(prev => ({ ...prev, productDescription: e.target.value }))}
            />
          </section>

          <section>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
              {t.ideaDesc} <span className="text-[10px] text-slate-600 lowercase italic">({t.optional})</span>
            </label>
            <textarea 
              className="w-full bg-[#16161e] border border-slate-800 rounded-xl p-4 text-slate-200 focus:border-amber-500 outline-none min-h-[100px] transition-colors text-sm"
              placeholder={t.ideaPlaceholder}
              value={state.ideaDescription}
              onChange={e => setState(prev => ({ ...prev, ideaDescription: e.target.value }))}
            />
          </section>

          <section className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">{t.url}</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-3 text-slate-600 text-sm">link</span>
                  <input 
                    type="text" 
                    className="w-full bg-[#16161e] border border-slate-800 rounded-xl p-3 pl-10 text-slate-200 focus:border-amber-500 outline-none transition-colors text-sm"
                    placeholder="https://..."
                    value={state.productUrl}
                    onChange={e => setState(prev => ({ ...prev, productUrl: e.target.value }))}
                  />
                </div>
             </div>
             <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">{t.photos}</label>
                  <button 
                    onClick={handleSelectProductImages} 
                    disabled={state.productImages.length >= 7}
                    className="text-[10px] text-amber-500 font-bold uppercase disabled:opacity-30"
                  >
                    {t.addRef}
                  </button>
                </div>
                <div className="grid grid-cols-4 gap-1 h-12">
                  {state.productImages.slice(0, 4).map((img, i) => (
                    <ImageThumbnail 
                      key={i} 
                      img={img} 
                      onRemove={() => handleRemoveProductImage(i)}
                      onReplace={() => handleReplaceProductImage(i)}
                    />
                  ))}
                  {state.productImages.length === 0 && <div className="col-span-4 bg-[#16161e] rounded border border-dashed border-slate-800 flex items-center justify-center opacity-30"><span className="material-symbols-outlined text-xs">image</span></div>}
                </div>
             </div>
          </section>

          {/* REF Sections */}
          <section className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800/50">
             <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-tight">{t.refContext}</label>
                  <button 
                    onClick={handleSelectContextImages} 
                    disabled={state.contextImages.length >= 3}
                    className="text-[10px] text-amber-500 font-bold uppercase disabled:opacity-30"
                  >
                    {t.addRef}
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-1 h-12">
                  {state.contextImages.map((img, i) => (
                    <ImageThumbnail 
                      key={i} 
                      img={img} 
                      onRemove={() => handleRemoveContextImage(i)}
                      onReplace={() => handleReplaceContextImage(i)}
                    />
                  ))}
                  {state.contextImages.length === 0 && <div className="col-span-3 bg-[#16161e] rounded border border-dashed border-slate-800 flex items-center justify-center opacity-30"><span className="material-symbols-outlined text-xs">landscape</span></div>}
                </div>
             </div>
             <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-tight">{t.refDecor}</label>
                  <button 
                    onClick={handleSelectDecorImages} 
                    disabled={state.decorImages.length >= 3}
                    className="text-[10px] text-amber-500 font-bold uppercase disabled:opacity-30"
                  >
                    {t.addRef}
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-1 h-12">
                  {state.decorImages.map((img, i) => (
                    <ImageThumbnail 
                      key={i} 
                      img={img} 
                      onRemove={() => handleRemoveDecorImage(i)}
                      onReplace={() => handleReplaceDecorImage(i)}
                    />
                  ))}
                  {state.decorImages.length === 0 && <div className="col-span-3 bg-[#16161e] rounded border border-dashed border-slate-800 flex items-center justify-center opacity-30"><span className="material-symbols-outlined text-xs">chair</span></div>}
                </div>
             </div>
          </section>
        </div>

        {/* Center Col: DNA Locks */}
        <div className="lg:col-span-5 bg-[#121218] border border-slate-800 rounded-2xl p-6 shadow-xl overflow-hidden flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-amber-500 text-sm">lock</span>
            <h3 className="text-xs font-black text-slate-300 uppercase tracking-widest">{t.dnaLocks}</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            {[
              { field: 'features', label: t.features, icon: 'list_alt' },
              { field: 'benefits', label: t.benefits, icon: 'star' },
              { field: 'dimensions', label: t.dimensions, icon: 'straighten' },
              { field: 'colors', label: t.colors, icon: 'palette' },
              { field: 'materials', label: t.materials, icon: 'texture' },
              { field: 'brandStyle', label: t.styleLock, icon: 'auto_fix_high' }
            ].map(dnaItem => (
              <div key={dnaItem.field} className="space-y-1">
                <label className="flex items-center gap-1 text-[9px] font-bold text-slate-500 uppercase">
                  <span className="material-symbols-outlined text-[12px]">{dnaItem.icon}</span>
                  {dnaItem.label}
                </label>
                <input 
                  className="w-full bg-[#1c1c24] border border-slate-700 rounded-lg p-2 text-[11px] text-slate-300 outline-none focus:border-amber-500 transition-colors"
                  placeholder="..."
                  value={state.dna[dnaItem.field as keyof ProductDNA] || ''}
                  onChange={e => updateDnaField(dnaItem.field as keyof ProductDNA, e.target.value)}
                />
              </div>
            ))}
          </div>

          <div className="flex-1 space-y-1">
            <label className="flex items-center gap-1 text-[9px] font-bold text-amber-500 uppercase">
              <span className="material-symbols-outlined text-[12px]">accessibility_new</span>
              {t.anatomyLocks}
            </label>
            <textarea 
              className="w-full h-[calc(100%-20px)] bg-[#1c1c24] border border-slate-700 rounded-lg p-2 text-[11px] text-slate-300 outline-none focus:border-amber-500 transition-colors resize-none"
              placeholder={t.anatomyPlaceholder}
              value={state.dna.anatomyLocks || ''}
              onChange={e => updateDnaField('anatomyLocks', e.target.value)}
            />
          </div>
        </div>

        {/* Right Col: Settings */}
        <div className="lg:col-span-3 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">{t.category}</label>
              <select 
                className="w-full bg-[#16161e] border border-slate-800 rounded-lg p-2 text-xs text-slate-200 outline-none h-10"
                value={state.settings.category}
                onChange={e => setState(prev => ({ ...prev, settings: { ...prev.settings, category: e.target.value } }))}
              >
                {contentCategories.map(group => (
                  <optgroup key={group.group} label={group.group} className="text-slate-400 bg-[#0a0a0c]">
                    {group.items.map(item => (
                      <option key={item.id} value={item.name} className="text-slate-200">{item.name}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">{t.style}</label>
              <select 
                className="w-full bg-[#16161e] border border-slate-800 rounded-lg p-2 text-xs text-slate-200 outline-none h-10"
                value={state.settings.style}
                onChange={e => setState(prev => ({ ...prev, settings: { ...prev.settings, style: e.target.value } }))}
              >
                <option>Realistic</option>
                <option>Lifestyle</option>
                <option>Cinematic TVC</option>
                <option>High-Energy Social Ad</option>
                <option>Reels</option>
                <option>Review</option>
                <option>UGC</option>
                <option>Minimalist 3D</option>
                <option>Vibrant Anime</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">{t.duration}</label>
                <select className="w-full bg-[#16161e] border border-slate-800 rounded-lg p-2 text-xs text-slate-200" value={state.settings.duration} onChange={e => setState(prev => ({ ...prev, settings: { ...prev.settings, duration: e.target.value } }))}>
                  <option>15s</option><option>30s</option><option>60s</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">{t.aspect}</label>
                <select className="w-full bg-[#16161e] border border-slate-800 rounded-lg p-2 text-xs text-slate-200" value={state.settings.aspectRatio} onChange={e => setState(prev => ({ ...prev, settings: { ...prev.settings, aspectRatio: e.target.value as any } }))}>
                  <option value="16:9">16:9</option><option value="9:16">9:16</option><option value="1:1">1:1</option>
                </select>
              </div>
            </div>

            <div className="pt-2">
              <div className="flex justify-between items-center mb-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase">{t.character}</label>
                <button onClick={handleSelectCharacter} className="text-[9px] text-amber-500 hover:text-amber-400 font-bold uppercase">{t.select}</button>
              </div>
              <div className="flex items-center gap-3 p-2 bg-[#16161e] rounded-xl border border-slate-800 mb-2 group/char relative overflow-hidden">
                {state.characterImage ? (
                  <>
                    <img src={`data:${state.characterImage.mimeType};base64,${state.characterImage.base64}`} className="w-8 h-8 rounded-full object-cover" />
                    <button 
                      onClick={() => setState(prev => ({ ...prev, characterImage: null }))}
                      className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover/char:opacity-100 p-1 text-red-500 hover:text-red-400 transition-all"
                    >
                      <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                  </>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center"><span className="material-symbols-outlined text-slate-600 text-sm">person</span></div>
                )}
                <span className="text-[10px] text-slate-500 truncate pr-6">{state.characterImage?.name || t.noCharacter}</span>
              </div>
              <textarea 
                className="w-full bg-[#1c1c24] border border-slate-700 rounded-lg p-2 text-[10px] text-slate-300 outline-none focus:border-amber-500 transition-colors min-h-[60px]"
                placeholder={t.charDescPlaceholder}
                value={state.characterDescription}
                onChange={e => setState(prev => ({ ...prev, characterDescription: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              {['characters', 'textOnScreen', 'voiceOver', 'music'].map(id => (
                <label key={id} className="flex items-center gap-2 cursor-pointer group">
                  <input 
                    type="checkbox"
                    className="hidden"
                    checked={state.settings.toggles[id as keyof typeof state.settings.toggles]}
                    onChange={() => setState(prev => ({
                      ...prev,
                      settings: {
                        ...prev.settings,
                        toggles: { ...prev.settings.toggles, [id]: !prev.settings.toggles[id as keyof typeof prev.settings.toggles] }
                      }
                    }))}
                  />
                  <div className={`w-7 h-3.5 rounded-full p-0.5 transition-colors ${state.settings.toggles[id as keyof typeof state.settings.toggles] ? 'bg-amber-600' : 'bg-slate-800'}`}>
                    <div className={`w-2.5 h-2.5 bg-white rounded-full transition-transform ${state.settings.toggles[id as keyof typeof state.settings.toggles] ? 'translate-x-3.5' : 'translate-x-0'}`} />
                  </div>
                  <span className="text-[10px] text-slate-500 group-hover:text-slate-300 font-bold uppercase">{t.toggles[id as keyof typeof t.toggles]}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      <footer className="mt-auto pt-8 border-t border-slate-800 flex justify-end gap-4 relative">
        {loading && (
          <div className="absolute left-0 right-0 -top-12 px-4">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">{t.synthesizing}</span>
              <span className="text-[10px] font-mono text-amber-500">{progress}%</span>
            </div>
            <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-amber-600 transition-all duration-300 ease-out shadow-[0_0_10px_rgba(245,158,11,0.5)]"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
        <button 
          onClick={handleSubmit}
          disabled={loading}
          className="px-10 py-4 bg-amber-600 hover:bg-amber-500 text-white font-black rounded-xl transition-all disabled:opacity-50 flex items-center gap-3 shadow-xl shadow-amber-900/20 active:scale-95"
        >
          {loading ? (
            <>
              <span className="material-symbols-outlined animate-spin">refresh</span>
              {t.synthesizing}
            </>
          ) : (
            <>
              <span className="material-symbols-outlined">auto_awesome</span>
              {t.generate}
            </>
          )}
        </button>
      </footer>
    </div>
  );
};