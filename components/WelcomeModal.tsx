import React from 'react';
import { Language, translations } from '../lib/i18n';
import { LanguagePicker } from './LanguagePicker';

export const WelcomeModal: React.FC<{ 
  onStart: () => void; 
  lang: Language; 
  onLangChange: (l: Language) => void 
}> = ({ onStart, lang, onLangChange }) => {
  const t = translations[lang];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="max-w-2xl w-full bg-[#121218] border border-slate-800 rounded-2xl p-8 shadow-2xl relative">
        <div className="absolute top-8 right-8">
          <LanguagePicker current={lang} onChange={onLangChange} />
        </div>

        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center justify-center">
            <span className="material-symbols-outlined text-amber-400 text-4xl">movie_edit</span>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">OmniScript AI</h1>
            <p className="text-slate-400 text-sm uppercase tracking-widest">{t.subtitle}</p>
          </div>
        </div>

        <div className="space-y-4 mb-8">
          <div className="flex gap-4">
            <span className="material-symbols-outlined text-amber-500">dna</span>
            <div>
              <p className="font-semibold text-slate-200">{t.analysis}</p>
              <p className="text-sm text-slate-400">{t.analysisDesc}</p>
            </div>
          </div>
          <div className="flex gap-4">
            <span className="material-symbols-outlined text-amber-500">grid_view</span>
            <div>
              <p className="font-semibold text-slate-200">{t.storyboardView}</p>
              <p className="text-sm text-slate-400">{t.storyboardDesc}</p>
            </div>
          </div>
          <div className="flex gap-4">
            <span className="material-symbols-outlined text-amber-500">play_circle</span>
            <div>
              <p className="font-semibold text-slate-200">{t.animaticDesc}</p>
              <p className="text-sm text-slate-400">{t.animaticDesc}</p>
            </div>
          </div>
        </div>

        <button 
          onClick={onStart}
          className="w-full py-4 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-amber-900/20 flex items-center justify-center gap-2 group"
        >
          {t.init}
          <span className="material-symbols-outlined transition-transform group-hover:translate-x-1">arrow_forward</span>
        </button>
      </div>
    </div>
  );
};