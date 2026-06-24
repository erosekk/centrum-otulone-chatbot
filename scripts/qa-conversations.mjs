/**
 * Symulacja realnych rozmów potencjalnych klientek — pełne transkrypcje.
 * Pokazuje pytanie -> intent -> faktyczną odpowiedź bota (jak prawdziwy czat).
 *
 * Uruchom: node scripts/qa-conversations.mjs
 * Skrócony (tylko intencje, bez treści): node scripts/qa-conversations.mjs --short
 */
import { readFileSync } from "fs";

const k = JSON.parse(readFileSync("./data/knowledge.json", "utf8"));
const SHORT = process.argv.includes("--short");

// ── Matcher (mirror lib/matcher.ts) ────────────────────────────────────────
function normalize(text) {
  return text.toLowerCase()
    .replace(/[.,!?;:'"„"…—–\-]/g, " ")
    .replace(/ą/g,"a").replace(/ć/g,"c").replace(/ę/g,"e").replace(/ł/g,"l")
    .replace(/ń/g,"n").replace(/ó/g,"o").replace(/ś/g,"s").replace(/ź/g,"z").replace(/ż/g,"z")
    .replace(/\s+/g," ").trim();
}
function phraseScore(kw){const n=kw.split(" ").length;return (n*(n+1))/2;}
function levenshtein(a,b){if(Math.abs(a.length-b.length)>2)return 99;const m=a.length,n=b.length;const d=Array.from({length:m+1},()=>new Array(n+1).fill(0));for(let i=0;i<=m;i++)d[i][0]=i;for(let j=0;j<=n;j++)d[0][j]=j;for(let i=1;i<=m;i++){for(let j=1;j<=n;j++){const c=a[i-1]===b[j-1]?0:1;d[i][j]=Math.min(d[i-1][j]+1,d[i][j-1]+1,d[i-1][j-1]+c);if(i>1&&j>1&&a[i-1]===b[j-2]&&a[i-2]===b[j-1])d[i][j]=Math.min(d[i][j],d[i-2][j-2]+1);}}return d[m][n];}
function maxEditDist(w,lenient){if(lenient){if(w.length<=3)return 0;if(w.length<=6)return 1;return 2;}if(w.length<=5)return 0;if(w.length<=7)return 1;return 2;}
function wordFuzzy(kw,words,lenient){const l=maxEditDist(kw,lenient);return words.some(w=>levenshtein(w,kw)<=l);}
function kwMatch(input,kw,words,lenient){if(input.includes(kw))return true;return kw.split(" ").every(w=>wordFuzzy(w,words,lenient));}
function scoreIntent(input,keywords,lenient){
  const words=input.split(/\s+/);const seen=new Set();let s=0;
  for(const raw of keywords){const kw=normalize(raw);if(seen.has(kw))continue;seen.add(kw);if(kwMatch(input,kw,words,lenient))s+=phraseScore(kw);}
  return s;
}
function matchIntent(userInput){
  const n=normalize(userInput);
  const cs=scoreIntent(n,k.crisis.keywords,true);
  if(cs>0)return {intentId:"CRISIS",score:cs,response:k.crisis.response};
  const scored=k.intents.map(i=>({id:i.id,score:scoreIntent(n,i.keywords),resp:i.response}));
  scored.sort((a,b)=>b.score-a.score);
  const best=scored[0];
  if(!best||best.score===0)return {intentId:"FALLBACK",score:0,response:k.fallback};
  return {intentId:best.id,score:best.score,response:best.resp};
}

// ── Konwersacje: tak jak pisze PRAWDZIWA osoba (małe litery, literówki, skróty) ──
const conversations = [
  {
    persona: "👩 Anna, 34 — wahająca się, pierwszy raz szuka pomocy",
    turns: [
      "dzien dobry",
      "nigdy nie bylam u psychologa i nie wiem czy to dla mnie",
      "boje sie ze bede oceniana",
      "ile to kosztuje",
      "a da sie online?",
      "dobra to jak sie umowic",
      "dziekuje bardzo",
    ],
  },
  {
    persona: "👩 Kasia, 29 — w kryzysie emocjonalnym po rozstaniu",
    turns: [
      "hej",
      "rozstalam sie z chlopakiem i nie daje rady",
      "place caly czas i nie wiem co ze soba zrobic",
      "chyba potrzebuje pomocy ale nie wiem do kogo",
      "lek i stres",   // odpowiedź na quiz
    ],
  },
  {
    persona: "👩 Magda, 47 — objawy menopauzy, nie nazywa ich wprost",
    turns: [
      "mam 47 lat i nie poznaje siebie",
      "ciagle jestem rozdrazniona i mam wahania nastroju",
      "do tego nie moge spac",
      "czy to normalne w moim wieku",
    ],
  },
  {
    persona: "🆘 Ewa — sygnały kryzysowe (TEST BEZPIECZEŃSTWA)",
    turns: [
      "juz nie daje rady",
      "czasem mysle ze wszystkim byloby lepiej beze mnie",
      "nie chce mi sie zyc",
    ],
  },
  {
    persona: "🆘 Joanna — przemoc domowa (TEST BEZPIECZEŃSTWA)",
    turns: [
      "potrzebuje pomocy",
      "boje sie wrocic do domu",
      "maz mnie bije a ja nie mam dokad pojsc",
    ],
  },
  {
    persona: "👩 Patrycja, 31 — konkretne pytania organizacyjne, w biegu",
    turns: [
      "gdzie jestescie",
      "jest parking?",
      "do ktorej w piatek",
      "ile czeka sie na termin",
      "moge przelozyc wizyte jak cos wypadnie?",
    ],
  },
  {
    persona: "👩 Ola, 26 — podejrzewa ADHD, pisze chaotycznie",
    turns: [
      "wszystko zaczynam i nic nie koncze",
      "mam totalny chaos w glowie",
      "ciagle cos gubie i zapominam",
      "czy to moze byc adhd?",
      "co to jest diva5",
      "ile kosztuje taka diagnoza",
    ],
  },
  {
    persona: "👩 Sylwia, 38 — trudna relacja z jedzeniem (delikatny temat)",
    turns: [
      "mam problem z jedzeniem",
      "objadam sie wieczorami a potem czuje wine",
      "nienawidze swojego ciala",
      "czy mozecie w tym pomoc",
    ],
  },
  {
    persona: "👨 Marek — mężczyzna pyta o siebie (poza ofertą)",
    turns: [
      "czy przyjmujecie mezczyzn",
      "a moja zona moze przyjsc?",
    ],
  },
  {
    persona: "👩 Nieprecyzyjna — bardzo ogólne / trudne wejścia",
    turns: [
      "pomocy",
      "cos jest ze mna nie tak",
      "po prostu jest mi zle",
      "potrzebuje kogos kto mnie wyslucha",
    ],
  },
];

// ── Render ──────────────────────────────────────────────────────────────────
let fallbacks = 0, crisisHits = 0, total = 0;
const fallbackList = [];

for (const conv of conversations) {
  console.log("\n" + "═".repeat(70));
  console.log(conv.persona);
  console.log("═".repeat(70));
  for (const turn of conv.turns) {
    total++;
    const r = matchIntent(turn);
    if (r.intentId === "FALLBACK") { fallbacks++; fallbackList.push(turn); }
    if (r.intentId === "CRISIS") crisisHits++;

    const tag = r.intentId === "CRISIS" ? "🆘 CRISIS"
              : r.intentId === "FALLBACK" ? "⚠️  FALLBACK"
              : `✓ ${r.intentId}`;

    console.log(`\n  👤 "${turn}"`);
    if (SHORT) {
      console.log(`  🤖 [${tag}] (score ${r.score})`);
    } else {
      console.log(`  🤖 [${tag}]`);
      const lines = r.response.split("\n");
      for (const ln of lines) console.log(`     ${ln}`);
    }
  }
}

console.log("\n" + "═".repeat(70));
console.log("  PODSUMOWANIE SYMULACJI");
console.log("═".repeat(70));
console.log(`  Wiadomości łącznie:     ${total}`);
console.log(`  Trafione w CRISIS:      ${crisisHits}`);
console.log(`  FALLBACK (bez odpowiedzi): ${fallbacks}`);
if (fallbackList.length) {
  console.log("\n  ⚠️  Wiadomości bez dopasowania:");
  fallbackList.forEach(q => console.log(`     - "${q}"`));
}
console.log("═".repeat(70) + "\n");
