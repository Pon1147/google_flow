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
  anatomyLocks: string; // New: Hard locks for proportions and spatial logic
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
