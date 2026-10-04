import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  Bot,
  User,
  Trash2,
  Copy,
  Check,
  Play,
  Loader2,
  BookOpen,
  Keyboard,
  Target,
  FileText,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
  extractedWords?: string[];
}

interface ChatbotViewProps {
  onStartTypingWithWordlist: (words: string[]) => void;
  onApplyTextToAnalyzer: (text: string) => void;
}

export const ChatbotView: React.FC<ChatbotViewProps> = ({
  onStartTypingWithWordlist,
  onApplyTextToAnalyzer,
}) => {
  const [role, setRole] = useState<'typing_coach' | 'linguist' | 'drill_generator'>('typing_coach');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      role: 'model',
      text: `أهلاً بك! أنا **قَلَم**، مساعدك الذكي المتخصص في سرعة الطباعة باللغة العربية وتحليل النصوص لـ 10FastFingers.\n\nكيف يمكنني مساعدتك اليوم؟ يمكنك أن تطلب مني:\n- توليد قوائم كلمات مخصصة لتدريب أصابع معينة بدون تشكيل.\n- نصائح تقنية لرفع معدل كلماتك في الدقيقة (WPM).\n- تحليل الجذور اللغوية وتوزيع شيوع الكلمات في اللغة العربية.`,
      timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom of conversation
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const quickPrompts = [
    { text: 'أعطني قائمة 40 كلمة لتدريب صف الارتكاز لـ 10FastFingers', icon: Keyboard },
    { text: 'كيف أتخلص من عادة النظر إلى لوحة المفاتيح أثناء الطباعة؟', icon: Target },
    { text: 'ولد لي تدريباً مخصصاً لحروف اليد اليسرى (ش، س، ي، ب)', icon: Sparkles },
    { text: 'ما هي أهم 20 كلمة متكررة في النصوص الإخبارية العربية؟', icon: BookOpen },
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text,
      timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setLoading(true);

    try {
      // Build history for multi-turn conversation
      const historyPayload = messages.map((m) => ({
        role: m.role,
        text: m.text,
      }));

      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: historyPayload,
          role,
          taskType: 'fast',
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'حدث خطأ في استجابة الذكاء الاصطناعي');
      }

      const modelMsg: ChatMessage = {
        id: `model-${Date.now()}`,
        role: 'model',
        text: data.reply,
        timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
        extractedWords: data.extractedWords || [],
      };

      setMessages((prev) => [...prev, modelMsg]);
    } catch (err: any) {
      console.error(err);
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'model',
        text: `عذراً، حدث خطأ أثناء الاتصال بمساعد الذكاء الاصطناعي: ${err.message || 'يرجى المحاولة مرة أخرى'}`,
        timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: 'model',
        text: 'تم مسح سجل المحادثة. كيف يمكنني مساعدتك في تدريب وسرعة الطباعة الآن؟',
        timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <div className="space-y-4 text-right max-w-5xl mx-auto" dir="rtl">
      {/* Top Role Selector Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center font-bold">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 font-arabic">
              محادثة الذكاء الاصطناعي التفاعلية (Gemini)
            </h2>
            <div className="text-[11px] text-slate-500">
              اختر دور المساعد لتخصيص نمط الإجابات وتدريبات الطباعة
            </div>
          </div>
        </div>

        {/* Roles Segmented Control */}
        <div className="flex items-center p-0.5 bg-slate-100 rounded-lg text-xs font-medium">
          <button
            onClick={() => setRole('typing_coach')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
              role === 'typing_coach'
                ? 'bg-white text-purple-900 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Target className="w-3.5 h-3.5 text-purple-600" />
            <span>مدرب 10FastFingers</span>
          </button>

          <button
            onClick={() => setRole('drill_generator')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
              role === 'drill_generator'
                ? 'bg-white text-purple-900 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Keyboard className="w-3.5 h-3.5 text-emerald-600" />
            <span>توليد تدريبات الأصابع</span>
          </button>

          <button
            onClick={() => setRole('linguist')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
              role === 'linguist'
                ? 'bg-white text-purple-900 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-blue-600" />
            <span>خبير لغوي ومعجمي</span>
          </button>
        </div>

        <button
          onClick={handleClearHistory}
          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition-colors self-end sm:self-auto"
          title="مسح سجل المحادثة"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Chat Thread Container */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col h-[560px] overflow-hidden">
        {/* Messages List */}
        <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4 scrollbar-thin">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    isUser
                      ? 'bg-slate-800 text-white'
                      : 'bg-purple-100 text-purple-700'
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                {/* Message Bubble */}
                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed space-y-2.5 ${
                    isUser
                      ? 'bg-slate-900 text-white rounded-tr-none'
                      : 'bg-slate-50 border border-slate-200/80 text-slate-800 rounded-tl-none'
                  }`}
                >
                  {/* Text content with clean paragraph linebreaks */}
                  <div className="font-arabic whitespace-pre-wrap selection:bg-purple-200 selection:text-purple-900">
                    {msg.text}
                  </div>

                  {/* Actions for Model responses with extracted words */}
                  {!isUser && (
                    <div className="pt-2 border-t border-slate-200/60 flex flex-wrap items-center justify-between gap-2">
                      <div className="text-[11px] font-mono-nums text-slate-400">
                        {msg.timestamp}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleCopyText(msg.id, msg.text)}
                          className="flex items-center gap-1 px-2 py-1 text-[11px] font-medium bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-md transition-colors"
                        >
                          {copiedId === msg.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span className="text-emerald-600">تم النسخ</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>نسخ النص</span>
                            </>
                          )}
                        </button>

                        {msg.extractedWords && msg.extractedWords.length >= 5 && (
                          <>
                            <button
                              onClick={() => {
                                const spaceWords = msg.extractedWords!.join(' ');
                                navigator.clipboard.writeText(spaceWords);
                                handleCopyText(msg.id, spaceWords);
                              }}
                              className="flex items-center gap-1 px-2 py-1 text-[11px] font-medium bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-md transition-colors"
                              title="نسخ الكلمات مفصولة بمسافات لـ 10FastFingers"
                            >
                              <Copy className="w-3 h-3" />
                              <span>نسخ لـ 10FastFingers ({msg.extractedWords.length} كلمة)</span>
                            </button>

                            <button
                              onClick={() => onStartTypingWithWordlist(msg.extractedWords!)}
                              className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-md transition-colors shadow-2xs"
                              title="بدء اختبار سرعة بهذه الكلمات"
                            >
                              <Play className="w-3 h-3 fill-current" />
                              <span>تدرب عليها الآن</span>
                            </button>
                          </>
                        )}

                        <button
                          onClick={() => onApplyTextToAnalyzer(msg.text)}
                          className="flex items-center gap-1 px-2 py-1 text-[11px] font-medium bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-md transition-colors"
                          title="تحليل تكرار الكلمات في هذا الرد"
                        >
                          <FileText className="w-3 h-3" />
                          <span>تحليل النص</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {isUser && (
                    <div className="text-[10px] font-mono-nums text-slate-400 text-left">
                      {msg.timestamp}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex gap-3 items-center text-slate-500 text-xs py-2">
              <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
              <span className="font-arabic">قَلَم يفكّر ويجهّز لك الرد والتدريب المناسب...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Pills */}
        <div className="px-4 py-2 bg-slate-50/80 border-t border-slate-100 flex items-center gap-2 overflow-x-auto scrollbar-none">
          <span className="text-[11px] text-slate-400 font-medium shrink-0">اقتراحات سريعة:</span>
          {quickPrompts.map((p, idx) => {
            const Icon = p.icon;
            return (
              <button
                key={idx}
                onClick={() => handleSendMessage(p.text)}
                disabled={loading}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-arabic bg-white hover:bg-purple-50 text-slate-700 hover:text-purple-700 border border-slate-200 rounded-md transition-colors whitespace-nowrap disabled:opacity-50"
              >
                <Icon className="w-3 h-3 text-purple-600 shrink-0" />
                <span>{p.text}</span>
              </button>
            );
          })}
        </div>

        {/* User Input & Send Bar */}
        <div className="p-3 border-t border-slate-200 bg-white">
          <div className="flex items-end gap-2 bg-slate-50 border border-slate-200 rounded-xl p-2 focus-within:border-purple-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-purple-100 transition-all">
            <textarea
              ref={textareaRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              placeholder="اسأل قَلَم عن سرعة الطباعة، تدريبات الأصابع، أو اطلب قائمة كلمات لـ 10FastFingers... (اضغط Enter للإرسال)"
              rows={2}
              className="flex-1 bg-transparent border-0 outline-none text-xs sm:text-sm font-arabic resize-none placeholder:text-slate-400 p-1"
            />

            <button
              onClick={() => handleSendMessage()}
              disabled={!inputMessage.trim() || loading}
              className="p-2.5 bg-purple-600 hover:bg-purple-700 active:bg-purple-800 disabled:opacity-40 text-white rounded-lg transition-colors shadow-2xs shrink-0"
              title="إرسال"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
