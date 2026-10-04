export interface WordFrequencyItem {
  word: string;
  count: number;
  percentage: number; // e.g. 2.45 (%)
  cumulativePercentage: number;
  length: number;
  rank: number;
  corpusRank?: number; // Rank in top Modern Standard Arabic frequency corpus
  corpusFrequencyCategory?: 'Top 100' | 'Top 500' | 'Top 1000' | 'Top 2000' | 'Infrequent';
}

export interface LetterFrequencyItem {
  letter: string;
  nameAr: string;
  nameEn: string;
  count: number;
  percentage: number;
  keyboardRow: 'home' | 'top' | 'bottom' | 'extra';
}

export interface TextAnalysisStats {
  totalWords: number;
  uniqueWords: number;
  totalLetters: number;
  totalCharactersWithSpaces: number;
  avgWordLength: number;
  lexicalDiversity: number; // Type-Token Ratio (unique/total * 100)
  longestWord: string;
  shortestWord: string;
  topWord: string;
  topWordRepetitions: number;
}

export interface NormalizationOptions {
  stripTashkeel: boolean; // Tashkeel / Harakat (Fatha, Damma, Kasra, etc.)
  stripTatweel: boolean; // Kashida ـ
  normalizeHamza: boolean; // أ إ آ ء ؤ ئ -> ا
  normalizeYaa: boolean; // ى -> ي
  normalizeTaaMarbuta: boolean; // ة -> ه
  removeNonArabic: boolean; // Filter out digits, Latin letters, symbols
}

export interface TypingWord {
  id: number;
  text: string;
  status: 'pending' | 'current' | 'correct' | 'incorrect';
  typedText: string;
}

export interface TypingResults {
  wpm: number;
  netWpm: number;
  accuracy: number;
  cpm: number;
  correctWords: number;
  incorrectWords: number;
  totalKeystrokes: number;
  correctKeystrokes: number;
  incorrectKeystrokes: number;
  timeDuration: number;
  missedWordsList: { original: string; typed: string }[];
}
