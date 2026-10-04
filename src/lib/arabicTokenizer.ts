import {
  LetterFrequencyItem,
  NormalizationOptions,
  TextAnalysisStats,
  WordFrequencyItem,
} from '../types';
import { getCorpusFrequencyCategory, getCorpusWordRank } from './arabicCorpus';

// Arabic Tashkeel (Diacritics) Unicode block: \u064B - \u065F, \u0670 (superscript alef)
const TASHKEEL_REGEX = /[\u064B-\u065F\u0670\u06D6-\u06ED]/g;
// Tatweel / Kashida: \u0640
const TATWEEL_REGEX = /[\u0640]/g;
// Invisible zero-width chars
const INVISIBLE_CHARS_REGEX = /[\u200B-\u200F\uFEFF\u202A-\u202E]/g;

export const DEFAULT_NORMALIZATION_OPTIONS: NormalizationOptions = {
  stripTashkeel: true,
  stripTatweel: true,
  normalizeHamza: false, // Keep precise orthography by default or toggle
  normalizeYaa: false,
  normalizeTaaMarbuta: false,
  removeNonArabic: true,
};

/**
 * Strips all Arabic diacritics / vocalization (harakat)
 */
export function stripTashkeel(text: string): string {
  if (!text) return '';
  return text.replace(TASHKEEL_REGEX, '').replace(INVISIBLE_CHARS_REGEX, '');
}

/**
 * Strips tatweel / kashida (ـ)
 */
export function stripTatweel(text: string): string {
  if (!text) return '';
  return text.replace(TATWEEL_REGEX, '');
}

/**
 * Comprehensive normalization engine
 */
export function normalizeArabicWord(
  word: string,
  options: Partial<NormalizationOptions> = {}
): string {
  const opts = { ...DEFAULT_NORMALIZATION_OPTIONS, ...options };
  let result = word;

  if (opts.stripTashkeel) {
    result = stripTashkeel(result);
  }
  if (opts.stripTatweel) {
    result = stripTatweel(result);
  }
  if (opts.normalizeHamza) {
    // Standardize all forms of Alef/Hamza to bare Alef
    result = result.replace(/[إأآٱ]/g, 'ا').replace(/[ؤئ]/g, 'ء');
  }
  if (opts.normalizeYaa) {
    result = result.replace(/ى/g, 'ي');
  }
  if (opts.normalizeTaaMarbuta) {
    result = result.replace(/ة/g, 'ه');
  }
  if (opts.removeNonArabic) {
    // Keep only Arabic characters
    result = result.replace(/[^\u0600-\u06FF]/g, '');
  }

  return result.trim();
}

/**
 * Normalizes full Arabic text
 */
export function normalizeArabicText(
  text: string,
  options: Partial<NormalizationOptions> = {}
): string {
  if (!text) return '';
  const opts = { ...DEFAULT_NORMALIZATION_OPTIONS, ...options };

  let processed = text;
  if (opts.stripTashkeel) {
    processed = stripTashkeel(processed);
  }
  if (opts.stripTatweel) {
    processed = stripTatweel(processed);
  }
  if (opts.normalizeHamza) {
    processed = processed.replace(/[إأآٱ]/g, 'ا').replace(/[ؤئ]/g, 'ء');
  }
  if (opts.normalizeYaa) {
    processed = processed.replace(/ى/g, 'ي');
  }
  if (opts.normalizeTaaMarbuta) {
    processed = processed.replace(/ة/g, 'ه');
  }

  return processed;
}

/**
 * Tokenizes text into a clean array of Arabic words
 */
export function tokenizeArabic(
  text: string,
  options: Partial<NormalizationOptions> = {}
): string[] {
  if (!text || !text.trim()) return [];
  const normalized = normalizeArabicText(text, options);

  // Split on whitespace and non-Arabic punctuation
  const rawTokens = normalized.split(/[\s\r\n\t,.;:!?،؟؛«»"()\[\]{}\/\\—–\-_+=*&^%$#@~`|<>]+/);

  const cleanTokens: string[] = [];
  for (const token of rawTokens) {
    // Keep only tokens containing Arabic letters
    const cleaned = token.replace(/[^\u0600-\u06FF]/g, '').trim();
    if (cleaned.length > 0) {
      cleanTokens.push(cleaned);
    }
  }

  return cleanTokens;
}

/**
 * Arabic alphabet mapping with standard Arabic 101/102 keyboard layout rows
 */
export const ARABIC_ALPHABET_METADATA: {
  char: string;
  nameAr: string;
  nameEn: string;
  row: 'home' | 'top' | 'bottom' | 'extra';
}[] = [
  { char: 'ا', nameAr: 'ألف', nameEn: 'Alef', row: 'home' },
  { char: 'ب', nameAr: 'باء', nameEn: 'Baa', row: 'bottom' },
  { char: 'ت', nameAr: 'تاء', nameEn: 'Taa', row: 'home' },
  { char: 'ث', nameAr: 'ثاء', nameEn: 'Thaa', row: 'top' },
  { char: 'ج', nameAr: 'جيم', nameEn: 'Jeem', row: 'top' },
  { char: 'ح', nameAr: 'حاء', nameEn: 'Haa', row: 'top' },
  { char: 'خ', nameAr: 'خاء', nameEn: 'Khaa', row: 'top' },
  { char: 'د', nameAr: 'دال', nameEn: 'Daal', row: 'top' },
  { char: 'ذ', nameAr: 'ذال', nameEn: 'Dhaal', row: 'extra' },
  { char: 'ر', nameAr: 'راء', nameEn: 'Raa', row: 'bottom' },
  { char: 'ز', nameAr: 'زاي', nameEn: 'Zay', row: 'bottom' },
  { char: 'س', nameAr: 'سين', nameEn: 'Seen', row: 'home' },
  { char: 'ش', nameAr: 'شين', nameEn: 'Sheen', row: 'home' },
  { char: 'ص', nameAr: 'صاد', nameEn: 'Saad', row: 'top' },
  { char: 'ض', nameAr: 'ضاد', nameEn: 'Daad', row: 'top' },
  { char: 'ط', nameAr: 'طاء', nameEn: 'Taa (heavy)', row: 'home' },
  { char: 'ظ', nameAr: 'ظاء', nameEn: 'Dhaa (heavy)', row: 'bottom' },
  { char: 'ع', nameAr: 'عين', nameEn: 'Ayn', row: 'top' },
  { char: 'غ', nameAr: 'غين', nameEn: 'Ghayn', row: 'top' },
  { char: 'ف', nameAr: 'فاء', nameEn: 'Faa', row: 'top' },
  { char: 'ق', nameAr: 'قاف', nameEn: 'Qaaf', row: 'top' },
  { char: 'ك', nameAr: 'كاف', nameEn: 'Kaaf', row: 'home' },
  { char: 'ل', nameAr: 'لام', nameEn: 'Laam', row: 'home' },
  { char: 'م', nameAr: 'ميم', nameEn: 'Meem', row: 'home' },
  { char: 'ن', nameAr: 'نون', nameEn: 'Noon', row: 'home' },
  { char: 'ه', nameAr: 'هاء', nameEn: 'Haa (soft)', row: 'top' },
  { char: 'و', nameAr: 'واو', nameEn: 'Waaw', row: 'bottom' },
  { char: 'ي', nameAr: 'ياء', nameEn: 'Yaa', row: 'bottom' },
  { char: 'ة', nameAr: 'تاء مربوطة', nameEn: 'Taa Marbuta', row: 'bottom' },
  { char: 'ى', nameAr: 'ألف مقصورة', nameEn: 'Alef Maqsura', row: 'bottom' },
  { char: 'ء', nameAr: 'همزة منفردة', nameEn: 'Hamza', row: 'bottom' },
  { char: 'أ', nameAr: 'ألف مهموزة (أ)', nameEn: 'Alef with Hamza above', row: 'home' },
  { char: 'إ', nameAr: 'ألف مهموزة (إ)', nameEn: 'Alef with Hamza below', row: 'top' },
  { char: 'آ', nameAr: 'ألف مدة', nameEn: 'Alef with Madda', row: 'extra' },
  { char: 'ؤ', nameAr: 'واو مهموزة', nameEn: 'Waw with Hamza', row: 'bottom' },
  { char: 'ئ', nameAr: 'ياء مهموزة', nameEn: 'Yaa with Hamza', row: 'bottom' },
];

/**
 * Calculates statistical metrics, word frequency distribution, and letter frequency
 */
export function calculateTextStats(
  text: string,
  options: Partial<NormalizationOptions> = {}
): {
  stats: TextAnalysisStats;
  wordFrequencies: WordFrequencyItem[];
  letterFrequencies: LetterFrequencyItem[];
} {
  const words = tokenizeArabic(text, options);
  const totalWords = words.length;

  if (totalWords === 0) {
    return {
      stats: {
        totalWords: 0,
        uniqueWords: 0,
        totalLetters: 0,
        totalCharactersWithSpaces: text.length,
        avgWordLength: 0,
        lexicalDiversity: 0,
        longestWord: '-',
        shortestWord: '-',
        topWord: '-',
        topWordRepetitions: 0,
      },
      wordFrequencies: [],
      letterFrequencies: [],
    };
  }

  // Count word frequencies
  const wordCountMap = new Map<string, number>();
  let totalLettersInWords = 0;
  let longestWord = words[0];
  let shortestWord = words[0];

  for (const word of words) {
    const count = (wordCountMap.get(word) || 0) + 1;
    wordCountMap.set(word, count);

    totalLettersInWords += word.length;
    if (word.length > longestWord.length) longestWord = word;
    if (word.length < shortestWord.length) shortestWord = word;
  }

  // Convert to sorted frequency array
  const sortedEntries = Array.from(wordCountMap.entries()).sort((a, b) => {
    // Sort by count descending, then alphabetically
    if (b[1] !== a[1]) return b[1] - a[1];
    return a[0].localeCompare(b[0]);
  });

  let runningCumulative = 0;
  const wordFrequencies: WordFrequencyItem[] = sortedEntries.map(([word, count], index) => {
    const percentage = Number(((count / totalWords) * 100).toFixed(2));
    runningCumulative += percentage;
    const corpusRank = getCorpusWordRank(word);

    return {
      word,
      count,
      percentage,
      cumulativePercentage: Math.min(100, Number(runningCumulative.toFixed(2))),
      length: word.length,
      rank: index + 1,
      corpusRank,
      corpusFrequencyCategory: getCorpusFrequencyCategory(corpusRank),
    };
  });

  // Calculate Letter Frequencies
  const letterCountMap = new Map<string, number>();
  let totalArabicLetters = 0;

  for (const word of words) {
    for (const char of word) {
      if (char >= '\u0600' && char <= '\u06FF') {
        const count = (letterCountMap.get(char) || 0) + 1;
        letterCountMap.set(char, count);
        totalArabicLetters++;
      }
    }
  }

  const letterFrequencies: LetterFrequencyItem[] = ARABIC_ALPHABET_METADATA.map((meta) => {
    const count = letterCountMap.get(meta.char) || 0;
    const percentage = totalArabicLetters > 0 ? Number(((count / totalArabicLetters) * 100).toFixed(2)) : 0;
    return {
      letter: meta.char,
      nameAr: meta.nameAr,
      nameEn: meta.nameEn,
      count,
      percentage,
      keyboardRow: meta.row,
    };
  })
    .filter((item) => item.count > 0 || ['ا', 'ل', 'م', 'ي', 'و', 'ن', 'ر', 'ب', 'ت', 'س'].includes(item.letter))
    .sort((a, b) => b.count - a.count);

  const uniqueWords = wordCountMap.size;
  const avgWordLength = Number((totalLettersInWords / totalWords).toFixed(2));
  const lexicalDiversity = Number(((uniqueWords / totalWords) * 100).toFixed(1));

  const topWordEntry = sortedEntries[0] || ['-', 0];

  return {
    stats: {
      totalWords,
      uniqueWords,
      totalLetters: totalLettersInWords,
      totalCharactersWithSpaces: text.length,
      avgWordLength,
      lexicalDiversity,
      longestWord,
      shortestWord,
      topWord: topWordEntry[0],
      topWordRepetitions: topWordEntry[1],
    },
    wordFrequencies,
    letterFrequencies,
  };
}

/**
 * Realistic Arabic sample texts for immediate testing
 */
export const SAMPLE_TEXTS = [
  {
    id: 'typing-practice',
    title: 'نص تدريب 10FastFingers (الطباعة السريعة)',
    category: 'سرعة الطباعة',
    content: `في هذا اليوم الجميل يتدرب الكثير من الناس على سرعة الطباعة باللغة العربية لأن لوحة المفاتيح أصبحت الوسيلة الأساسية في التواصل والعمل اليومي. إن ممارسة كتابة الكلمات الأكثر شيوعا تساعد الأصابع على التحرك بمرونة وسلاسة فائقة، مما يرفع معدل الكلمات في الدقيقة الواحدة ويقلل الأخطاء الشائعة. مع الاستمرار والتركيز يمكن لكل متعلم تحقيق سرعة عالية وإتقان كامل للكتابة بدون النظر إلى المفاتيح. العلم والمعرفة والتدريب المستمر هي مفاتيح النجاح في عالم التكنولوجيا الحديثة. عندما تكتب بسرعة ودقة تشعر بالثقة والإنجاز، وتبدأ الأفكار تتدفق على الشاشة بحرية وسهولة ويسر دون أي عائق أو تردد.`,
  },
  {
    id: 'modern-tech',
    title: 'الذكاء الاصطناعي ومستقبل اللغة العربية',
    category: 'تكنولوجيا ومعرفة',
    content: `يشهد العالم اليوم ثورة علمية وتقنية هائلة يقودها الذكاء الاصطناعي وتطبيقات معالجة اللغات الطبيعية. تمتلك اللغة العربية مكانة رفيعة وثراء لغويا فريدا بفضل جذورها الاشتقاقية وتنوع مفرداتها وقدرتها البلاغية العظيمة. تسعى النظم الحديثة إلى فهم النصوص وتحليل تردد الكلمات واستخراج المعاني الدقيقة وتوليد المحتوى الإبداعي بأسلوب راق ومتقن. إن بناء قواعد بيانات دقيقة وخوارزميات سريعة يفتح آفاقا واسعة لتمكين العربية في المنصات الرقمية ومحركات البحث والتطبيقات التعليمية المتطورة.`,
  },
  {
    id: 'literature-prose',
    title: 'خواطر في القراءة والإبداع الأدبي',
    category: 'أدب وفكر',
    content: `القراءة نافذة الروح ومفتاح العقل وباب الحكمة الواسع. عندما يفتح القارئ صفحات كتاب جديد يسافر عبر الزمان والمكان ويتعرف على تجارب الأمم والشعوب وأفكار الفلاسفة والعلماء. الكلمة الطيبة شجرة مثمرة جذورها ثابتة وفرعها في السماء، والفكر الحر يبني المجتمعات ويرتقي بالإنسان إلى مراتب المجد والفضيلة. ليس هناك كنز أثمن من فكرة ملهمة تنير درب الحائرين وتبث الأمل في قلوب المخلصين. فلتكن القراءة رفيقة دربك وسلاحك في مواجهة الجهل والتحديات.`,
  },
];
