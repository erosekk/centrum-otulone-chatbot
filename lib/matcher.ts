import knowledge from "@/data/knowledge.json";

export interface MatchResult {
  response: string;
  intentId: string | null;
  score: number;
  isCrisis: boolean;
  isFallback: boolean;
}

// Intents that return a generic catalogue rather than a specific service answer.
// When one of these would win but a service-specific intent also matches,
// we prefer the specific one so "ile kosztuje terapia par" → terapia_par,
// not the full cennik dump.
const GENERIC_INTENT_IDS = new Set(["cennik", "platnosc"]);

// Trigger words/phrases that signal a price question.
// Single-word triggers are checked as whole tokens to avoid false substring
// hits (e.g. "cennik" must not match standalone "cena").
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

// Triangular scoring: an n-word phrase earns n*(n+1)/2 points.
//   1 word  →  1 pt   (e.g. "adhd")
//   2 words →  3 pts  (e.g. "terapia par")
//   3 words →  6 pts  (e.g. "terapia dla par")
//   4 words → 10 pts  (e.g. "ile kosztuje terapia par")
// Longer, more specific phrases naturally outrank shorter generic ones.
function phraseScore(normalizedKw: string): number {
  const n = normalizedKw.split(" ").length;
  return (n * (n + 1)) / 2;
}

function scoreIntent(normalizedInput: string, keywords: string[]): number {
  let score = 0;
  for (const raw of keywords) {
    const kw = normalize(raw);
    if (normalizedInput.includes(kw)) {
      score += phraseScore(kw);
    }
  }
  return score;
}

// Returns true when the input clearly contains a price-related word or phrase.
function hasPriceTrigger(normalizedInput: string): boolean {
  const tokens = normalizedInput.split(/\s+/);
  if (tokens.some(t => PRICE_SINGLE_TRIGGERS.has(t))) return true;
  return PRICE_PHRASE_TRIGGERS.some(p => normalizedInput.includes(normalize(p)));
}

export function matchIntent(userInput: string): MatchResult {
  const normalizedInput = normalize(userInput);

  // Crisis check — always highest priority regardless of other scores.
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

  // Score every intent, then sort descending so index-0 is the best match.
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

  // Disambiguation: if the top-scoring intent is a generic catalogue (cennik)
  // AND the query contains a price trigger, AND a service-specific intent also
  // matched — prefer the specific answer over the generic price list.
  // Example: "ile kosztuje terapia par" → cennik wins on raw score, but
  // terapia_par matched "terapia par", so we return terapia_par instead.
  //
  // Guard: specific intent must score at least as high as the generic intent.
  // This prevents vague single-word matches (e.g. "konsultacja" = 1 pt) from
  // overriding the cennik when the user clearly asked for a price list.
  if (GENERIC_INTENT_IDS.has(best.intent.id) && hasPriceTrigger(normalizedInput)) {
    // Minimum score of 3 ≈ a 2-word phrase match (triangular: 2*3/2=3).
    // Single-word matches (score=1) are too vague to override the cennik.
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
