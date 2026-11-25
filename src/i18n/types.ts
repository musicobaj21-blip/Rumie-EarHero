export type Language = 'es' | 'en' | 'pt';

export const SUPPORTED_LANGUAGES: {
  code: Language;
  shortLabel: string;
  nativeLabel: string;
}[] = [
  { code: 'es', shortLabel: 'ES', nativeLabel: 'Español' },
  { code: 'en', shortLabel: 'EN', nativeLabel: 'English' },
  { code: 'pt', shortLabel: 'PT', nativeLabel: 'Português' },
];
