import knowledge from "@/data/knowledge.json";

export interface MatchResult {
  response: string;
  intentId: string | null;
  score: number;
  isCrisis: boolean;
  isFallback: boolean;
}

const GENERIC_INTENT_IDS = new Set(["cennik", "platnosc"]);
const PRICE_SINGLE_TRIGGERS = new Set(["cena", "koszt", "koszty"]);
const PRICE_PHRASE_TRIGGERS = [
  "ile kosztuje", "ile kosztuja", "ile kosztujecie",
  "co kosztuje", "za ile",
  "jaka cena", "jaki koszt", "jakie ceny", "jakie sa ceny",
  "ile place", "ile placi",
];

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/ą/g, "a").replace(/ć/g, "c").replace(/ę/g, "e")
    .replace(/ł/g, "l").replace(/ń/g, "n").replace(/ó/g, "o")
    .replace(/ś/g, "s").replace(/ź/g, "z").replace(/ż/g, "z")
    .trim();
}

// Triangular scoring: n-word phrase = n*(n+1)/2 points
function phraseScore(normalizedKw: string): number {
  const n = normalizedKw.split(" ").length;
  return (n * (n + 1)) / 2;
}

// ── Fuzzy matching (Levenshtein) ──────────────────────────────────────────────

// Standard Levenshtein distance (space-optimised, two-row DP).
// Returns 99 early when length difference alone exceeds the max allowed distance.
function levenshtein(a: string, b: string): number {
  if (Math.abs(a.length - b.length) > 2) return 99;
  const m = a.length, n = b.length;
  let prev = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    const curr: number[] = [i];
    for (let j = 1; j <= n; j++) {
      curr[j] =
        a[i - 1] === b[j - 1]
          ? prev[j - 1]
          : 1 + Math.min(prev[j], curr[j - 1], prev[j - 1]);
    }
    prev = curr;
  }
  return prev[n];
}

// How many typos we tolerate per keyword word, based on word length:
//   ≤ 3 chars  → 0  (short words must be exact – avoids noise)
//   4–5 chars  → 1  (e.g. "leki" ≈ "leku", "adres" ≈ "adrs")
//   ≥ 6 chars  → 2  (e.g. "psycholog" ≈ "psyholog", "terapia" ≈ "terapi")
function maxEditDist(word: string): number {
  if (word.length <= 3) return 0;
  if (word.length <= 5) return 1;
  return 2;
}

// Checks whether a single keyword word fuzzy-matches any word in the input.
function wordFuzzyMatchesInput(kwWord: string, inputWords: string[]): boolean {
  const limit = maxEditDist(kwWord);
  return inputWords.some(w => levenshtein(w, kwWord) <= limit);
}

// Full keyword match: first try exact substring (fast path), then fuzzy word-by-word.
function keywordMatches(normalizedInput: string, normalizedKw: string, inputWords: string[]): boolean {
  // Fast path — exact substring (same as before, handles all correct inputs instantly)
  if (normalizedInput.includes(normalizedKw)) return true;

  // Fuzzy path — every word in the keyword must fuzzy-match some word in the input
  const kwWords = normalizedKw.split(" ");
  return kwWords.every(kwWord => wordFuzzyMatchesInput(kwWord, inputWords));
}

function scoreIntent(normalizedInput: string, keywords: string[]): number {
  const inputWords = normalizedInput.split(/\s+/);
  let score = 0;
  for (const raw of keywords) {
    const kw = normalize(raw);
    if (keywordMatches(normalizedInput, kw, inputWords)) {
      score += phraseScore(kw);
    }
  }
  return score;
}

function hasPriceTrigger(normalizedInput: string): boolean {
  const tokens = normalizedInput.split(/\s+/);
  if (tokens.some(t => PRICE_SINGLE_TRIGGERS.has(t))) return true;
  return PRICE_PHRASE_TRIGGERS.some(p => normalizedInput.includes(normalize(p)));
}

export function matchIntent(userInput: string): MatchResult {
  const normalizedInput = normalize(userInput);

  // Crisis check — always highest priority.
  const crisisScore = scoreIntent(normalizedInput, knowledge.crisis.keywords);
  if (crisisScore > 0) {
    return {
      response: knowledge.crisis.response,
      intentId: "crisis",
      score: crisisScore,
      isCrisis: true,
      isFallback: false,
    };
  }

  const scored = knowledge.intents.map(intent => ({
    intent,
    score: scoreIntent(normalizedInput, intent.keywords),
  }));
  scored.sort((a, b) => b.score - a.score);

  const best = scored[0];

  if (!best || best.score === 0) {
    return {
      response: knowledge.fallback,
      intentId: null,
      score: 0,
      isCrisis: false,
      isFallback: true,
    };
  }

  // Disambiguation: prefer specific intent over generic cennik when price is asked.
  if (GENERIC_INTENT_IDS.has(best.intent.id) && hasPriceTrigger(normalizedInput)) {
    const specificMatch = scored.find(
      s => s.score >= 3 && !GENERIC_INTENT_IDS.has(s.intent.id)
    );
    if (specificMatch) {
      return {
        response: specificMatch.intent.response,
        intentId: specificMatch.intent.id,
        score: specificMatch.score,
        isCrisis: false,
        isFallback: false,
      };
    }
  }

  return {
    response: best.intent.response,
    intentId: best.intent.id,
    score: best.score,
    isCrisis: false,
    isFallback: false,
  };
}
