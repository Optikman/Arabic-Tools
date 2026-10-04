import React, { useState, useMemo } from 'react';
import {
  Copy,
  Download,
  Shuffle,
  Play,
  Check,
  Filter,
  Layers,
  Sparkles,
  ArrowUpDown,
  BookOpen,
} from 'lucide-react';
import { WordFrequencyItem } from '../types';
import { TOP_ARABIC_CORPUS_WORDS, getTopCorpusWords } from '../lib/arabicCorpus';

interface WordlistGeneratorViewProps {
  analyzedWords: WordFrequencyItem[];
  onStartTypingWithWordlist: (words: string[]) => void;
}

export const WordlistGeneratorView: React.FC<WordlistGeneratorViewProps> = ({
  analyzedWords,
  onStartTypingWithWordlist,
}) => {
  const [source, setSource] = useState<'corpus' | 'analyzed'>('corpus');
  const [targetCount, setTargetCount] = useState<number>(200);
  const [minLength, setMinLength] = useState<number>(2);
  const [maxLength, setMaxLength] = useState<number>(7);
  const [isShuffled, setIsShuffled] = useState<boolean>(true);
  const [copiedNotification, setCopiedNotification] = useState<string | null>(null);

  // Generate wordlist based on active source and filters
  const generatedWords = useMemo(() => {
    let pool: string[] = [];

    if (source === 'analyzed') {
      if (analyzedWords.length === 0) {
        // Fallback to corpus if analyzed is empty
        pool = [...TOP_ARABIC_CORPUS_WORDS];
      } else {
        pool = analyzedWords.map((item) => item.word);
      }
    } else {
      pool = [...TOP_ARABIC_CORPUS_WORDS];
    }

    // Apply length filtering
    let filtered = pool.filter((w) => w.length >= minLength && w.length <= maxLength);

    // Limit to target count
    let result = filtered.slice(0, targetCount);

    if (isShuffled) {
      result = [...result];
      for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
      }
    }

    return result;
  }, [source, analyzedWords, targetCount, minLength, maxLength, isShuffled]);

  // Copy helpers
  const handleCopy10FastFingers = () => {
    const singleLine = generatedWords.join(' ');
    navigator.clipboard.writeText(singleLine);
    setCopiedNotification('تم نسخ القائمة بتنسيق 10FastFingers (سطر واحد بمسافات)!');
    setTimeout(() => setCopiedNotification(null), 3000);
  };

  const handleCopyLines = () => {
    const lines = generatedWords.join('\n');
    navigator.clipboard.writeText(lines);
    setCopiedNotification('تم نسخ الكلمات سطراً بسطر!');
    setTimeout(() => setCopiedNotification(null), 3000);
  };

  const handleDownloadTxt = () => {
    const content = generatedWords.join(' ');
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `arabic_10fastfingers_wordlist_${targetCount}words.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const totalCharacters = generatedWords.reduce((acc, w) => acc + w.length, 0);
  const avgLength = generatedWords.length > 0 ? (totalCharacters / generatedWords.length).toFixed(1) : 0;

  return (
    <div className="space-y-6 text-right" dir="rtl">
      {/* Configuration Header Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 font-arabic flex items-center gap-2">
              <span>توليد وتخصيص قوائم كلمات 10FastFingers للطباعة السريعة</span>
            </h2>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
              <span>كلمات عربية نقية بدون تشكيل</span>
              <span aria-hidden="true">·</span>
              <span>متوافقة 100% مع 10FastFingers وMonkeytype</span>
              <span aria-hidden="true">·</span>
              <span>تحديد أطوال مريحة للأصابع</span>
            </div>
          </div>

          {/* Source Toggle buttons */}
          <div className="flex items-center p-1 bg-slate-100 rounded-lg text-xs font-medium">
            <button
              onClick={() => setSource('corpus')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
                source === 'corpus'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
              <span>المعجم العربي الشائع (2000 كلمة)</span>
            </button>
            <button
              onClick={() => setSource('analyzed')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
                source === 'analyzed'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-blue-600" />
              <span>من النص المحلل ({analyzedWords.length} كلمة)</span>
            </button>
          </div>
        </div>

        {/* Preset Count & Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Preset Buttons for standard tests */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              نماذج اختبارات 10FastFingers القياسية:
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
              {[50, 100, 200, 500, 1000].map((count) => (
                <button
                  key={count}
                  onClick={() => setTargetCount(count)}
                  className={`py-1.5 px-2 text-xs font-mono-nums font-semibold rounded-md border transition-colors ${
                    targetCount === count
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {count} كلمة
                </button>
              ))}
            </div>
            <div className="mt-2 text-[11px] text-slate-500">
              * (200 كلمة هي المعيار العالمي لاختبار 10FastFingers الأساسي)
            </div>
          </div>

          {/* Word Length Filtering */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              تصفية طول الكلمة (عدد الحروف):
            </label>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <span className="text-[11px] text-slate-500 block mb-1">الحد الأدنى: {minLength} أحرف</span>
                <input
                  type="range"
                  min={2}
                  max={6}
                  value={minLength}
                  onChange={(e) => setMinLength(parseInt(e.target.value, 10))}
                  className="w-full accent-emerald-600"
                />
              </div>
              <div className="flex-1">
                <span className="text-[11px] text-slate-500 block mb-1">الحد الأقصى: {maxLength} أحرف</span>
                <input
                  type="range"
                  min={4}
                  max={12}
                  value={maxLength}
                  onChange={(e) => setMaxLength(parseInt(e.target.value, 10))}
                  className="w-full accent-emerald-600"
                />
              </div>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              الكلمات بين 3 إلى 5 أحرف تعطي أعلى سرعة ودقة أثناء الطباعة
            </div>
          </div>

          {/* Ordering & Shuffle */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              ترتيب الكلمات وتدفق الاختبار:
            </label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsShuffled(!isShuffled)}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 text-xs font-medium rounded-lg border transition-colors ${
                  isShuffled
                    ? 'bg-blue-50 border-blue-200 text-blue-800'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Shuffle className="w-3.5 h-3.5" />
                <span>{isShuffled ? 'ترتيب عشوائي (محاكاة الاختبار)' : 'مرتب حسب الأكثر شيوعاً'}</span>
              </button>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              تفعيل الخلط يحاكي تتابع الكلمات في موقع 10FastFingers الحقيقي
            </div>
          </div>
        </div>

        {/* Action Bar for Copying and Starting Test */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-2 text-xs font-mono-nums text-slate-600">
            <span className="font-semibold text-slate-900">{generatedWords.length} كلمة جاهزة</span>
            <span aria-hidden="true">·</span>
            <span>{totalCharacters.toLocaleString()} حرف</span>
            <span aria-hidden="true">·</span>
            <span>متوسط {avgLength} حرف/كلمة</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleCopy10FastFingers}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-2xs transition-colors"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>نسخ بتنسيق 10FastFingers</span>
            </button>

            <button
              onClick={handleCopyLines}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>نسخ كقائمة أسطر</span>
            </button>

            <button
              onClick={handleDownloadTxt}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>تنزيل .txt</span>
            </button>

            <button
              onClick={() => onStartTypingWithWordlist(generatedWords)}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-lg shadow-sm transition-all"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>تدرب على هذه القائمة الآن</span>
            </button>
          </div>
        </div>

        {/* Copy Notification Toast */}
        {copiedNotification && (
          <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-lg text-xs text-emerald-800 font-medium flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-600" />
              {copiedNotification}
            </span>
          </div>
        )}
      </div>

      {/* Wordlist Visual Stream & Preview Box */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900 font-arabic">
            معاينة تدفق الكلمات (بدون أي تشكيل):
          </h3>
          <span className="text-xs text-slate-400">
            يمكنك نسخ النص مباشرة ولصقه في قسم Custom Test على 10fastfingers.com
          </span>
        </div>

        <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg max-h-72 overflow-y-auto scrollbar-thin">
          <p className="font-arabic text-base sm:text-lg leading-loose text-slate-800 tracking-normal select-all">
            {generatedWords.join(' ')}
          </p>
        </div>

        {/* Instruction Note */}
        <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-lg text-xs text-blue-900 leading-relaxed">
          <span className="font-bold ml-1">كيف تستخدم هذه القائمة على موقع 10FastFingers؟</span>
          اضغط على زر <span className="font-semibold text-slate-900">"نسخ بتنسيق 10FastFingers"</span> أعلاه، ثم افتح موقع 10FastFingers واختر <span className="font-semibold">"Custom Typing Test"</span>، والصق الكلمات في صندوق النص. جميع الكلمات منقحة لغوياً بدون أي تشكيل أو كشيدة لضمان تجربة كتابة سريعة وسلسة.
        </div>
      </div>
    </div>
  );
};
