import phase1 from '../../content/phase1.json';
import type { Level } from '../difficulty';

export interface VocabularyEntry {
  pt: string;
  en: string;
  level: Level;
}

export const VOCABULARY = phase1.vocabulary as readonly VocabularyEntry[];

export function lettersOf(word: string): string[] {
  return Array.from(word.normalize('NFC')).filter((ch) => ch !== ' ');
}
