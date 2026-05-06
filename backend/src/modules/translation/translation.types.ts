export interface TranslationResult {
  translation: string;
  partOfSpeech: 'noun' | 'verb' | 'adj' | 'adv' | 'phrase' | 'other';
  ipa: string;
  contextMeaning: string;
  alternativeMeanings: string[];
  examples: Array<{ en: string; [lang: string]: string }>;
  collocations: string[];
  register: 'formal' | 'informal' | 'neutral' | 'technical';
}
