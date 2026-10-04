import React, { useState, useMemo } from 'react';
import {
  Search,
  Upload,
  RotateCcw,
  SlidersHorizontal,
  Download,
  Copy,
  Check,
  Play,
  Layers,
  BarChart,
  HelpCircle,
} from 'lucide-react';
import {
  LetterFrequencyItem,
  NormalizationOptions,
  TextAnalysisStats,
  WordFrequencyItem,
} from '../types';
import { SAMPLE_TEXTS } from '../lib/arabicTokenizer';

interface TextAnalyzerViewProps {
  rawText: string;
  onTextChange: (newText: string) => void;
  normalizationOptions: NormalizationOptions;
  onNormalizationChange: (options: NormalizationOptions) => void;
  stats: TextAnalysisStats;
  wordFrequencies: WordFrequencyItem[];
  letterFrequencies: LetterFrequencyItem[];
  onSendToTypingTest: (words: string[]) => void;
}

export const TextAnalyzerView: React.FC<TextAnalyzerViewProps> = ({
  rawText,
  onTextChange,
  normalizationOptions,
  onNormalizationChange,
  stats,
  wordFrequencies,
  onSendToTypingTest,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [lengthFilter, setLengthFilter] = useState<'all' | '2-4' | '5-7' | '8+'>('all');
  const [minRepetitions, setMinRepetitions] = useState<number>(1);
  const [copiedNotification, setCopiedNotification] = useState<string | null>(null);
  const [showOptions, setShowOptions] = useState(false);

  // File upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        onTextChange(content);
      }
    };
    reader.readAsText(file);
  };

  // Filter word frequencies based on search and length
  const filteredWords = useMemo(() => {
    return wordFrequencies.filter((item) => {
      // Search term
      if (searchTerm.trim() && !item.word.includes(searchTerm.trim())) {
        return false;
      }
      // Minimum repetitions
      if (item.count < minRepetitions) {
        return false;
      }
      // Length filter
      if (lengthFilter === '2-4' && (item.length < 2 || item.length > 4)) return false;
      if (lengthFilter === '5-7' && (item.length < 5 || item.length > 7)) return false;
      if (lengthFilter === '8+' && item.length < 8) return false;

      return true;
    });
  }, [wordFrequencies, searchTerm, minRepetitions, lengthFilter]);

  // Export as CSV
  const handleExportCSV = () => {
    const headers = 'الترتيب,الكلمة,عدد التكرار,النسبة المئوية في النص,النسبة التراكمية,عدد الحروف,الترتيب في المعجم العربي الشائع\n';
    const rows = filteredWords
      .map(
        (w) =>
          `${w.rank},"${w.word}",${w.count},${w.percentage}%,${w.cumulativePercentage}%,${w.length},${w.corpusRank || 'غير مصنف'}`
      )
      .join('\n');
    const blob = new Blob(['\uFEFF' + headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `arabic_word_frequency_${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Copy list of filtered words
  const handleCopyWords = (asSpaceSeparated = true) => {
    const wordList = filteredWords.map((w) => w.word);
    const text = asSpaceSeparated ? wordList.join(' ') : wordList.join('\n');
    navigator.clipboard.writeText(text);
    setCopiedNotification(asSpaceSeparated ? 'تم نسخ الكلمات كسطر واحد!' : 'تم نسخ الكلمات أسطراً!');
    setTimeout(() => setCopiedNotification(null), 2500);
  };

  return (
    <div className="space-y-6 text-right" dir="rtl">
      {/* Top Banner & Text Input Container */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-semibold text-slate-900 font-arabic">
              إدخال النص العربي للتحليل وتجريد التشكيل
            </h2>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
              <span>إحصاء الكلمات</span>
              <span aria-hidden="true">·</span>
              <span>حساب التكرار والنسب المئوية</span>
              <span aria-hidden="true">·</span>
              <span>تجهيز القوائم للطباعة السريعة</span>
            </div>
          </div>

          {/* Quick Presets & Upload Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-500 font-medium ml-1">نماذج سريعة:</span>
            {SAMPLE_TEXTS.map((sample) => (
              <button
                key={sample.id}
                onClick={() => onTextChange(sample.content)}
                className="px-2.5 py-1 text-xs font-medium bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-md transition-colors"
                title={sample.category}
              >
                {sample.title}
              </button>
            ))}

            <label className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md cursor-pointer transition-colors">
              <Upload className="w-3.5 h-3.5" />
              <span>رفع ملف .txt</span>
              <input
                type="file"
                accept=".txt"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            {rawText && (
              <button
                onClick={() => onTextChange('')}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-md transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>مسح النص</span>
              </button>
            )}
          </div>
        </div>

        {/* Text Input Area */}
        <div className="relative">
          <textarea
            value={rawText}
            onChange={(e) => onTextChange(e.target.value)}
            placeholder="الصق أي نص عربي هنا لتحليله، حساب تكرار الكلمات، واستخراج قائمة مخصصة لاختبارات السرعة 10FastFingers..."
            rows={6}
            className="w-full p-3.5 text-base font-arabic leading-relaxed bg-slate-50/60 border border-slate-200 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100 rounded-lg outline-none transition-all placeholder:text-slate-400"
          />
          <div className="absolute bottom-3 left-3 text-xs font-mono-nums text-slate-500 bg-white/90 px-2 py-0.5 rounded border border-slate-200 shadow-2xs pointer-events-none">
            {stats.totalWords.toLocaleString()} كلمة · {stats.totalCharactersWithSpaces.toLocaleString()} حرف
          </div>
        </div>

        {/* Normalization & Processing Toggles */}
        <div className="pt-1">
          <button
            onClick={() => setShowOptions(!showOptions)}
            className="flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-600" />
            <span>خيارات تجريد التشكيل والمعالجة اللغوية</span>
            <span className="text-slate-400 text-[11px]">({showOptions ? 'إخفاء' : 'عرض'})</span>
          </button>

          {showOptions && (
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 p-3.5 bg-slate-50 rounded-lg border border-slate-200 text-xs">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={normalizationOptions.stripTashkeel}
                  onChange={(e) =>
                    onNormalizationChange({
                      ...normalizationOptions,
                      stripTashkeel: e.target.checked,
                    })
                  }
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <div>
                  <div className="font-semibold text-slate-800">حذف التشكيل (الحركات)</div>
                  <div className="text-[11px] text-slate-500">حذف الفتحة والضمة والكسرة والسكون والشدة</div>
                </div>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={normalizationOptions.stripTatweel}
                  onChange={(e) =>
                    onNormalizationChange({
                      ...normalizationOptions,
                      stripTatweel: e.target.checked,
                    })
                  }
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <div>
                  <div className="font-semibold text-slate-800">حذف التطويل / الكشيدة (ـ)</div>
                  <div className="text-[11px] text-slate-500">إزالة علامات المد لتجانس الكلمات</div>
                </div>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={normalizationOptions.normalizeHamza}
                  onChange={(e) =>
                    onNormalizationChange({
                      ...normalizationOptions,
                      normalizeHamza: e.target.checked,
                    })
                  }
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <div>
                  <div className="font-semibold text-slate-800">توحيد الهمزات (أ، إ، آ ← ا)</div>
                  <div className="text-[11px] text-slate-500">لدمج تصاريف الكلمة الواحدة في التردد</div>
                </div>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={normalizationOptions.removeNonArabic}
                  onChange={(e) =>
                    onNormalizationChange({
                      ...normalizationOptions,
                      removeNonArabic: e.target.checked,
                    })
                  }
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <div>
                  <div className="font-semibold text-slate-800">تجاهل الرموز غير العربية</div>
                  <div className="text-[11px] text-slate-500">استبعاد الأرقام والرموز وعلامات الترقيم</div>
                </div>
              </label>
            </div>
          )}
        </div>
      </div>

      {/* Statistical Dashboard Cards (Tabular metrics without pill clutter) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="text-xs font-medium text-slate-500">إجمالي الكلمات</div>
          <div className="mt-1 text-2xl font-bold font-mono-nums text-slate-900">
            {stats.totalWords.toLocaleString()}
          </div>
          <div className="mt-1 text-[11px] text-slate-400">عدد الكلمات المفحوصة</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="text-xs font-medium text-slate-500">الكلمات الفريدة</div>
          <div className="mt-1 text-2xl font-bold font-mono-nums text-emerald-600">
            {stats.uniqueWords.toLocaleString()}
          </div>
          <div className="mt-1 text-[11px] text-slate-400">مفردات مميزة غير مكررة</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="text-xs font-medium text-slate-500">التنوع المعجمي (TTR)</div>
          <div className="mt-1 text-2xl font-bold font-mono-nums text-blue-600">
            {stats.lexicalDiversity}%
          </div>
          <div className="mt-1 text-[11px] text-slate-400">نسبة الكلمات الجديدة إلى الإجمالي</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="text-xs font-medium text-slate-500">إجمالي الحروف العربية</div>
          <div className="mt-1 text-2xl font-bold font-mono-nums text-amber-600">
            {stats.totalLetters.toLocaleString()}
          </div>
          <div className="mt-1 text-[11px] text-slate-400">معدل الطول: {stats.avgWordLength} حرف/كلمة</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs col-span-2 sm:col-span-1">
          <div className="text-xs font-medium text-slate-500">الكلمة الأكثر تكراراً</div>
          <div className="mt-1 text-xl font-bold font-arabic text-purple-700 truncate">
            {stats.topWord || '—'}
          </div>
          <div className="mt-1 text-[11px] text-slate-400 font-mono-nums">
            تكررت {stats.topWordRepetitions} مرة (
            {stats.totalWords > 0
              ? ((stats.topWordRepetitions / stats.totalWords) * 100).toFixed(1)
              : 0}
            %)
          </div>
        </div>
      </div>

      {/* Main Analysis Results & Frequency Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {/* Table Header & Controls Bar */}
        <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <h3 className="font-semibold text-slate-900 font-arabic text-sm sm:text-base">
              جدول تكرار الكلمات والنسبة المئوية
            </h3>
            <span className="text-xs text-slate-500 font-mono-nums">
              ({filteredWords.length} كلمة معروضة من أصل {wordFrequencies.length})
            </span>
          </div>

          {/* Interactive Filters & Search */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Search filter */}
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ابحث عن كلمة..."
                className="w-36 sm:w-44 pr-8 pl-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:border-emerald-500 focus:outline-none"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
            </div>

            {/* Length segmented button filter */}
            <div className="flex items-center p-0.5 bg-slate-200/80 rounded-lg text-xs font-medium">
              <button
                onClick={() => setLengthFilter('all')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  lengthFilter === 'all'
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                كل الأطوال
              </button>
              <button
                onClick={() => setLengthFilter('2-4')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  lengthFilter === '2-4'
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="مناسبة للطباعة فائقة السرعة"
              >
                2-4 حروف
              </button>
              <button
                onClick={() => setLengthFilter('5-7')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  lengthFilter === '5-7'
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="طول متوسط متوازن"
              >
                5-7 حروف
              </button>
              <button
                onClick={() => setLengthFilter('8+')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  lengthFilter === '8+'
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="كلمات طويلة لاختبار الدقة"
              >
                8+ حروف
              </button>
            </div>

            {/* Minimum Repetitions Filter */}
            <select
              value={minRepetitions}
              onChange={(e) => setMinRepetitions(parseInt(e.target.value, 10))}
              className="bg-white border border-slate-200 text-slate-700 text-xs rounded-lg px-2.5 py-1.5 focus:border-emerald-500 focus:outline-none"
            >
              <option value="1">تكرار ≥ 1</option>
              <option value="2">تكرار ≥ 2</option>
              <option value="3">تكرار ≥ 3</option>
              <option value="5">تكرار ≥ 5</option>
            </select>

            {/* Action buttons */}
            <button
              onClick={() => handleCopyWords(true)}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg transition-colors"
              title="نسخ الكلمات مفصولة بمسافات لـ 10FastFingers"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>نسخ كسطر 10FastFingers</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg transition-colors"
              title="تصدير جدول التردد بتنسيق CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>تصدير CSV</span>
            </button>

            {filteredWords.length > 0 && (
              <button
                onClick={() => onSendToTypingTest(filteredWords.slice(0, 100).map((w) => w.word))}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors shadow-2xs"
                title="بدء اختبار سرعة الطباعة بأول 100 كلمة من القائمة الحالية"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>تدرب على هذه القائمة</span>
              </button>
            )}
          </div>
        </div>

        {/* Copy Notification Toast */}
        {copiedNotification && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-4 py-2 text-xs text-emerald-800 font-medium flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-600" />
              {copiedNotification}
            </span>
          </div>
        )}

        {/* Table View */}
        {filteredWords.length === 0 ? (
          <div className="py-16 text-center text-slate-500">
            <Layers className="w-10 h-10 mx-auto text-slate-300 mb-2 stroke-1" />
            <p className="text-sm font-arabic">لا توجد كلمات مطابقة للمعايير أو النص فارغ</p>
            <p className="text-xs text-slate-400 mt-1">
              أدخل نصاً في المربع أعلاه أو اختر أحد النصوص الجاهزة لبدء التحليل
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto max-h-[520px] scrollbar-thin">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-100/80 text-slate-700 font-semibold sticky top-0 border-b border-slate-200 z-10">
                <tr>
                  <th className="py-2.5 px-3 w-16">الترتيب</th>
                  <th className="py-2.5 px-3">الكلمة (بدون تشكيل)</th>
                  <th className="py-2.5 px-3 text-center">عدد التكرار</th>
                  <th className="py-2.5 px-3 text-center">النسبة في النص</th>
                  <th className="py-2.5 px-3 text-center">النسبة التراكمية</th>
                  <th className="py-2.5 px-3 text-center">طول الكلمة</th>
                  <th className="py-2.5 px-3">الشيوع في اللغة العربية (Corpus)</th>
                  <th className="py-2.5 px-3 text-center w-28">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-arabic">
                {filteredWords.map((item) => (
                  <tr key={item.word} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="py-2.5 px-3 font-mono-nums text-slate-400 font-medium">
                      #{item.rank}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="text-base font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors">
                        {item.word}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono-nums font-bold text-slate-800">
                      {item.count.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono-nums text-slate-600">
                      {item.percentage}%
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono-nums text-slate-500">
                      <div className="flex items-center justify-center gap-1.5">
                        <span>{item.cumulativePercentage}%</span>
                        <div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden hidden sm:block">
                          <div
                            className="h-full bg-emerald-500 rounded-full"
                            style={{ width: `${Math.min(100, item.cumulativePercentage)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono-nums text-slate-600">
                      {item.length} أحرف
                    </td>
                    <td className="py-2.5 px-3">
                      {item.corpusRank ? (
                        <div className="flex items-center gap-1.5 text-xs">
                          <span className="text-emerald-700 font-medium font-mono-nums">
                            المرتبة #{item.corpusRank}
                          </span>
                          <span className="text-slate-400">·</span>
                          <span className="text-slate-500">{item.corpusFrequencyCategory}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[11px]">نادرة / خاصة بالنص</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(item.word);
                          setCopiedNotification(`تم نسخ الكلمة: "${item.word}"`);
                          setTimeout(() => setCopiedNotification(null), 2000);
                        }}
                        className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors inline-flex items-center"
                        title="نسخ الكلمة"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
