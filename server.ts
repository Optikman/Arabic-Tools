import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

// Server-side Google Gen AI initialization
const getGenAI = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not set on the server');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// Helper: Call Gemini with model fallback for high reliability
async function callGeminiWithFallback<T>(
  fn: (ai: GoogleGenAI, model: string) => Promise<T>,
  models = ['gemini-3.1-flash-lite', 'gemini-3.8-flash']
): Promise<T> {
  const ai = getGenAI();
  let lastError: any = null;

  for (const model of models) {
    try {
      return await fn(ai, model);
    } catch (err: any) {
      console.warn(`Model ${model} failed, checking fallback:`, err.message || err);
      lastError = err;
    }
  }
  throw lastError;
}

// API: Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'Arabic Text Analyzer Server' });
});

// API: Multi-turn Chat Interface
app.post('/api/gemini/chat', async (req, res) => {
  try {
    const {
      message,
      history = [],
      role = 'typing_coach',
      taskType = 'fast',
    } = req.body;

    if (!message || typeof message !== 'string') {
      res.status(400).json({ success: false, error: 'Message is required' });
      return;
    }

    // Role-specific System Instructions
    let systemInstruction = '';
    if (role === 'typing_coach') {
      systemInstruction = `You are "قَلَم" (Qalam), an elite Arabic touch-typing coach and 10FastFingers / Monkeytype specialist.
Your goal is to help users boost their Arabic typing speed (WPM), improve accuracy, and master the Arabic keyboard layout (101/102 keys).
Guidelines:
1. Provide practical, highly encouraging, and ergonomic guidance in fluent, warm Arabic.
2. Teach proper finger placements on the home row (صف الارتكاز: ك م ن ت ا ل ب ي س ش ط).
3. If the user asks for practice words, sentences, or drills, ALWAYS provide them WITHOUT ANY DIACRITICS OR TASHKEEL (no fatḥah, ḍammah, kasrah, sukūn, tanwīn, shaddah), separated by spaces so they can be copied directly into 10FastFingers.
4. Format your responses with clean markdown headings and bullet points.`;
    } else if (role === 'linguist') {
      systemInstruction = `You are "قَلَم" (Qalam), a senior Arabic lexicographer, computational linguist, and corpus specialist.
Your goal is to explain Arabic word roots, morphological derivations (أوزان), linguistic frequencies, lexical richness, and vocabulary nuances.
Guidelines:
1. Provide accurate, scholarly yet accessible Arabic linguistic explanations in clear Arabic.
2. Point out common frequency patterns in Modern Standard Arabic (MSA).
3. Provide unvocalized (no tashkeel) versions of examples for typing compatibility when requested.`;
    } else {
      systemInstruction = `You are "قَلَم" (Qalam), a specialized Arabic typing drill and wordlist curator for 10FastFingers.
Guidelines:
1. Provide targeted word drills tailored to keyboard finger balance (e.g. left-hand words, right-hand words, alternating rhythm words, specific letter drills).
2. STRICTLY NO DIACRITICS OR TASHKEEL (no fatḥah, ḍammah, kasrah, sukūn, tanwīn, shaddah).
3. Keep drills space-separated for direct copy-paste into typing tests.`;
    }

    // Format history for SDK
    const formattedHistory = (history || [])
      .filter((h: any) => h.text && (h.role === 'user' || h.role === 'model'))
      .map((h: any) => ({
        role: h.role,
        parts: [{ text: h.text }],
      }));

    const responseText = await callGeminiWithFallback(async (ai, model) => {
      const chat = ai.chats.create({
        model,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
        history: formattedHistory,
      });

      const response = await chat.sendMessage({ message });
      return response.text || '';
    }, taskType === 'complex' ? ['gemini-3.1-flash-lite', 'gemini-3.8-flash'] : ['gemini-3.1-flash-lite', 'gemini-3.8-flash']);

    // Extract any Arabic words from the response that could be used for a typing test
    const arabicWords = responseText
      .replace(/[\u064B-\u065F\u0670\u0640\u06D6-\u06ED]/g, '')
      .split(/[\s\r\n\t,.;:!?،؟؛«»"()\[\]{}\/\\—–\-_+=*&^%$#@~`|<>]+/)
      .map((w) => w.replace(/[^\u0600-\u06FF]/g, '').trim())
      .filter((w) => w.length >= 2 && w.length <= 10);

    // Get unique words if there are at least 5
    const uniqueExtracted = Array.from(new Set(arabicWords));

    res.json({
      success: true,
      reply: responseText,
      extractedWords: uniqueExtracted.length >= 5 ? uniqueExtracted.slice(0, 100) : [],
    });
  } catch (error: any) {
    console.error('Error in /api/gemini/chat:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to process chat message with Gemini AI',
    });
  }
});

// API: Generate tailored Arabic wordlist for 10FastFingers typing tests
app.post('/api/gemini/wordlist', async (req, res) => {
  try {
    const {
      count = 100,
      difficulty = 'intermediate',
      theme = 'general',
      minLength = 3,
      maxLength = 7,
      customPrompt = '',
    } = req.body;

    const wordCount = Math.min(Math.max(parseInt(count, 10) || 100, 10), 300);

    const systemInstruction = `You are an expert Arabic linguist and typing speed test curator specializing in 10FastFingers and Monkeytype Arabic wordlists.
Rules:
1. Provide a list of exactly ${wordCount} unique, natural, high-frequency Modern Standard Arabic words.
2. ABSOLUTELY NO DIACRITICS OR TASHKEEL (no fatḥah, ḍammah, kasrah, sukūn, tanwīn, shaddah). Every word must be completely unvocalized.
3. ABSOLUTELY NO TATWEEL/KASHIDA (ـ), no punctuation, no English letters, no digits.
4. Each word should ideally be between ${minLength} and ${maxLength} Arabic letters in length.
5. Difficulty level: ${difficulty}. Theme: ${theme}.
6. Ensure words are comfortable for touch typing flow (good keyboard hand rhythm on Arabic layout).
7. Return strictly a JSON array of clean Arabic strings.`;

    const promptText = `Generate ${wordCount} clean Arabic typing test words for ${difficulty} level with theme '${theme}'. ${
      customPrompt ? `Additional instructions: ${customPrompt}` : ''
    }`;

    const parsed = await callGeminiWithFallback(async (ai, model) => {
      const response = await ai.models.generateContent({
        model,
        contents: promptText,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              words: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Array of clean unvocalized Arabic words',
              },
            },
            required: ['words'],
          },
        },
      });
      return JSON.parse(response.text || '{}');
    });

    const words: string[] = (parsed.words || [])
      // Ensure local post-cleanup to be 100% sure no diacritics slipped through
      .map((w: string) =>
        w
          .replace(/[\u064B-\u065F\u0670\u0640\u06D6-\u06ED]/g, '')
          .replace(/[^\u0600-\u06FF]/g, '')
          .trim()
      )
      .filter((w: string) => w.length >= minLength && w.length <= maxLength);

    res.json({ success: true, count: words.length, words });
  } catch (error: any) {
    console.error('Error generating wordlist:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate wordlist with Gemini AI',
    });
  }
});

// API: Generate clean Arabic practice paragraph for typing test
app.post('/api/gemini/paragraph', async (req, res) => {
  try {
    const { topic = 'general knowledge, science, or literature', length = 'medium' } = req.body;

    const targetWords = length === 'short' ? 40 : length === 'long' ? 120 : 70;

    const systemInstruction = `You are a professional Arabic typing test author.
Write an engaging, fluent Modern Standard Arabic paragraph about: ${topic}.
CRITICAL RULES:
1. Target length: approximately ${targetWords} words.
2. ABSOLUTELY ZERO DIACRITICS OR TASHKEEL (no fatḥah, ḍammah, kasrah, sukūn, tanwīn, shaddah).
3. NO tatweel (ـ).
4. Only natural space-separated Arabic words suitable for typing tests. Minimal punctuation (periods and commas only).
5. High quality, inspirational, natural phrasing.`;

    const parsed = await callGeminiWithFallback(async (ai, model) => {
      const response = await ai.models.generateContent({
        model,
        contents: `Write a typing speed practice paragraph about ${topic} (${targetWords} words).`,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              text: { type: Type.STRING },
            },
            required: ['title', 'text'],
          },
        },
      });
      return JSON.parse(response.text || '{}');
    });

    const cleanText = (parsed.text || '')
      .replace(/[\u064B-\u065F\u0670\u0640\u06D6-\u06ED]/g, '')
      .trim();

    res.json({
      success: true,
      title: parsed.title || 'فقرة للتدريب',
      text: cleanText,
    });
  } catch (error: any) {
    console.error('Error generating typing paragraph:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate typing paragraph with Gemini AI',
    });
  }
});

// Setup dev server with Vite middlewares or static files for production
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
