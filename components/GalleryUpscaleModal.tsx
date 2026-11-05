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
      // Fallback if clipboard API is restricted in iframe
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
            {/* Media ID Box */}
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

            {/* Step-by-Step Flow Instructions */}
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

            {/* Action Button */}
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
