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
    .replace(/[.,!?;:'"„"…—–\-]/g, " ")
    .replace(/ą/g, "a").replace(/ć/g, "c").replace(/ę/g, "e")
    .replace(/ł/g, "l").replace(/ń/g, "n").replace(/ó/g, "o")
    .replace(/ś/g, "s").replace(/ź/g, "z").replace(/ż/g, "z")
    .replace(/\s+/g, " ")
    .trim();
}

// Triangular scoring: n-word phrase = n*(n+1)/2 points
function phraseScore(normalizedKw: string): number {
  const n = normalizedKw.split(" ").length;
  return (n * (n + 1)) / 2;
}

// ── Fuzzy matching (Damerau-Levenshtein, optimal string alignment) ─────────────

// Damerau-Levenshtein (OSA) distance: like Levenshtein but counts a transposition
// of two ADJACENT characters as a single edit. Transpositions ("wiztya"→"wizyta",
// "bjie"→"bije") are the most common fast-typing error, so this catches far more
// real typos than plain Levenshtein without loosening the per-word thresholds.
// Returns 99 early when length difference alone exceeds the max allowed distance.
function levenshtein(a: string, b: string): number {
  if (Math.abs(a.length - b.length) > 2) return 99;
  const m = a.length, n = b.length;
  // Full DP matrix (needed to look back two rows for the transposition rule).
  const d: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) d[i][0] = i;
  for (let j = 0; j <= n; j++) d[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(
        d[i - 1][j] + 1,        // deletion
        d[i][j - 1] + 1,        // insertion
        d[i - 1][j - 1] + cost, // substitution
      );
      // Adjacent transposition (a[i-1]a[i-2] swapped with b[j-1]b[j-2]).
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
      }
    }
  }
  return d[m][n];
}

// How many typos we tolerate per keyword word, based on word length.
//
// Two profiles:
//  • standard — used for normal intents. Short words must be exact to avoid
//    false positives like "sobie"≈"fobie" or "nie"≈"mnie".
//      ≤5 → 0,  6 → 1,  ≥7 → 2
//  • lenient (crisis only) — for crisis detection the cost of MISSING a real
//    signal far outweighs an occasional false alarm, so we tolerate one typo
//    on 4–5 char words too (e.g. "domu"≈"domyu", "bije"≈"bjie"). Words ≤3 chars
//    still require an exact match (protects "nie", "do", "się" from drifting,
//    and stops "żyć"/"zyc"≈"być"/"byc" from misfiring).
function maxEditDist(word: string, lenient = false): number {
  if (lenient) {
    if (word.length <= 3) return 0;
    if (word.length <= 5) return 1;
    if (word.length <= 6) return 1;
    return 2;
  }
  if (word.length <= 5) return 0;
  if (word.length <= 6) return 1;
  return 2;
}

// Checks whether a single keyword word fuzzy-matches any word in the input.
function wordFuzzyMatchesInput(kwWord: string, inputWords: string[], lenient = false): boolean {
  const limit = maxEditDist(kwWord, lenient);
  return inputWords.some(w => levenshtein(w, kwWord) <= limit);
}

// Full keyword match: first try exact substring (fast path), then fuzzy word-by-word.
function keywordMatches(normalizedInput: string, normalizedKw: string, inputWords: string[], lenient = false): boolean {
  // Fast path — exact substring (same as before, handles all correct inputs instantly)
  if (normalizedInput.includes(normalizedKw)) return true;

  // Fuzzy path — every word in the keyword must fuzzy-match some word in the input
  const kwWords = normalizedKw.split(" ");
  return kwWords.every(kwWord => wordFuzzyMatchesInput(kwWord, inputWords, lenient));
}

function scoreIntent(normalizedInput: string, keywords: string[], lenient = false): number {
  const inputWords = normalizedInput.split(/\s+/);
  const seen = new Set<string>();
  let score = 0;
  for (const raw of keywords) {
    const kw = normalize(raw);
    if (seen.has(kw)) continue; // skip duplicate normalized forms
    seen.add(kw);
    if (keywordMatches(normalizedInput, kw, inputWords, lenient)) {
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

  // Crisis check — always highest priority. Uses lenient fuzzy matching so that
  // typos in distress messages ("domyu", "bjie") still trigger the safety response.
  const crisisScore = scoreIntent(normalizedInput, knowledge.crisis.keywords, true);
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
