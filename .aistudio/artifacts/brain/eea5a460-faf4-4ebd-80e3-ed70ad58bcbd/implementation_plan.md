# Arabic Text Analyzer & 10FastFingers Wordlist Studio (محلل النصوص وقوائم الطباعة السريعة)

A high-performance Arabic text analysis and wordlist generation platform designed to analyze Arabic texts, calculate word repetitions, letter distributions, and frequency percentages, and curate clean, diacritic-free Arabic wordlists tailored for typing speed test platforms like **10FastFingers** and **Monkeytype**, featuring a live typing simulator and Gemini AI wordlist curation.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> The requirements confirmed during interview clarifications have been directly incorporated into the product architecture:
> - **Primary Application Goal**: Specifically designed for generating, filtering, and curating high-quality Arabic wordlists for typing speed tests (such as 10FastFingers, Monkeytype, and Keybr).
> - **Diacritics & Vocalization**: Strict removal and filtering of all diacritics (تَشْكِيل: fatḥah, ḍammah, kasrah, sukūn, tanwīn, shaddah) and tatweel (`ـ`), outputting clean, normalized Arabic tokens optimal for fluid typing.
> - **Frequency Baseline**: Dual frequency model—in-text frequency metrics combined with a built-in pre-indexed Modern Standard Arabic (MSA) frequency corpus to rank words against real-world Arabic usage and generate standard Top 50, Top 100, Top 200, and Top 1000 typing lists.

---

## 1. Overview & Core Concept

### What It Does
1. **In-Depth Arabic Linguistic & Statistical Engine**:
   - Computes total words, unique lexical items, character counts, average word length, and Lexical Density / Type-Token Ratio (TTR).
   - Counts exact word repetitions and calculates both relative frequency within the text and cumulative frequency percentiles.
   - Full Arabic letter frequency analysis (أ إلى ي, hamza variations, taa marbuta) with percentage breakdowns and tabular figures.
2. **10FastFingers Wordlist Studio**:
   - Filters words by length (e.g., 2–4 letters for speed drills, 5–7 for intermediate, 8+ for endurance).
   - Generates randomized or ranked Top N wordlists (Top 50, Top 100, Top 200 standard, Top 500, Top 1000).
   - One-click copy in 10FastFingers format (space-separated single row), CSV, line-by-line, and JSON.
3. **Interactive 10FastFingers Arabic Typing Simulator**:
   - An integrated 60-second speed test to immediately practice typing the generated wordlist or analyzed text.
   - Real-time word highlight (green on correct, red on error), instantaneous WPM (Words Per Minute), Net WPM, CPM, and Accuracy percentage.
4. **Gemini AI Typing Assistant (`gemini-3.8-flash`)**:
   - **AI Wordlist Generator**: Generates balanced, natural Arabic word sets optimized for typing rhythm and keyboard finger balance.
   - **AI Text Cleaner & Sanitizer**: Filters out archaic oddities, typos, or disjointed words from raw imported texts.
   - **AI Practice Paragraph Generator**: Composes engaging, natural Modern Standard Arabic typing paragraphs free of diacritics and friction-heavy symbols.

---

## 2. User Experience & Visual Design

### Aesthetic & Domain Styling
- **Visual Direction**: Modern SaaS Analytics & Typographic Workbench. Clean, distraction-free, high-legibility interface supporting both Arabic RTL and English LTR seamlessly.
- **Typography**:
  - Arabic Display & Body: Cairo / Tajawal / Amiri font stack with generous line heights (1.65) and clear glyph distinction for speed reading.
  - Metrics & Tables: Strict tabular numerals (`font-mono tabular-nums`) preventing layout jitter.
- **Color Discipline (60-30-10)**:
  - 60% Canvas: Neutral crisp slate background (`#0B0F17` dark / `#F8FAFC` light).
  - 30% Structural: Subdued borders (`rgba(255,255,255,0.08)` or `slate-200`), elevated analytical cards, hairline tab dividers.
  - 10% Accents: Energetic Emerald (`#10B981`) for correct keystrokes, focused typing, and export actions; Amber (`#F59E0B`) for warnings; Crimson (`#EF4444`) for typing errors.
- **Zero-Pill Restraint**: Metadata rendered as clean unboxed typographic rows with subtle separators (`·`); interactive filter controls styled as functional segmented buttons.

### Key User Flows
1. **Analyze Text Flow**:
   - Paste Arabic text, drop a file, or choose from realistic sample texts (Arabic journalism, literature, general knowledge).
   - Instant live calculation updates summary statistics, word frequency table, and letter distribution.
2. **Curate & Export 10FastFingers List Flow**:
   - Navigate to "Wordlist Generator" tab; choose word count (Top 50, 100, 200, 500) and character length filter.
   - Preview randomized or frequency-ranked word stream.
   - Click "Copy for 10FastFingers" or "Download Wordlist".
3. **Typing Test Simulator Flow**:
   - Jump directly into the built-in typing arena with the active wordlist.
   - Type in real-time with spacebar advances; review final score card with WPM, accuracy, and error list.
4. **AI Linguistic Enhancement Flow**:
   - Request Gemini to generate a tailored 200-word typing test or sanitize an uploaded text.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Full-Client Real-Time Normalization + Server-Side Gemini API**
  - *Chosen Approach*: Instant client-side Arabic regex tokenizer and diacritic stripper for zero latency on keystrokes and text changes; server-side `/api/gemini` proxy for AI generation tasks.
  - *Why*: Instant feedback when analyzing multi-thousand word texts without server roundtrips, while strictly keeping API keys on the server as mandated.
- **Decision 2: Comprehensive Arabic Normalization Engine**
  - *Chosen Approach*: Strip harakat (Unicode `\u064B-\u065F`, `\u0670`), tatweel (`\u0640`), honorific symbols, and non-Arabic punctuation. Offer optional toggle for Hamza normalization (أ إ آ -> ا) so users can either practice precise spelling or standardized roots.
  - *Why*: 10FastFingers tests penalize mismatched diacritics heavily; clean normalization guarantees smooth, frustration-free typing practice.
- **Decision 3: Integrated Standard Arabic Frequency Corpus**
  - *Chosen Approach*: Ship an embedded, verified lexicon of the top 2,000 most frequent Modern Standard Arabic words alongside the custom text analyzer.
  - *Why*: Enables users to generate classic 10FastFingers-style wordlists immediately, even if they don't have a large text to upload.

---

## 4. Technical Architecture & Data Strategy

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            Frontend (React + Tailwind)                       │
├─────────────────────────────────────────────────────────────────────────────┤
│  Top Bar: Title, Quick Presets, Language/Theme Toggles, Export Shortcuts   │
├─────────────────────────────────────────────────────────────────────────────┤
│  Tabs:                                                                      │
│  [1. Text Analyzer]  [2. 10FastFingers Wordlists]  [3. Typing Simulator]    │
│  [4. Letter Analytics]  [5. AI Assistant]                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│  Core Engines:                                                              │
│  ├── ArabicNLP: normalizeText(), stripTashkeel(), tokenizeArabic()          │
│  ├── StatsEngine: wordFrequencies(), letterFrequencies(), TTR, metrics      │
│  ├── CorpusDatabase: Top 2,000 Common Arabic Words with frequency ranks    │
│  └── TypingEngine: 60s timer, WPM/CPM math, error indexing, keyboard audio  │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ POST /api/gemini/generate
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          Express / Vite Server Middleware                   │
├─────────────────────────────────────────────────────────────────────────────┤
│  Server-side GoogleGenAI SDK (`gemini-3.8-flash`)                           │
│  Endpoints:                                                                 │
│  ├── POST /api/gemini/wordlist (Generate balanced typing lists)             │
│  └── POST /api/gemini/sanitize (Clean & optimize raw Arabic text)           │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Component Hierarchy
- `App.tsx`: Main layout, navigation header, tab routing, notifications.
- `components/TextAnalyzerView.tsx`: Input text area, metrics overview, frequency table with search & filters.
- `components/WordlistGeneratorView.tsx`: 10FastFingers preset builder, length sliders, shuffle, copy/export options.
- `components/TypingSimulatorView.tsx`: Real-time 60s typing test, caret navigation, real-time WPM/accuracy, results modal.
- `components/LetterAnalyticsView.tsx`: Arabic alphabet frequency chart and tabular letter breakdown.
- `components/AiAssistantView.tsx`: Gemini-powered wordlist generation and text refinement.
- `lib/arabicTokenizer.ts`: Arabic normalization, diacritic stripping, tokenization.
- `lib/arabicCorpus.ts`: Curated top 2,000 common Modern Standard Arabic typing words.
- `server.ts` & `vite.config.ts`: Server proxy for `@google/genai` calls.

---

## 5. Verification Plan

1. **Compilation & Build**: Run `compile_applet` to ensure zero TypeScript and build errors.
2. **Text Normalization Testing**:
   - Verify complete stripping of tashkeel (fatḥah, ḍammah, kasrah, sukūn, tanwīn, shaddah) and tatweel.
   - Verify word counts, unique counts, repetition calculations, and percentage distributions.
3. **10FastFingers Export Verification**:
   - Confirm generated wordlists are space-delimited, single-line, clean, and copyable with one click.
4. **Live Typing Simulator Testing**:
   - Test typing speed measurement, accuracy calculation, error handling, space advance, and 60-second countdown.
5. **AI Integration**:
   - Verify server-side Gemini API calls return clean, diacritic-free Arabic wordlists matching user prompts.
