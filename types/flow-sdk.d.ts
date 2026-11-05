declare module 'flow-sdk' {
  export interface MediaItem {
    mediaId: string;
    base64: string;
    mimeType: string;
    name?: string;
  }

  export interface GenerateTextOptions {
    images?: Array<{ base64: string; mimeType: string }>;
    thinkingLevel?: 'low' | 'medium' | 'high';
    systemInstruction?: string;
  }

  export interface GenerateImageOptions {
    prompt: string;
    referenceImageMediaIds?: string[];
    aspectRatio?: '16:9' | '9:16' | '1:1' | string;
    modelDisplayName?: string;
  }

  export interface GenerateVideoOptions {
    prompt: string;
    firstFrameImageMediaId?: string;
    modelDisplayName?: string;
    aspectRatio?: '16:9' | '9:16' | '1:1' | string;
    durationSeconds?: number;
  }

  export interface DownloadOptions {
    base64: string;
    mimeType: string;
    filename: string;
  }

  export namespace Flow {
    export namespace generate {
      export function text(prompt: string, options?: GenerateTextOptions): Promise<{ text: string }>;
      export function image(options: GenerateImageOptions): Promise<{ base64: string; mimeType: string; mediaId: string }>;
      export function video(options: GenerateVideoOptions): Promise<{ base64: string; mimeType: string }>;
    }

    export namespace media {
      export function select(options?: { filter?: string }): Promise<MediaItem | null>;
      export function selectMultiple(options?: { filter?: string; maxCount?: number }): Promise<MediaItem[]>;
    }

    export function download(options: DownloadOptions): Promise<void>;
  }
}
