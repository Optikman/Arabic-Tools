import React, { useState } from 'react';
import {
  Sparkles,
  Play,
  Copy,
  Check,
  Loader2,
  FileText,
  Sliders,
  AlertCircle,
  BookOpen,
} from 'lucide-react';

interface AiAssistantViewProps {
  onStartTypingWithWordlist: (words: string[]) => void;
  onApplyTextToAnalyzer: (text: string) => void;
}

export const AiAssistantView: React.FC<AiAssistantViewProps> = ({
  onStartTypingWithWordlist,
  onApplyTextToAnalyzer,
}) => {
  // Mode selection
  const [activeMode, setActiveMode] = useState<'wordlist' | 'paragraph'>('wordlist');

  // Wordlist generator state
  const [wordCount, setWordCount] = useState<number>(100);
  const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  const [theme, setTheme] = useState<string>('حياة يومية وتواصل عام');
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedWords, setGeneratedWords] = useState<string[]>([]);
  const [copiedNotification, setCopiedNotification] = useState<string | null>(null);

  // Paragraph generator state
  const [paragraphLength, setParagraphLength] = useState<'short' | 'medium' | 'long'>('medium');
  const [paragraphTopic, setParagraphTopic] = useState<string>('العمل والاجتهاد والنجاح الإنساني');
  const [generatedParagraph, setGeneratedParagraph] = useState<{ title: string; text: string } | null>(null);

  // Generate wordlist via /api/gemini/wordlist
  const handleGenerateWordlist = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/gemini/wordlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          count: wordCount,
          difficulty,
          theme,
          customPrompt,
          minLength: difficulty === 'beginner' ? 3 : 3,
          maxLength: difficulty === 'beginner' ? 5 : difficulty === 'intermediate' ? 7 : 9,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'فشل في توليد القائمة عبر الذكاء الاصطناعي');
      }

      setGeneratedWords(data.words || []);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'حدث خطأ أثناء الاتصال بنموذج الذكاء الاصطناعي');
    } finally {
      setLoading(false);
    }
  };

  // Generate practice paragraph via /api/gemini/paragraph
  const handleGenerateParagraph = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/gemini/paragraph', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: paragraphTopic,
          length: paragraphLength,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'فشل في إنشاء الفقرة عبر الذكاء الاصطناعي');
      }

      setGeneratedParagraph({
        title: data.title,
        text: data.text,
      });
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'حدث خطأ أثناء الاتصال بنموذج الذكاء الاصطناعي');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy10FastFingers = (words: string[]) => {
    const text = words.join(' ');
    navigator.clipboard.writeText(text);
    setCopiedNotification('تم نسخ القائمة بتنسيق 10FastFingers!');
    setTimeout(() => setCopiedNotification(null), 2500);
  };

  return (
    <div className="space-y-6 text-right" dir="rtl">
      {/* AI Header & Sub-Navigation */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 font-arabic flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span>مساعد الذكاء الاصطناعي اللغوي للطباعة السريعة (Gemini AI)</span>
            </h2>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
              <span>توليد قوائم كلمات مخصصة بدون تشكيل</span>
              <span aria-hidden="true">·</span>
              <span>إنشاء نصوص وفقرات تدريبية متوازنة</span>
              <span aria-hidden="true">·</span>
              <span>تحسين تدفق الأصابع على لوحة المفاتيح</span>
            </div>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center p-1 bg-slate-100 rounded-lg text-xs font-medium">
            <button
              onClick={() => setActiveMode('wordlist')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                activeMode === 'wordlist'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              توليد قائمة كلمات لـ 10FastFingers
            </button>
            <button
              onClick={() => setActiveMode('paragraph')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                activeMode === 'paragraph'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              توليد فقرة تدريبية متكاملة
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Tab 1: AI Wordlist Generator */}
        {activeMode === 'wordlist' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  عدد الكلمات المطلوبة:
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[50, 100, 150, 200].map((count) => (
                    <button
                      key={count}
                      onClick={() => setWordCount(count)}
                      className={`py-1.5 text-xs font-mono-nums font-semibold rounded-md border transition-colors ${
                        wordCount === count
                          ? 'bg-purple-600 text-white border-purple-600 shadow-2xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {count} كلمة
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  مستوى الصعوبة وطول الكلمات:
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as any)}
                  className="w-full bg-white border border-slate-200 text-slate-800 text-xs rounded-lg p-2 focus:border-purple-500 focus:outline-none"
                >
                  <option value="beginner">مبتدئ (كلمات قصيرة 3-5 أحرف، سريعة وسهلة)</option>
                  <option value="intermediate">متوسط (كلمات شائعة متوازنة 4-7 أحرف)</option>
                  <option value="advanced">متقدم (كلمات مركبة ومتنوعة لتحدي السرعة)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  المجال / الموضوع:
                </label>
                <select
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  className="w-full bg-white border border-slate-200 text-slate-800 text-xs rounded-lg p-2 focus:border-purple-500 focus:outline-none"
                >
                  <option value="حياة يومية وتواصل عام">مفردات عامة وحياة يومية</option>
                  <option value="تكنولوجيا وعلوم وحاسوب">تكنولوجيا وبرمجة وعلوم</option>
                  <option value="أدب وفكر وثقافة">أدب وفكر وكتابة راقية</option>
                  <option value="طبيعة وسفر وأماكن">طبيعة وسفر وجغرافيا</option>
                  <option value="أعمال واقتصاد وتطوير ذات">أعمال وتطوير ذات ونجاح</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                توجيه إضافي مخصص (اختياري):
              </label>
              <input
                type="text"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="مثال: ركز على أفعال ماضية بسيطة، أو تجنب الكلمات التي تحتوي على همزات..."
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:border-purple-500 focus:bg-white focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-slate-500">
                ⚡ يضمن الذكاء الاصطناعي تجريد التشكيل بنسبة 100% لتناسب 10FastFingers
              </span>

              <button
                onClick={handleGenerateWordlist}
                disabled={loading}
                className="flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 active:bg-purple-800 rounded-lg shadow-sm transition-all disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>جارٍ توليد الكلمات بواسطة Gemini...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>توليد قائمة الكلمات الآن</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: AI Practice Paragraph */}
        {activeMode === 'paragraph' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  طول الفقرة:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setParagraphLength('short')}
                    className={`py-2 text-xs font-medium rounded-lg border transition-colors ${
                      paragraphLength === 'short'
                        ? 'bg-purple-600 text-white border-purple-600'
                        : 'bg-white text-slate-700 border-slate-200'
                    }`}
                  >
                    قصيرة (~40 كلمة)
                  </button>
                  <button
                    onClick={() => setParagraphLength('medium')}
                    className={`py-2 text-xs font-medium rounded-lg border transition-colors ${
                      paragraphLength === 'medium'
                        ? 'bg-purple-600 text-white border-purple-600'
                        : 'bg-white text-slate-700 border-slate-200'
                    }`}
                  >
                    متوسطة (~70 كلمة)
                  </button>
                  <button
                    onClick={() => setParagraphLength('long')}
                    className={`py-2 text-xs font-medium rounded-lg border transition-colors ${
                      paragraphLength === 'long'
                        ? 'bg-purple-600 text-white border-purple-600'
                        : 'bg-white text-slate-700 border-slate-200'
                    }`}
                  >
                    طويلة (~120 كلمة)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  موضوع الفقرة:
                </label>
                <input
                  type="text"
                  value={paragraphTopic}
                  onChange={(e) => setParagraphTopic(e.target.value)}
                  placeholder="مثال: الإصرار والنجاح، تاريخ اللغة العربية، استكشاف الفضاء..."
                  className="w-full p-2 text-xs bg-white border border-slate-200 rounded-lg focus:border-purple-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end pt-2">
              <button
                onClick={handleGenerateParagraph}
                disabled={loading}
                className="flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 active:bg-purple-800 rounded-lg shadow-sm transition-all disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>جارٍ إنشاء النص...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>إنشاء الفقرة التدريبية</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
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

      {/* Results View for Generated Wordlist */}
      {activeMode === 'wordlist' && generatedWords.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-semibold text-slate-900 font-arabic text-sm">
                القائمة المولدة بالذكاء الاصطناعي ({generatedWords.length} كلمة)
              </h3>
              <p className="text-xs text-slate-500">جاهزة للنسخ أو التدريب الفوري في محاكي السرعة</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleCopy10FastFingers(generatedWords)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>نسخ لـ 10FastFingers</span>
              </button>

              <button
                onClick={() => onStartTypingWithWordlist(generatedWords)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>تدرب عليها الآن</span>
              </button>
            </div>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg max-h-60 overflow-y-auto scrollbar-thin">
            <p className="font-arabic text-base sm:text-lg leading-loose text-slate-800 select-all">
              {generatedWords.join(' ')}
            </p>
          </div>
        </div>
      )}

      {/* Results View for Generated Paragraph */}
      {activeMode === 'paragraph' && generatedParagraph && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-semibold text-slate-900 font-arabic text-base">
                {generatedParagraph.title}
              </h3>
              <p className="text-xs text-slate-500">نص نقي بدون تشكيل مجهز لاختبار السرعة</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(generatedParagraph.text);
                  setCopiedNotification('تم نسخ الفقرة!');
                  setTimeout(() => setCopiedNotification(null), 2000);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>نسخ النص</span>
              </button>

              <button
                onClick={() => onApplyTextToAnalyzer(generatedParagraph.text)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>تحليل هذا النص في الاستوديو</span>
              </button>
            </div>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
            <p className="font-arabic text-base sm:text-lg leading-relaxed text-slate-800 select-all">
              {generatedParagraph.text}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
