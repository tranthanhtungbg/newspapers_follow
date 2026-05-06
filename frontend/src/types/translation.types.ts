// =============================================================
// LingoReader — Translation Types
// =============================================================

export interface TranslationResult {
  translation: string;
  partOfSpeech: 'noun' | 'verb' | 'adj' | 'adv' | 'phrase' | 'other';
  ipa: string;
  contextMeaning: string;
  alternativeMeanings: string[];
  examples: TranslationExample[];
  collocations: string[];
  register: 'formal' | 'informal' | 'neutral' | 'technical';
}

export interface TranslationExample {
  en: string;
  [targetLang: string]: string;
}

export interface ContextualTranslationRequest {
  text: string;
  sourceLang: string;
  targetLang: string;
  contextParagraph: string;
  articleId?: string;
}

export interface Language {
  code: string;
  name: string;
  nativeName: string;
  flagEmoji: string;
  isRtl: boolean;
  isActive: boolean;
  sortOrder: number;
}
