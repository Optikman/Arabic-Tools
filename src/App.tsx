import React, { useState, useMemo } from 'react';
import { Header, ActiveTab } from './components/Header';
import { TextAnalyzerView } from './components/TextAnalyzerView';
import { WordlistGeneratorView } from './components/WordlistGeneratorView';
import { TypingSimulatorView } from './components/TypingSimulatorView';
import { LetterAnalyticsView } from './components/LetterAnalyticsView';
import { AiAssistantView } from './components/AiAssistantView';
import { ChatbotView } from './components/ChatbotView';
import {
  DEFAULT_NORMALIZATION_OPTIONS,
  SAMPLE_TEXTS,
  calculateTextStats,
} from './lib/arabicTokenizer';
import { getTopCorpusWords } from './lib/arabicCorpus';
import { NormalizationOptions } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('analyzer');
  const [rawText, setRawText] = useState<string>(SAMPLE_TEXTS[0].content);
  const [normalizationOptions, setNormalizationOptions] = useState<NormalizationOptions>(
    DEFAULT_NORMALIZATION_OPTIONS
  );

  // Compute text statistics, word frequencies, and letter frequencies
  const { stats, wordFrequencies, letterFrequencies } = useMemo(() => {
    return calculateTextStats(rawText, normalizationOptions);
  }, [rawText, normalizationOptions]);

  // Current active wordlist for typing simulator (defaults to top 100 corpus words)
  const [activeTypingWords, setActiveTypingWords] = useState<string[]>(() =>
    getTopCorpusWords(100, { minLength: 3, maxLength: 7, shuffle: true })
  );

  // Bridge actions between components
  const handleStartTypingWithWordlist = (words: string[]) => {
    if (words && words.length > 0) {
      setActiveTypingWords(words);
    }
    setActiveTab('typing');
  };

  const handleQuickStartTyping = () => {
    // If analyzed words exist, use them; otherwise use top corpus words
    if (wordFrequencies.length >= 20) {
      const topWords = wordFrequencies.slice(0, 100).map((w) => w.word);
      setActiveTypingWords(topWords);
    } else {
      setActiveTypingWords(getTopCorpusWords(100, { shuffle: true }));
    }
    setActiveTab('typing');
  };

  const handleApplyTextToAnalyzer = (text: string) => {
    setRawText(text);
    setActiveTab('analyzer');
  };

  const handleRegenerateWordlistForTest = () => {
    setActiveTypingWords(getTopCorpusWords(100, { minLength: 3, maxLength: 7, shuffle: true }));
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-emerald-100 selection:text-emerald-900">
      {/* 3-zone Header contract */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onQuickStartTyping={handleQuickStartTyping}
      />

      {/* Main Content Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'analyzer' && (
          <TextAnalyzerView
            rawText={rawText}
            onTextChange={setRawText}
            normalizationOptions={normalizationOptions}
            onNormalizationChange={setNormalizationOptions}
            stats={stats}
            wordFrequencies={wordFrequencies}
            letterFrequencies={letterFrequencies}
            onSendToTypingTest={handleStartTypingWithWordlist}
          />
        )}

        {activeTab === 'wordlists' && (
          <WordlistGeneratorView
            analyzedWords={wordFrequencies}
            onStartTypingWithWordlist={handleStartTypingWithWordlist}
          />
        )}

        {activeTab === 'typing' && (
          <TypingSimulatorView
            initialWords={activeTypingWords}
            onRegenerateWordlist={handleRegenerateWordlistForTest}
          />
        )}

        {activeTab === 'letters' && (
          <LetterAnalyticsView
            letterFrequencies={letterFrequencies}
            stats={stats}
          />
        )}

        {activeTab === 'chat' && (
          <ChatbotView
            onStartTypingWithWordlist={handleStartTypingWithWordlist}
            onApplyTextToAnalyzer={handleApplyTextToAnalyzer}
          />
        )}

        {activeTab === 'ai' && (
          <AiAssistantView
            onStartTypingWithWordlist={handleStartTypingWithWordlist}
            onApplyTextToAnalyzer={handleApplyTextToAnalyzer}
          />
        )}
      </main>

      {/* Clean, unboxed footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-xs text-slate-500 text-center font-arabic">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">قَلَم · استوديو تحليل النصوص وقوائم الطباعة</span>
            <span aria-hidden="true">·</span>
            <span>مخصص لاختبارات السرعة 10FastFingers وMonkeytype</span>
          </div>

          <div className="flex items-center gap-3 text-slate-400">
            <span>تجريد التشكيل والكشيدة</span>
            <span>·</span>
            <span>معجم 2000 كلمة قياسية</span>
            <span>·</span>
            <span>Gemini AI 3.8 Flash</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
