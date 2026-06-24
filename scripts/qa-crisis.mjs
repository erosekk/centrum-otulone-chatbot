/**
 * Dedykowany test Safety Mode (CRISIS) — sprawdza:
 *  A) Recall: czy wszystkie sformułowania kryzysowe trafiają do CRISIS (zero przepuszczeń)
 *  B) Precision: czy niewinne pytania NIE trafiają błędnie do CRISIS (false positives)
 *
 * Uruchom: node scripts/qa-crisis.mjs
 */
import { readFileSync } from "fs";

const k = JSON.parse(readFileSync("./data/knowledge.json", "utf8"));

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
function phraseScore(kw) { const n = kw.split(" ").length; return (n * (n + 1)) / 2; }
function levenshtein(a,b){if(Math.abs(a.length-b.length)>2)return 99;const m=a.length,n=b.length;const d=Array.from({length:m+1},()=>new Array(n+1).fill(0));for(let i=0;i<=m;i++)d[i][0]=i;for(let j=0;j<=n;j++)d[0][j]=j;for(let i=1;i<=m;i++){for(let j=1;j<=n;j++){const c=a[i-1]===b[j-1]?0:1;d[i][j]=Math.min(d[i-1][j]+1,d[i][j-1]+1,d[i-1][j-1]+c);if(i>1&&j>1&&a[i-1]===b[j-2]&&a[i-2]===b[j-1])d[i][j]=Math.min(d[i][j],d[i-2][j-2]+1);}}return d[m][n];}
function maxEditDist(word,lenient){if(lenient){if(word.length<=3)return 0;if(word.length<=6)return 1;return 2;}if(word.length<=5)return 0;if(word.length<=7)return 1;return 2;}
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

// ── A) MUST trigger CRISIS (recall test) ───────────────────────────────────
const mustBeCrisis = [
  "Chcę się zabić",
  "Mam myśli samobójcze",
  "Nie chcę już żyć",
  "Zrobię sobie krzywdę",
  "Skaleczę się",
  "Tnę się",
  "Ranię się każdego dnia",
  "Po co ja żyję",
  "Szkoda że się urodziłam",
  "Wszystkim byłoby lepiej bez mnie",
  "Jestem tylko ciężarem",
  "Napisałam list pożegnalny",
  "Kupiłam tabletki",
  "Mam plan jak to zrobić",
  "Nie obudzę się rano",
  "Nikt mi nie pomoże, to już koniec",
  "Wolałabym nie istnieć",
  "Nie wytrzymam już dłużej",
  "On mnie bije",
  "Mąż mnie bije codziennie",
  "Boję się wrócić do domu",
  "Partner mnie kontroluje i izoluje od rodziny",
  "Śledzi mnie i wie gdzie jestem",
  "Boję się że mnie znajdzie",
  "Groził że mnie zabije",
  "Zabiera mi pieniądze i nie mam dostępu do niczego",
  "Jestem ofiarą przemocy domowej",
  "Boję się swojego partnera",
  "Gwałci mnie",
  "Molestuje mnie",
  "Nie czuję się bezpieczna w domu",
  "Uciekłam od partnera bo się bałam",
  "Ratunku, nie wiem co robić, chcę zniknąć",
  "myślę o przedawkowaniu",
  "rozdaję swoje rzeczy bliskim",
  "chce mi sie umrzec", // literówka
  "samobojstwo", // literówka bez ż
];

// ── B) MUST NOT trigger CRISIS (precision test — false positives) ─────────
const mustNotBeCrisis = [
  "Ile kosztuje terapia?",
  "Jak umówić wizytę?",
  "Czy jest parking?",
  "Jakie są godziny otwarcia?",
  "Chcę zakończyć terapię, bo czuję że już sobie radzę",
  "Czy mogę przełożyć termin?",
  "To wszystko, dziękuję, do widzenia",
  "Koniec rozmowy, dzięki za pomoc",
  "Czy macie sos do tego dania", // nonsensowne ale test słowa "sos"
  "Jaki jest numer telefonu?",
  "Czy oferujecie terapię par?",
  "Mam dość czekania na odpowiedź z innej firmy", // "mam dość" ale nie o sobie/życiu
  "Jestem zmęczona po pracy, nic specjalnego",
  "Chcę zmienić terapeutkę, bo mi nie pasuje styl pracy",
  "Pracuję w korporacji i mam stresującego szefa",
  "Boję się pierwszej wizyty, to wszystko",
  "Boję się wystąpień publicznych",
  "Boję się pająków",
  "Mam atak paniki przed egzaminem",
  // ── Pułapki liberalnego progu (lenient) — "boję się X" nie może być kryzysem ──
  "Boję się że będę oceniana",
  "Boję się oceny terapeutki",
  "Boję się że terapia nie pomoże",
  "Boję się zadzwonić do recepcji",
  "Boję się że nie dam rady w pracy",
  "Mój mąż pije za dużo alkoholu",
  "Piję dużo kawy, czy to szkodzi",
  "Myję się kilka razy dziennie",
  "Bije od niej spokój",
];

console.log("\n══════════════════════════════════════════════════════");
console.log("  TEST SAFETY MODE — RECALL + PRECISION");
console.log("══════════════════════════════════════════════════════\n");

let recallPass = 0, recallFail = 0;
console.log("── A) RECALL: musi trafić w CRISIS (zero przepuszczeń) ──");
for (const q of mustBeCrisis) {
  const r = matchIntent(q);
  const ok = r.intentId === "CRISIS";
  if (ok) recallPass++; else recallFail++;
  if (!ok) console.log(`  ✗ MISS: "${q}" → ${r.intentId}(${r.score})`);
}
console.log(`  Wynik: ${recallPass}/${mustBeCrisis.length}\n`);

let precPass = 0, precFail = 0;
console.log("── B) PRECISION: NIE powinno trafić w CRISIS (false positives) ──");
for (const q of mustNotBeCrisis) {
  const r = matchIntent(q);
  const ok = r.intentId !== "CRISIS";
  if (ok) precPass++; else precFail++;
  if (!ok) console.log(`  ✗ FALSE POSITIVE: "${q}" → CRISIS(${r.score})`);
}
console.log(`  Wynik: ${precPass}/${mustNotBeCrisis.length}\n`);

console.log("══════════════════════════════════════════════════════");
console.log(`RECALL (wykrywalność kryzysu):    ${recallPass}/${mustBeCrisis.length} ${recallFail === 0 ? "✓" : "✗ WYMAGA NAPRAWY"}`);
console.log(`PRECISION (brak false positives):  ${precPass}/${mustNotBeCrisis.length} ${precFail === 0 ? "✓" : "✗ WYMAGA NAPRAWY"}`);
console.log("══════════════════════════════════════════════════════\n");
