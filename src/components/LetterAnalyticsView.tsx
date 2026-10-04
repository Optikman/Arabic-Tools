import React, { useMemo } from 'react';
import { LetterFrequencyItem, TextAnalysisStats } from '../types';
import { Download, BarChart2, Keyboard, Layers } from 'lucide-react';

interface LetterAnalyticsViewProps {
  letterFrequencies: LetterFrequencyItem[];
  stats: TextAnalysisStats;
}

export const LetterAnalyticsView: React.FC<LetterAnalyticsViewProps> = ({
  letterFrequencies,
  stats,
}) => {
  // Keyboard row statistics
  const rowStats = useMemo(() => {
    let homeCount = 0;
    let topCount = 0;
    let bottomCount = 0;
    let extraCount = 0;

    for (const item of letterFrequencies) {
      if (item.keyboardRow === 'home') homeCount += item.count;
      else if (item.keyboardRow === 'top') topCount += item.count;
      else if (item.keyboardRow === 'bottom') bottomCount += item.count;
      else extraCount += item.count;
    }

    const total = Math.max(1, stats.totalLetters);
    return {
      homePercentage: ((homeCount / total) * 100).toFixed(1),
      topPercentage: ((topCount / total) * 100).toFixed(1),
      bottomPercentage: ((bottomCount / total) * 100).toFixed(1),
      homeCount,
      topCount,
      bottomCount,
    };
  }, [letterFrequencies, stats.totalLetters]);

  // Max count for bar chart scaling
  const maxCount = useMemo(() => {
    return letterFrequencies.length > 0
      ? Math.max(...letterFrequencies.map((l) => l.count), 1)
      : 1;
  }, [letterFrequencies]);

  const handleExportCSV = () => {
    const headers = 'الحرف,اسم الحرف,عدد التكرار,النسبة المئوية %,صف لوحة المفاتيح\n';
    const rows = letterFrequencies
      .map(
        (l) =>
          `"${l.letter}","${l.nameAr}",${l.count},${l.percentage}%,${
            l.keyboardRow === 'home' ? 'صف الارتكاز' : l.keyboardRow === 'top' ? 'الصف العلوي' : 'الصف السفلي'
          }`
      )
      .join('\n');
    const blob = new Blob(['\uFEFF' + headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `arabic_letter_frequencies_${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 text-right" dir="rtl">
      {/* Top Ergonomics & Row Distribution Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 font-arabic">
              تحليل توزيع الحروف العربية وأثرها على راحة وسرعة الطباعة
            </h2>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
              <span>توزيع 28 حرفاً عربياً</span>
              <span aria-hidden="true">·</span>
              <span>تكرار كل حرف ونسبته المئوية</span>
              <span aria-hidden="true">·</span>
              <span>تحليل صفوف لوحة المفاتيح (Home Row / Top / Bottom)</span>
            </div>
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>تصدير الحروف CSV</span>
          </button>
        </div>

        {/* Keyboard Ergonomic Rows Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4">
            <div className="flex items-center justify-between text-xs text-emerald-900 font-semibold mb-1">
              <span>صف الارتكاز (Home Row)</span>
              <span className="font-mono-nums font-bold text-emerald-700">{rowStats.homePercentage}%</span>
            </div>
            <div className="w-full bg-emerald-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${rowStats.homePercentage}%` }}
              />
            </div>
            <div className="text-[11px] text-emerald-800 mt-2 font-arabic">
              الحروف: (ش، س، ي، ب، ل، ا، ت، ن، م، ك، ط) · النقر الأكثر راحة وسرعة للأصابع
            </div>
          </div>

          <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4">
            <div className="flex items-center justify-between text-xs text-blue-900 font-semibold mb-1">
              <span>الصف العلوي (Top Row)</span>
              <span className="font-mono-nums font-bold text-blue-700">{rowStats.topPercentage}%</span>
            </div>
            <div className="w-full bg-blue-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-blue-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${rowStats.topPercentage}%` }}
              />
            </div>
            <div className="text-[11px] text-blue-800 mt-2 font-arabic">
              الحروف: (ض، ص، ث، ق، ف، غ، ع، هـ، خ، ح، ج، د)
            </div>
          </div>

          <div className="bg-purple-50/70 border border-purple-200 rounded-xl p-4">
            <div className="flex items-center justify-between text-xs text-purple-900 font-semibold mb-1">
              <span>الصف السفلي (Bottom Row)</span>
              <span className="font-mono-nums font-bold text-purple-700">{rowStats.bottomPercentage}%</span>
            </div>
            <div className="w-full bg-purple-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-purple-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${rowStats.bottomPercentage}%` }}
              />
            </div>
            <div className="text-[11px] text-purple-800 mt-2 font-arabic">
              الحروف: (ظ، ز، ر، و، ة، ى، ء)
            </div>
          </div>
        </div>
      </div>

      {/* Visual Bar Breakdown & Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 space-y-4">
        <h3 className="text-sm font-semibold text-slate-900 font-arabic">
          ترتيب الحروف حسب نسبة التكرار في النص:
        </h3>

        {letterFrequencies.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <Layers className="w-10 h-10 mx-auto text-slate-300 mb-2 stroke-1" />
            <p className="text-sm">لا توجد بيانات أحرف معروضة. أدخل نصاً في قسم التحليل أولاً.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {letterFrequencies.map((item, index) => {
              const barWidth = ((item.count / maxCount) * 100).toFixed(1);
              return (
                <div
                  key={item.letter}
                  className="flex items-center gap-3 p-2.5 rounded-lg border border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition-colors"
                >
                  {/* Letter box */}
                  <div className="w-10 h-10 rounded-lg bg-slate-900 text-white flex items-center justify-center font-arabic text-xl font-bold shrink-0">
                    {item.letter}
                  </div>

                  {/* Letter Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-bold text-slate-900 font-arabic">
                        حرف {item.nameAr}
                        <span className="text-[10px] text-slate-400 mr-1.5 font-normal">
                          ({item.keyboardRow === 'home' ? 'صف الارتكاز' : item.keyboardRow === 'top' ? 'الصف العلوي' : 'الصف السفلي'})
                        </span>
                      </span>
                      <div className="flex items-center gap-2 font-mono-nums">
                        <span className="font-bold text-slate-900">{item.count.toLocaleString()}</span>
                        <span className="text-slate-400">({item.percentage}%)</span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>
                  </div>

                  <div className="text-xs font-mono-nums text-slate-400 w-6 text-left">
                    #{index + 1}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
