import { readFileSync } from "fs";

const k = JSON.parse(readFileSync("./data/knowledge.json", "utf8"));

// ── Helpers (mirror lib/matcher.ts logic) ───────────────────────────────────

function normalize(text) {
  return text
    .toLowerCase()
    .replace(/[.,!?;:'"„"…—–\-]/g, " ")
    .replace(/ą/g, "a").replace(/ć/g, "c").replace(/ę/g, "e")
    .replace(/ł/g, "l").replace(/ń/g, "n").replace(/ó/g, "o")
    .replace(/ś/g, "s").replace(/ź/g, "z").replace(/ż/g, "z")
    .replace(/\s+/g, " ")
    .trim();
}

function phraseScore(kw) {
  const n = kw.split(" ").length;
  return (n * (n + 1)) / 2;
}

function levenshtein(a, b) {
  if (Math.abs(a.length - b.length) > 2) return 99;
  const m = a.length, n = b.length;
  let prev = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    const curr = [i];
    for (let j = 1; j <= n; j++) {
      curr[j] = a[i - 1] === b[j - 1] ? prev[j - 1] : 1 + Math.min(prev[j], curr[j - 1], prev[j - 1]);
    }
    prev = curr;
  }
  return prev[n];
}

function maxEditDist(word) {
  if (word.length <= 5) return 0;
  if (word.length <= 6) return 1;
  return 2;
}

function wordFuzzyMatchesInput(kwWord, inputWords) {
  const limit = maxEditDist(kwWord);
  return inputWords.some(w => levenshtein(w, kwWord) <= limit);
}

function keywordMatches(normalizedInput, normalizedKw, inputWords) {
  if (normalizedInput.includes(normalizedKw)) return true;
  const kwWords = normalizedKw.split(" ");
  return kwWords.every(kw => wordFuzzyMatchesInput(kw, inputWords));
}

function scoreIntent(normalizedInput, keywords) {
  const inputWords = normalizedInput.split(/\s+/);
  let score = 0;
  for (const raw of keywords) {
    const kw = normalize(raw);
    if (keywordMatches(normalizedInput, kw, inputWords)) score += phraseScore(kw);
  }
  return score;
}

function matchIntent(userInput) {
  const n = normalize(userInput);
  const crisisScore = scoreIntent(n, k.crisis.keywords);
  if (crisisScore > 0) return { intentId: "CRISIS", score: crisisScore };

  const scored = k.intents.map(i => ({ id: i.id, score: scoreIntent(n, i.keywords) }));
  scored.sort((a, b) => b.score - a.score);
  const best = scored[0];
  if (!best || best.score === 0) return { intentId: "FALLBACK", score: 0 };
  return { intentId: best.id, score: best.score };
}

// ── Test cases ───────────────────────────────────────────────────────────────
const tests = [
  // Phase 2 new
  ["Nie wiem, do której specjalistki się umówić.", "dobor_specjalistki"],
  ["Nie wiem czego potrzebuję", "dobor_specjalistki"],
  ["Czuję ciągłe zmęczenie i przeciążenie", "wypalenie"],
  ["Mam trudności w relacjach", "relacje"],
  ["Podejrzewam u siebie ADHD", "adhd"],
  ["Mam trudności związane z menopauzą", "menopauza"],
  ["Jak wygląda pierwsze spotkanie?", "pierwsza_wizyta"],
  ["Jak szybko mogę dostać termin?", "termin_oczekiwania"],
  ["Lęk i stres", null], // quiz option — not matched by keywords, handled separately in UI
  ["Czuję lęk i napięcie", "lek_napady_paniki"],
  ["Nie radzę sobie ze stresem", "stres_praca"],
  ["Mam problem z jedzeniem i emocjami", "zaburzenia_odzywiania"],
  ["Wsparcie seksuologiczne", "seksuologia"],
  ["Relacja z własnym ciałem", "praca_z_cialem"],
  // Phase 1 verified
  ["Nienawidzę siebie", "niska_samoocena"],
  ["Jestem bardzo samotna", "depresja_smutek"],
  ["Rozstałam się z partnerem", "depresja_smutek"],
  ["Co jeśli nie będę zadowolona z terapii?", "zmiana_terapeutki"],
  ["Czuję się tragicznie", "depresja_smutek"],
  ["Czuję się fatalnie", "depresja_smutek"],
  // Crisis must always win
  ["Chcę się zabić", "CRISIS"],
  ["Nie mam siły żyć", "CRISIS"],
  ["Chcę zrobić sobie krzywdę", "CRISIS"],
  // Other basics
  ["Czy przyjmujecie nastolatki?", "dla_kogo"],
  ["Czy przyjmujecie mężczyzn?", "dla_kogo"],
  ["Jakie są ceny wizyt?", "cennik"],
  ["Gdzie jesteście?", "adres"],
  ["Jak odwołać wizytę?", "odwolanie"],
];

let pass = 0, fail = 0;
for (const [query, expected] of tests) {
  const got = matchIntent(query);
  const ok = expected === null || got.intentId === expected;
  if (ok) {
    pass++;
    console.log(`  ✓  [${got.intentId}] "${query}"`);
  } else {
    fail++;
    console.log(`  ✗  expected=${expected} got=${got.intentId}(${got.score}) — "${query}"`);
  }
}

console.log(`\n${pass}/${pass + fail} passed${fail > 0 ? " ← FAILURES ABOVE" : ""}`);
