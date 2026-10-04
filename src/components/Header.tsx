import React from 'react';
import { Play, Sparkles, FileText, ListFilter, BarChart3, Keyboard } from 'lucide-react';

export type ActiveTab = 'analyzer' | 'wordlists' | 'typing' | 'letters' | 'ai';

interface HeaderProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onQuickStartTyping: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  onQuickStartTyping,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Zone 1: Single text element Brand Zone */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onTabChange('analyzer')}
              className="flex items-center gap-2.5 text-right focus:outline-none group"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                ق
              </div>
              <div>
                <span className="font-arabic font-bold text-lg tracking-tight text-slate-900 group-hover:text-emerald-700 transition-colors">
                  قَلَم · استوديو الطباعة العربية
                </span>
                <span className="hidden sm:inline-block mr-2 text-xs font-medium text-slate-400">
                  Arabic Text & 10FastFingers Studio
                </span>
              </div>
            </button>
          </div>

          {/* Zone 2: Navigation Links (Clean text with active indicator, single line) */}
          <nav className="hidden md:flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => onTabChange('analyzer')}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium rounded-md whitespace-nowrap transition-colors ${
                activeTab === 'analyzer'
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <FileText className="w-4 h-4 text-emerald-600" />
              <span>تحليل النص والتردد</span>
            </button>

            <button
              onClick={() => onTabChange('wordlists')}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium rounded-md whitespace-nowrap transition-colors ${
                activeTab === 'wordlists'
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <ListFilter className="w-4 h-4 text-blue-600" />
              <span>قوائم 10FastFingers</span>
            </button>

            <button
              onClick={() => onTabChange('typing')}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium rounded-md whitespace-nowrap transition-colors ${
                activeTab === 'typing'
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Keyboard className="w-4 h-4 text-emerald-600" />
              <span>محاكي اختبار السرعة</span>
            </button>

            <button
              onClick={() => onTabChange('letters')}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium rounded-md whitespace-nowrap transition-colors ${
                activeTab === 'letters'
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <BarChart3 className="w-4 h-4 text-amber-600" />
              <span>توزيع الحروف</span>
            </button>

            <button
              onClick={() => onTabChange('ai')}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium rounded-md whitespace-nowrap transition-colors ${
                activeTab === 'ai'
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span>مساعد الذكاء الاصطناعي</span>
            </button>
          </nav>

          {/* Zone 3: Primary Action */}
          <div className="flex items-center gap-2">
            <button
              onClick={onQuickStartTyping}
              className="flex items-center gap-2 px-3.5 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-lg shadow-sm transition-all whitespace-nowrap"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>ابدأ اختبار السرعة</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="flex md:hidden overflow-x-auto py-2 border-t border-slate-100 gap-1 scrollbar-none text-xs">
          <button
            onClick={() => onTabChange('analyzer')}
            className={`px-3 py-1.5 rounded font-medium whitespace-nowrap ${
              activeTab === 'analyzer' ? 'bg-slate-900 text-white' : 'text-slate-600'
            }`}
          >
            تحليل النص
          </button>
          <button
            onClick={() => onTabChange('wordlists')}
            className={`px-3 py-1.5 rounded font-medium whitespace-nowrap ${
              activeTab === 'wordlists' ? 'bg-slate-900 text-white' : 'text-slate-600'
            }`}
          >
            قوائم 10FastFingers
          </button>
          <button
            onClick={() => onTabChange('typing')}
            className={`px-3 py-1.5 rounded font-medium whitespace-nowrap ${
              activeTab === 'typing' ? 'bg-slate-900 text-white' : 'text-slate-600'
            }`}
          >
            محاكي السرعة
          </button>
          <button
            onClick={() => onTabChange('letters')}
            className={`px-3 py-1.5 rounded font-medium whitespace-nowrap ${
              activeTab === 'letters' ? 'bg-slate-900 text-white' : 'text-slate-600'
            }`}
          >
            الحروف
          </button>
          <button
            onClick={() => onTabChange('ai')}
            className={`px-3 py-1.5 rounded font-medium whitespace-nowrap ${
              activeTab === 'ai' ? 'bg-slate-900 text-white' : 'text-slate-600'
            }`}
          >
            ذكاء اصطناعي
          </button>
        </div>
      </div>
    </header>
  );
};
