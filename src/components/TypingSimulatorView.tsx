import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  RotateCcw,
  Volume2,
  VolumeX,
  Trophy,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  ArrowRight,
  List,
} from 'lucide-react';
import { TypingResults, TypingWord } from '../types';
import { playKeyClickSound, playSuccessChime } from '../lib/audioSound';

interface TypingSimulatorViewProps {
  initialWords: string[];
  onRegenerateWordlist?: () => void;
}

export const TypingSimulatorView: React.FC<TypingSimulatorViewProps> = ({
  initialWords,
  onRegenerateWordlist,
}) => {
  const [selectedDuration, setSelectedDuration] = useState<number>(60);
  const [timeLeft, setTimeLeft] = useState<number>(selectedDuration);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Active typing state
  const [wordList, setWordList] = useState<TypingWord[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState<number>(0);
  const [currentInput, setCurrentInput] = useState<string>('');

  // Performance metrics tracking
  const [totalKeystrokes, setTotalKeystrokes] = useState<number>(0);
  const [correctKeystrokes, setCorrectKeystrokes] = useState<number>(0);
  const [incorrectKeystrokes, setIncorrectKeystrokes] = useState<number>(0);
  const [missedWords, setMissedWords] = useState<{ original: string; typed: string }[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);
  const wordContainerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize word list from props
  const resetTest = (wordsToUse = initialWords, duration = selectedDuration) => {
    if (timerRef.current) clearInterval(timerRef.current);

    const safeWords = wordsToUse.length > 0 ? wordsToUse : ['العلم', 'المعرفة', 'السرعة', 'العمل', 'النجاح'];
    const prepared: TypingWord[] = safeWords.map((w, idx) => ({
      id: idx,
      text: w,
      status: idx === 0 ? 'current' : 'pending',
      typedText: '',
    }));

    setWordList(prepared);
    setCurrentWordIndex(0);
    setCurrentInput('');
    setTimeLeft(duration);
    setIsRunning(false);
    setIsFinished(false);
    setTotalKeystrokes(0);
    setCorrectKeystrokes(0);
    setIncorrectKeystrokes(0);
    setMissedWords([]);

    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  };

  useEffect(() => {
    resetTest(initialWords, selectedDuration);
  }, [initialWords, selectedDuration]);

  // Countdown timer effect
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            handleFinishTest();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, timeLeft]);

  // Complete test calculation
  const handleFinishTest = () => {
    setIsRunning(false);
    setIsFinished(true);
    playSuccessChime(soundEnabled);
  };

  // Keystroke & Input change handler
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;

    // Start timer on very first keystroke if not running
    if (!isRunning && !isFinished) {
      setIsRunning(true);
    }

    const currentWord = wordList[currentWordIndex];
    if (!currentWord) return;

    // Detect spacebar press to submit word
    if (val.endsWith(' ')) {
      const trimmed = val.trim();
      if (trimmed.length === 0) return; // Prevent empty spaces

      const isCorrect = trimmed === currentWord.text;

      // Update keystrokes: space counts as keystroke
      if (isCorrect) {
        setCorrectKeystrokes((prev) => prev + currentWord.text.length + 1);
        playKeyClickSound(soundEnabled, false);
      } else {
        setIncorrectKeystrokes((prev) => prev + trimmed.length + 1);
        setMissedWords((prev) => [...prev, { original: currentWord.text, typed: trimmed }]);
        playKeyClickSound(soundEnabled, true);
      }
      setTotalKeystrokes((prev) => prev + trimmed.length + 1);

      // Advance to next word
      setWordList((prev) =>
        prev.map((w, idx) => {
          if (idx === currentWordIndex) {
            return {
              ...w,
              status: isCorrect ? 'correct' : 'incorrect',
              typedText: trimmed,
            };
          }
          if (idx === currentWordIndex + 1) {
            return { ...w, status: 'current' };
          }
          return w;
        })
      );

      const nextIndex = currentWordIndex + 1;
      setCurrentWordIndex(nextIndex);
      setCurrentInput('');

      // Auto-scroll words container to keep current word in view
      if (wordContainerRef.current) {
        const activeElement = wordContainerRef.current.querySelector('[data-active="true"]');
        if (activeElement) {
          activeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }

      // If finished all words before time runs out
      if (nextIndex >= wordList.length) {
        handleFinishTest();
      }
      return;
    }

    // Normal typing within current word
    setCurrentInput(val);
    setTotalKeystrokes((prev) => prev + 1);

    // Audio click
    const isTypoSoFar = !currentWord.text.startsWith(val);
    playKeyClickSound(soundEnabled, isTypoSoFar);
  };

  // Real-time calculation of WPM and Accuracy
  const elapsedTime = selectedDuration - timeLeft;
  const elapsedMinutes = Math.max(elapsedTime, 1) / 60;
  // Standard Net WPM formula: (correctKeystrokes / 5) / elapsedMinutes
  const liveWpm = Math.max(0, Math.round(correctKeystrokes / 5 / elapsedMinutes));
  const liveAccuracy =
    totalKeystrokes > 0 ? Math.round((correctKeystrokes / totalKeystrokes) * 100) : 100;
  const liveCpm = Math.round(correctKeystrokes / elapsedMinutes);

  const isCurrentInputMismatch = useMemo(() => {
    const currentWord = wordList[currentWordIndex];
    if (!currentWord || !currentInput) return false;
    return !currentWord.text.startsWith(currentInput);
  }, [wordList, currentWordIndex, currentInput]);

  return (
    <div className="space-y-6 text-right" dir="rtl">
      {/* Test Controls Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-700">مدة الاختبار:</span>
          {[30, 60, 120].map((dur) => (
            <button
              key={dur}
              onClick={() => {
                setSelectedDuration(dur);
                resetTest(initialWords, dur);
              }}
              disabled={isRunning}
              className={`px-3 py-1.5 text-xs font-mono-nums font-semibold rounded-lg border transition-colors ${
                selectedDuration === dur
                  ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 disabled:opacity-50'
              }`}
            >
              {dur} ثانية {dur === 60 ? '(القياسي)' : ''}
            </button>
          ))}
        </div>

        {/* Live Counters */}
        <div className="flex items-center gap-4 text-xs font-mono-nums">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg">
            <Clock className="w-4 h-4 text-emerald-600" />
            <span className="text-slate-500">الوقت:</span>
            <span className="font-bold text-base text-slate-900 font-mono-nums w-8 text-center">
              {timeLeft}
            </span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="text-slate-500">السرعة:</span>
            <span className="font-bold text-base text-emerald-600 font-mono-nums">{liveWpm}</span>
            <span className="text-slate-400">WPM</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="text-slate-500">الدقة:</span>
            <span className="font-bold text-base text-blue-600 font-mono-nums">{liveAccuracy}%</span>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
            title={soundEnabled ? 'كتم صوت المفاتيح' : 'تشغيل صوت المفاتيح'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Reset Button */}
          <button
            onClick={() => resetTest()}
            className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg transition-colors font-medium text-xs"
            title="إعادة بدء الاختبار"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>إعادة البدء</span>
          </button>
        </div>
      </div>

      {/* Main 10FastFingers Words Display Box */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 space-y-5">
        <div
          ref={wordContainerRef}
          className="relative min-h-[140px] max-h-[160px] overflow-hidden p-4 bg-slate-50/70 border border-slate-200 rounded-xl select-none"
        >
          <div className="flex flex-wrap gap-x-3.5 gap-y-3 font-arabic text-xl sm:text-2xl leading-relaxed">
            {wordList.map((item, idx) => {
              const isCurrent = idx === currentWordIndex;
              let statusClasses = 'text-slate-600 hover:text-slate-800';

              if (item.status === 'correct') {
                statusClasses = 'text-emerald-600 font-semibold';
              } else if (item.status === 'incorrect') {
                statusClasses = 'text-rose-600 line-through font-semibold';
              } else if (isCurrent) {
                statusClasses = isCurrentInputMismatch
                  ? 'bg-rose-100 text-rose-800 px-2 py-0.5 rounded shadow-2xs font-bold'
                  : 'bg-slate-200/90 text-slate-950 px-2 py-0.5 rounded shadow-2xs font-bold';
              }

              return (
                <span
                  key={item.id}
                  data-active={isCurrent ? 'true' : 'false'}
                  className={`inline-block transition-colors duration-100 ${statusClasses}`}
                >
                  {item.text}
                </span>
              );
            })}
          </div>
        </div>

        {/* Real-time Typing Input Field */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <input
              ref={inputRef}
              type="text"
              value={currentInput}
              onChange={handleInputChange}
              disabled={isFinished}
              placeholder={
                isFinished
                  ? 'انتهى وقت الاختبار!'
                  : isRunning
                  ? 'اكتب الكلمة واضغط مسافة (Space)...'
                  : 'ابدأ بالكتابة هنا مباشرة لتشغيل المؤقت...'
              }
              autoFocus
              className={`w-full py-3.5 px-4 font-arabic text-xl sm:text-2xl text-slate-900 bg-white border-2 rounded-xl outline-none transition-all shadow-sm ${
                isCurrentInputMismatch
                  ? 'border-rose-400 bg-rose-50/30 ring-2 ring-rose-100'
                  : 'border-slate-300 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100'
              }`}
            />
          </div>

          <button
            onClick={() => resetTest()}
            className="px-5 py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-medium text-sm transition-colors shadow-2xs flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>إعادة</span>
          </button>
        </div>

        {/* Typing Instructions */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
          <span>
            💡 اضغط على زر <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-300 rounded font-mono text-slate-800">مسافة (Space)</kbd> بعد إنهاء كل كلمة للانتقال للكلمة التالية
          </span>
          <span className="font-mono-nums">
            تمت كتابة {currentWordIndex} من {wordList.length} كلمة
          </span>
        </div>
      </div>

      {/* Completion Modal / Scorecard Curtain */}
      {isFinished && (
        <div className="bg-white border-2 border-emerald-500 rounded-2xl p-6 sm:p-8 shadow-lg space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 font-arabic">
                  نتائج اختبار السرعة 10FastFingers
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  اكتمل الاختبار في {selectedDuration} ثانية بدون أي تشكيل
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => resetTest()}
                className="px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>إعادة المحاولة بنفس الكلمات</span>
              </button>

              {onRegenerateWordlist && (
                <button
                  onClick={() => {
                    onRegenerateWordlist();
                  }}
                  className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  <span>توليد كلمات جديدة</span>
                </button>
              )}
            </div>
          </div>

          {/* Primary Score Numbers */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-4 text-center">
              <div className="text-xs font-medium text-emerald-800">معدل السرعة (WPM)</div>
              <div className="mt-1 text-3xl sm:text-4xl font-extrabold font-mono-nums text-emerald-700">
                {liveWpm}
              </div>
              <div className="text-[11px] text-emerald-600 mt-0.5">كلمة في الدقيقة (صافي)</div>
            </div>

            <div className="bg-blue-50/60 border border-blue-200 rounded-xl p-4 text-center">
              <div className="text-xs font-medium text-blue-800">نسبة الدقة</div>
              <div className="mt-1 text-3xl sm:text-4xl font-extrabold font-mono-nums text-blue-700">
                {liveAccuracy}%
              </div>
              <div className="text-[11px] text-blue-600 mt-0.5">صحة نقرات المفاتيح</div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center">
              <div className="text-xs font-medium text-slate-700">النقرات (Keystrokes)</div>
              <div className="mt-1 text-2xl font-bold font-mono-nums text-slate-900">
                {correctKeystrokes} <span className="text-xs text-slate-400 font-normal">|</span>{' '}
                <span className="text-rose-600">{incorrectKeystrokes}</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5 font-mono-nums">
                {correctKeystrokes} صحيحة · {incorrectKeystrokes} خاطئة
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center">
              <div className="text-xs font-medium text-slate-700">الكلمات المنجزة</div>
              <div className="mt-1 text-2xl font-bold font-mono-nums text-slate-900">
                {wordList.filter((w) => w.status === 'correct').length}{' '}
                <span className="text-xs text-slate-400 font-normal">من</span> {currentWordIndex}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5 font-mono-nums">
                {liveCpm} حرف في الدقيقة (CPM)
              </div>
            </div>
          </div>

          {/* Missed Words Drill */}
          {missedWords.length > 0 ? (
            <div className="border border-rose-200 bg-rose-50/40 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-rose-600" />
                  <span className="text-xs font-bold text-rose-900">
                    الكلمات التي حدث فيها خطأ ({missedWords.length} كلمة):
                  </span>
                </div>
                <button
                  onClick={() => {
                    const uniqueMissed = Array.from(new Set(missedWords.map((m) => m.original)));
                    resetTest(uniqueMissed);
                  }}
                  className="px-3 py-1 bg-white hover:bg-rose-100 text-rose-700 border border-rose-300 rounded-md text-xs font-medium transition-colors"
                >
                  تدرب على الكلمات الخاطئة فقط
                </button>
              </div>

              <div className="flex flex-wrap gap-2 text-xs font-arabic">
                {missedWords.map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-white border border-rose-200 px-2.5 py-1 rounded-md flex items-center gap-2"
                  >
                    <span className="font-semibold text-slate-900">{item.original}</span>
                    <span className="text-slate-400">←</span>
                    <span className="text-rose-600 line-through font-mono-nums">{item.typed || 'فراغ'}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="border border-emerald-200 bg-emerald-50/40 rounded-xl p-4 text-center text-xs text-emerald-800 font-medium flex items-center justify-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>إنجاز رائع! لقد كتبت جميع الكلمات بدقة 100% وبدون أي خطأ إملائي.</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
