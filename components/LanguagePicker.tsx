import React from 'react';
import { Language, translations } from '../lib/i18n';

interface Props {
  current: Language;
  onChange: (lang: Language) => void;
  variant?: 'ghost' | 'solid';
}

export const LanguagePicker: React.FC<Props> = ({ current, onChange, variant = 'solid' }) => {
  const languages: Language[] = ['vi', 'en', 'ko', 'ja', 'zh', 'fr', 'th'];

  return (
    <div className="flex items-center gap-1">
      <span className="material-symbols-outlined text-slate-500 text-sm">translate</span>
      <select 
        value={current}
        onChange={(e) => onChange(e.target.value as Language)}
        className={`bg-transparent text-xs font-bold outline-none cursor-pointer hover:text-amber-500 transition-colors ${
          variant === 'solid' ? 'bg-[#1c1c24] border border-slate-700 rounded px-2 py-1' : ''
        }`}
      >
        {languages.map(l => (
          <option key={l} value={l} className="bg-[#121218]">{translations[l].langName}</option>
        ))}
      </select>
    </div>
  );
};