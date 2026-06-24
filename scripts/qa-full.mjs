/**
 * Pełny test jakości (QA) — 130+ scenariuszy
 * Uruchom:  node scripts/qa-full.mjs
 */

import { readFileSync } from "fs";

const k = JSON.parse(readFileSync("./data/knowledge.json", "utf8"));

// ── Mirror matcher logic ──────────────────────────────────────────────────────

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

function levenshtein(a,b){if(Math.abs(a.length-b.length)>2)return 99;const m=a.length,n=b.length;const d=Array.from({length:m+1},()=>new Array(n+1).fill(0));for(let i=0;i<=m;i++)d[i][0]=i;for(let j=0;j<=n;j++)d[0][j]=j;for(let i=1;i<=m;i++){for(let j=1;j<=n;j++){const c=a[i-1]===b[j-1]?0:1;d[i][j]=Math.min(d[i-1][j]+1,d[i][j-1]+1,d[i-1][j-1]+c);if(i>1&&j>1&&a[i-1]===b[j-2]&&a[i-2]===b[j-1])d[i][j]=Math.min(d[i][j],d[i-2][j-2]+1);}}return d[m][n];}

function maxEditDist(word,lenient){if(lenient){if(word.length<=3)return 0;if(word.length<=6)return 1;return 2;}if(word.length<=5)return 0;if(word.length<=6)return 1;return 2;}

function wordFuzzyMatchesInput(kwWord, inputWords, lenient) {
  const limit = maxEditDist(kwWord, lenient);
  return inputWords.some(w => levenshtein(w, kwWord) <= limit);
}

function keywordMatches(normalizedInput, normalizedKw, inputWords, lenient) {
  if (normalizedInput.includes(normalizedKw)) return true;
  const kwWords = normalizedKw.split(" ");
  return kwWords.every(kw => wordFuzzyMatchesInput(kw, inputWords, lenient));
}

function scoreIntent(normalizedInput, keywords) {
  const inputWords = normalizedInput.split(/\s+/);
  const seen = new Set();
  let score = 0;
  for (const raw of keywords) {
    const kw = normalize(raw);
    if (seen.has(kw)) continue;
    seen.add(kw);
    if (keywordMatches(normalizedInput, kw, inputWords)) score += phraseScore(kw);
  }
  return score;
}

function matchIntent(userInput) {
  const n = normalize(userInput);
  const crisisScore = scoreIntent(n, k.crisis.keywords, true);
  if (crisisScore > 0) return { intentId: "CRISIS", score: crisisScore };

  const scored = k.intents.map(i => ({ id: i.id, score: scoreIntent(n, i.keywords) }));
  scored.sort((a, b) => b.score - a.score);
  const best = scored[0];
  if (!best || best.score === 0) return { intentId: "FALLBACK", score: 0 };
  return { intentId: best.id, score: best.score };
}

// ── Test cases ───────────────────────────────────────────────────────────────

// Format: [query, expected_intent_or_null, category, note_if_tricky]
// null expected = acceptable to go anywhere (only test for FALLBACK avoidance)
// expected="FALLBACK" = expected to fallback (not yet covered)

const tests = [
  // ── A) Pierwszy kontakt ──────────────────────────────────────────────────
  ["Nigdy nie byłam u psychologa.", "jak_zaczac", "A", "Nowy użytkownik"],
  ["Nie wiem od czego zacząć.", "jak_zaczac", "A", "Powinna trafiać do jak_zaczac (nie firstazyta) po dedup"],
  ["Szukam pomocy.", "wsparcie_psychologiczne", "A", "Ogólna prośba o pomoc"],
  ["Szukam pomocy psychologicznej.", "wsparcie_psychologiczne", "A"],
  ["Czy terapia jest dla mnie?", "psychoterapia", "A"],
  ["Boję się pierwszej wizyty.", "pierwsza_wizyta", "A", "Strach przed wizytą"],
  ["Czy będę oceniana?", "psychoterapia", "A", "Niepewność — brak osądzania"],
  ["Nie wiem czy terapia jest dla mnie.", "psychoterapia", "A"],
  ["Dopiero zaczynam i nie wiem od czego zacząć.", "jak_zaczac", "A"],
  ["Chcę zacząć terapię ale nie wiem jak.", "jak_zaczac", "A"],

  // ── B) Psychoterapia ─────────────────────────────────────────────────────
  ["Chcę rozpocząć terapię.", "psychoterapia", "B"],
  ["Szukam psychoterapii.", "psychoterapia", "B"],
  ["Potrzebuję psychologa.", "wsparcie_psychologiczne", "B"],
  ["Potrzebuję konsultacji.", "wsparcie_psychologiczne", "B"],
  ["Nie wiem czy potrzebuję psychologa czy terapii.", "roznice_specjalistow", "B", "Powinna trafić do różnic specjalistów"],
  ["Czym różni się psycholog od psychoterapeuty?", "roznice_specjalistow", "B"],
  ["Psycholog czy psychiatra?", "roznice_specjalistow", "B"],
  ["Chcę porozmawiać z kimś.", "wsparcie_psychologiczne", "B"],
  ["Potrzebuję kogoś do rozmowy.", "wsparcie_psychologiczne", "B"],
  ["Czy terapia działa?", "psychoterapia", "B"],

  // ── C) ADHD ──────────────────────────────────────────────────────────────
  ["Podejrzewam ADHD.", "adhd", "C"],
  ["Nie mogę się skupić.", "adhd", "C"],
  ["Mam chaos w głowie.", "adhd", "C"],
  ["Odkładam wszystko na później.", "adhd", "C", "Prokrastynacja"],
  ["Czy to może być ADHD?", "adhd", "C"],
  ["Jak wygląda diagnoza ADHD?", "adhd", "C"],
  ["Co to jest DIVA5?", "adhd", "C"],
  ["Mam problem z koncentracją.", "adhd", "C"],
  ["Zapominam o wszystkim.", "adhd", "C"],
  ["Mam ADHD i chcę się zdiagnozować.", "adhd", "C"],

  // ── D) Relacje ────────────────────────────────────────────────────────────
  ["Mam problemy w związku.", "terapia_par", "D", "Może trafiać do terapia_par lub relacje"],
  ["Kłócimy się codziennie.", "relacje", "D"],
  ["Rozstałam się.", "depresja_smutek", "D", "Rozstanie = smutek"],
  ["Zostałam zdradzona.", "terapia_par", "D", "Zdrada"],
  ["Nie potrafię postawić granic.", "relacje", "D", "Granice"],
  ["Jestem samotna.", "depresja_smutek", "D"],
  ["Mam trudności w relacjach.", "relacje", "D"],
  ["Kryzys w związku.", "terapia_par", "D"],
  ["Mój partner mnie nie rozumie.", "relacje", "D"],
  ["Mam toksyczną rodzinę.", "relacje", "D"],

  // ── E) Lęk i stres ───────────────────────────────────────────────────────
  ["Mam ataki paniki.", "lek_napady_paniki", "E"],
  ["Jestem ciągle spięta.", "lek_napady_paniki", "E"],
  ["Nie mogę się uspokoić.", "lek_napady_paniki", "E"],
  ["Mam natłok myśli.", "lek_napady_paniki", "E"],
  ["Boję się o przyszłość.", "lek_napady_paniki", "E"],
  ["Nie radzę sobie ze stresem.", "stres_praca", "E"],
  ["Jestem stale zdenerwowana.", "lek_napady_paniki", "E"],
  ["Mam lęk społeczny.", "lek_napady_paniki", "E"],
  ["Boję się wychodzić z domu.", "lek_napady_paniki", "E", "Agorafobia"],
  ["Serce mi kołata ze stresu.", "lek_napady_paniki", "E"],

  // ── F) Menopauza ─────────────────────────────────────────────────────────
  ["Mam 50 lat i nie poznaję siebie.", "menopauza", "F", "Wiek + zmiana = menopauza"],
  ["Mam uderzenia gorąca.", "menopauza", "F"],
  ["Hormony mnie wykańczają.", "menopauza", "F", "Brakujące słowo kluczowe"],
  ["Jestem bardzo rozdrażniona.", "menopauza", "F", "Drażliwość przy menopauzie"],
  ["Mam problemy ze snem.", "zaburzenia_snu", "F"],
  ["Jestem w menopauzie i potrzebuję wsparcia.", "menopauza", "F"],
  ["Mam ciągłe wahania nastroju.", "menopauza", "F"],
  ["Mam klimakterium.", "menopauza", "F"],

  // ── G) Jedzenie i ciało ───────────────────────────────────────────────────
  ["Objadam się wieczorami.", "zaburzenia_odzywiania", "G"],
  ["Mam problem z jedzeniem.", "zaburzenia_odzywiania", "G"],
  ["Nienawidzę swojego ciała.", "praca_z_cialem", "G", "niska_samoocena też akceptowalna"],
  ["Wstydzę się swojego wyglądu.", "zaburzenia_odzywiania", "G"],
  ["Nie mogę przestać myśleć o jedzeniu.", "zaburzenia_odzywiania", "G"],
  ["Jem z emocji.", "zaburzenia_odzywiania", "G"],
  ["Mam relację z jedzeniem.", "zaburzenia_odzywiania", "G"],
  ["Nie lubię swojego ciała.", "praca_z_cialem", "G"],

  // ── H) Seksuologia ───────────────────────────────────────────────────────
  ["Nie mam ochoty na seks.", "seksuologia", "H"],
  ["Mam problem z intymnością.", "seksuologia", "H"],
  ["Seks mnie stresuje.", "seksuologia", "H", "Błąd: może trafiać do stres_praca!"],
  ["Mam problem seksualny.", "seksuologia", "H"],
  ["Potrzebuję seksuologa.", "seksuologia", "H"],
  ["Seks sprawia mi ból.", "seksuologia", "H"],
  ["Brak libido.", "seksuologia", "H"],
  ["Wstydzę się swojej seksualności.", "seksuologia", "H"],

  // ── I) Organizacyjne ─────────────────────────────────────────────────────
  ["Jak umówić wizytę?", "zapisy", "I"],
  ["Jak szybko dostanę termin?", "termin_oczekiwania", "I"],
  ["Gdzie jesteście?", "adres", "I"],
  ["Jak odwołać wizytę?", "odwolanie", "I"],
  ["Czy mogę przełożyć termin?", "odwolanie", "I"],
  ["Jaki jest numer telefonu?", "kontakt", "I"],
  ["Jak się skontaktować?", "kontakt", "I"],
  ["Jakie są godziny otwarcia?", "godziny", "I"],
  ["Czy jesteście czynni w sobotę?", "godziny", "I"],
  ["Czy są sesje online?", "online", "I"],

  // ── J) Cennik ────────────────────────────────────────────────────────────
  ["Ile kosztuje terapia?", "cennik", "J"],
  ["Ile kosztuje terapia par?", "terapia_par", "J", "terapia_par zawiera cenę, akceptowalne"],
  ["Ile kosztuje diagnoza ADHD?", "cennik", "J"],
  ["Ile kosztuje konsultacja?", "cennik", "J"],
  ["Pokaż cennik.", "cennik", "J"],
  ["Jakie są ceny?", "cennik", "J"],
  ["Czy jest coś darmowego?", "bezplatna_konsultacja", "J"],
  ["Czy pierwsza wizyta jest bezpłatna?", "bezplatna_konsultacja", "J"],
  ["Czy jest refundacja NFZ?", "nfz_ubezpieczenie", "J"],
  ["Jak płacić za sesję?", "platnosc", "J"],

  // ── K) Kogo przyjmujecie ─────────────────────────────────────────────────
  ["Czy przyjmujecie mężczyzn?", "dla_kogo", "K"],
  ["Mam 17 lat.", "dla_kogo", "K"],
  ["Czy przyjmujecie nastolatki?", "dla_kogo", "K"],
  ["Czy przyjmujecie młodzież?", "dla_kogo", "K"],
  ["Czy mogę zapisać córkę?", "dla_kogo", "K"],
  ["Czy przyjmujecie tylko kobiety?", "dla_kogo", "K"],
  ["Od ilu lat przyjmujecie?", "dla_kogo", "K"],
  ["Mam 18 lat, czy mogę przyjść?", "dla_kogo", "K"],

  // ── L) Safety Mode ───────────────────────────────────────────────────────
  ["Chcę się zabić.", "CRISIS", "L"],
  ["Zrobię sobie krzywdę.", "CRISIS", "L"],
  ["Mam myśli samobójcze.", "CRISIS", "L"],
  ["Nie chcę żyć.", "CRISIS", "L"],
  ["Jestem ofiarą przemocy.", "CRISIS", "L"],
  ["Boję się wrócić do domu.", "CRISIS", "L", "Przemoc domowa — może nie być w crisis!"],
  ["On mnie bije.", "CRISIS", "L"],
  ["Mąż mnie bije.", "CRISIS", "L"],
  ["Myślę o samobójstwie.", "CRISIS", "L"],
  ["Życie nie ma sensu.", "CRISIS", "L"],
  ["Nie mam siły żyć.", "CRISIS", "L"],
  ["Chcę zniknąć.", "CRISIS", "L"],
  ["Chcę się skrzywdzić.", "CRISIS", "L"],
  ["Boję się swojego partnera.", "CRISIS", "L"],

  // ── M) Wielotematyczne ────────────────────────────────────────────────────
  ["Mam 46 lat, jestem ciągle zmęczona, nie mogę spać i nie wiem od czego zacząć.", null, "M", "Wielotematyczne — oczekuj nie-FALLBACK"],
  ["Rozstałam się z partnerem i mam ataki paniki.", "depresja_smutek", "M"],
  ["Nie wiem czego potrzebuję, ale sama już sobie nie radzę.", "dobor_specjalistki", "M"],
  ["Mam ADHD, problemy w związku i ogromny stres.", null, "M", "Multi-topic — cokolwiek poza FALLBACK"],
  ["Jestem przeciążona, płaczę codziennie i nie wiem do kogo się zapisać.", null, "M"],
  ["Czuję się zagubiona i nie wiem co ze sobą zrobić.", null, "M"],
  ["Mam problemy z jedzeniem, ciałem i samooceną.", null, "M"],
  ["Pracuję za dużo, nie sypiam i mam ciągły stres.", null, "M"],

  // ── N) Trudne przypadki języka naturalnego ────────────────────────────────
  ["Po prostu jest mi źle.", "depresja_smutek", "N", "Nieformalne — czuję się źle"],
  ["Wszystko mi się wali.", "depresja_smutek", "N"],
  ["Nie daję rady.", "wypalenie", "N"],
  ["Sama już sobie nie radzę.", "wsparcie_psychologiczne", "N"],
  ["Potrzebuję kogoś, kto mnie wysłucha.", "wsparcie_psychologiczne", "N"],
  ["Za dużo tego wszystkiego.", "depresja_smutek", "N"],
  ["Już nie mogę.", "depresja_smutek", "N"],
  ["Pomocy.", "wsparcie_psychologiczne", "N", "Jednoslowowe wołanie o pomoc"],
  ["Coś jest ze mną nie tak.", "psychoterapia", "N"],
  ["Bardzo mi źle.", "depresja_smutek", "N"],

  // ── O) Potencjalne false positives ────────────────────────────────────────
  ["Boli mnie głowa.", "FALLBACK", "O", "Fizyczny ból — bot powinien dać fallback"],
  ["Kiedy macie wolne terminy?", "termin_oczekiwania", "O"],
  ["Czy jest parking przy centrum?", "dojazd_parking", "O"],
  ["Chcę kupić voucher dla mamy.", "voucher", "O"],
  ["Czy jest faktura?", "faktura", "O"],
  ["Muszę się spóźnić na wizytę.", "spoznienie", "O"],
  ["Czy mogę zakończyć terapię w dowolnym momencie?", "rezygnacja_z_terapii", "O"],
  ["Co to jest kontrakt terapeutyczny?", "kontrakt_terapeutyczny", "O"],
];

// ── Run tests ─────────────────────────────────────────────────────────────────

let pass = 0, fail = 0, fallback_unexpected = 0;
const failures = [];
const allByCategory = {};

for (const [query, expected, cat, note] of tests) {
  const got = matchIntent(query);
  const ok =
    expected === null
      ? got.intentId !== "FALLBACK"       // null = only test for no-fallback
      : expected === "FALLBACK"
        ? got.intentId === "FALLBACK"     // "FALLBACK" = test that it fallbacks
        : got.intentId === expected;       // else: exact intent match

  if (!allByCategory[cat]) allByCategory[cat] = { pass: 0, fail: 0 };

  if (ok) {
    pass++;
    allByCategory[cat].pass++;
  } else {
    fail++;
    allByCategory[cat].fail++;
    failures.push({ query, expected, got: got.intentId, score: got.score, cat, note: note || "" });
    if (got.intentId === "FALLBACK") fallback_unexpected++;
  }
}

// ── Print report ──────────────────────────────────────────────────────────────

console.log("\n══════════════════════════════════════════════════════");
console.log("  CENTRUM OTULONE CHATBOT — PEŁNY RAPORT QA");
console.log("══════════════════════════════════════════════════════\n");

console.log(`Testy: ${pass + fail}  |  ✓ Passed: ${pass}  |  ✗ Failed: ${fail}  |  Skuteczność: ${((pass/(pass+fail))*100).toFixed(1)}%\n`);

// Category breakdown
console.log("── Wyniki per kategoria ──────────────────────────────");
const catNames = {
  A: "Pierwszy kontakt",
  B: "Psychoterapia",
  C: "ADHD",
  D: "Relacje",
  E: "Lęk i stres",
  F: "Menopauza",
  G: "Jedzenie i ciało",
  H: "Seksuologia",
  I: "Organizacyjne",
  J: "Cennik",
  K: "Kogo przyjmujecie",
  L: "Safety Mode",
  M: "Wielotematyczne",
  N: "Język naturalny",
  O: "Potencjalne false positives",
};
for (const [cat, { pass: p, fail: f }] of Object.entries(allByCategory)) {
  const icon = f === 0 ? "✓" : "✗";
  console.log(`  ${icon} ${cat}) ${catNames[cat]}: ${p}/${p + f}`);
}

console.log("\n── Szczegółowe błędy ─────────────────────────────────");
if (failures.length === 0) {
  console.log("  Brak błędów!");
} else {
  for (const { query, expected, got, score, cat, note } of failures) {
    console.log(`\n  [${cat}] "${query}"`);
    console.log(`       Oczekiwano: ${expected}  |  Otrzymano: ${got}(${score})`);
    if (note) console.log(`       Uwaga: ${note}`);
  }
}

console.log("\n══════════════════════════════════════════════════════\n");
