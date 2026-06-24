/**
 * Test odporności na literówki — realne błędy jakie popełniają ludzie:
 * - zamiana liter (terpaia), brakująca litera (terapa), podwojona (terappia)
 * - fonetyczne (psycholog->psyholog, rz/ż, ó/u, ch/h)
 * - brak spacji / sklejenia, szybkie pisanie
 *
 * Uruchom: node scripts/qa-typos.mjs
 */
import { readFileSync } from "fs";
const k = JSON.parse(readFileSync("./data/knowledge.json", "utf8"));

function normalize(text){return text.toLowerCase().replace(/[.,!?;:'"„"…—–\-]/g," ").replace(/ą/g,"a").replace(/ć/g,"c").replace(/ę/g,"e").replace(/ł/g,"l").replace(/ń/g,"n").replace(/ó/g,"o").replace(/ś/g,"s").replace(/ź/g,"z").replace(/ż/g,"z").replace(/\s+/g," ").trim();}
function phraseScore(kw){const n=kw.split(" ").length;return (n*(n+1))/2;}
function levenshtein(a,b){if(Math.abs(a.length-b.length)>2)return 99;const m=a.length,n=b.length;const d=Array.from({length:m+1},()=>new Array(n+1).fill(0));for(let i=0;i<=m;i++)d[i][0]=i;for(let j=0;j<=n;j++)d[0][j]=j;for(let i=1;i<=m;i++){for(let j=1;j<=n;j++){const c=a[i-1]===b[j-1]?0:1;d[i][j]=Math.min(d[i-1][j]+1,d[i][j-1]+1,d[i-1][j-1]+c);if(i>1&&j>1&&a[i-1]===b[j-2]&&a[i-2]===b[j-1])d[i][j]=Math.min(d[i][j],d[i-2][j-2]+1);}}return d[m][n];}
function maxEditDist(w,lenient){if(lenient){if(w.length<=3)return 0;if(w.length<=6)return 1;return 2;}if(w.length<=5)return 0;if(w.length<=6)return 1;return 2;}
function wordFuzzy(kw,words,lenient){const l=maxEditDist(kw,lenient);return words.some(w=>levenshtein(w,kw)<=l);}
function kwMatch(input,kw,words,lenient){if(input.includes(kw))return true;return kw.split(" ").every(w=>wordFuzzy(w,words,lenient));}
function scoreIntent(input,keywords,lenient){const words=input.split(/\s+/);const seen=new Set();let s=0;for(const raw of keywords){const kw=normalize(raw);if(seen.has(kw))continue;seen.add(kw);if(kwMatch(input,kw,words,lenient))s+=phraseScore(kw);}return s;}
function matchIntent(userInput){const n=normalize(userInput);const cs=scoreIntent(n,k.crisis.keywords,true);if(cs>0)return {intentId:"CRISIS",score:cs};const scored=k.intents.map(i=>({id:i.id,score:scoreIntent(n,i.keywords)}));scored.sort((a,b)=>b.score-a.score);const best=scored[0];if(!best||best.score===0)return {intentId:"FALLBACK",score:0};return {intentId:best.id,score:best.score};}

// [tekst z literówką, oczekiwany intent, opis błędu]
const tests = [
  // ── Literówki w kluczowych krótkich słowach (≤5 znaków — obecnie wymagają exact) ──
  ["mam lekk", "lek_napady_paniki", "podwojona litera w 'lęk'"],
  ["mam ciagly stress", "stres_praca", "ang. pisownia 'stress'"],
  ["nie moge zasnac", "zaburzenia_snu", "kontrola — poprawne 'zasnąć'"],
  ["place caly czas", "depresja_smutek", "'płaczę' bez diakrytyki (ok) — kontrola"],
  ["mam adhdd", "adhd", "podwojona w 'adhd'"],

  // ── Literówki w średnich/długich słowach ──
  ["chce zaczac terpaie", "jak_zaczac", "przestawione litery w 'terapię'"],
  ["szukam psychologaa", "wsparcie_psychologiczne", "podwojona w 'psychologa'"],
  ["potrzebuje psycholog", "wsparcie_psychologiczne", "brak końcówki"],
  ["ile kosztuje terpia", "cennik", "brak litery w 'terapia'"],
  ["jak sie umowic na wizyte", "zapisy", "kontrola — poprawne"],
  ["chce sie umowoc", "zapisy", "literówka w 'umówić'"],
  ["gdzie jestescie zlokalizowani", "adres", "długie zdanie"],
  ["jakie macje godziny otwarcia", "godziny", "literówka 'macje'"],
  ["czy przyjmujede mezczyzn", "dla_kogo", "literówka 'przyjmujede'"],
  ["depresjaa", "depresja_smutek", "podwojona"],
  ["mam ataki panikii", "lek_napady_paniki", "podwojona w 'paniki'"],
  ["wypalenie zawodwe", "wypalenie", "brak litery w 'zawodowe'"],
  ["menopuaza", "menopauza", "przestawione w 'menopauza'"],
  ["seksuolog potrzebny", "seksuologia", "kontrola"],
  ["problemy w zwiazkku", "terapia_par", "podwojona w 'związku'"],
  ["chce odwolac wizyt", "odwolanie", "brak końcówki 'wizytę'"],
  ["ile to kosztuie", "cennik", "literówka w 'kosztuje'"],
  ["czy jest parkign", "dojazd_parking", "przestawione w 'parking'"],
  ["pierwsza wiztya", "pierwsza_wizyta", "przestawione w 'wizyta'"],
  ["nienawidze siebei", "niska_samoocena", "przestawione w 'siebie'"],

  // ── Kryzysowe z literówkami (KRYTYCZNE — muszą złapać) ──
  ["chce sie zabicc", "CRISIS", "podwojona w 'zabić'"],
  ["mysli samobujcze", "CRISIS", "ó->u w 'samobójcze'"],
  ["nie chce rzyc", "CRISIS", "fonetyczne ż->rz w 'żyć'"],
  ["boje sie wrocic do domyu", "CRISIS", "literówka w 'domu'"],
  ["maz mnie bjie", "CRISIS", "przestawione w 'bije'"],
];

let pass=0, fail=0; const fails=[];
for (const [q, exp, desc] of tests) {
  const r = matchIntent(q);
  const ok = r.intentId === exp;
  if (ok) pass++; else { fail++; fails.push({q, exp, got:r.intentId, score:r.score, desc}); }
}

console.log("\n══════════════════════════════════════════════════════");
console.log("  TEST ODPORNOŚCI NA LITERÓWKI");
console.log("══════════════════════════════════════════════════════\n");
console.log(`Wynik: ${pass}/${pass+fail} (${((pass/(pass+fail))*100).toFixed(0)}%)\n`);
if (fails.length) {
  console.log("── Nie złapane ──");
  for (const f of fails) {
    const crit = f.exp === "CRISIS" ? "  🆘 KRYTYCZNE!" : "";
    console.log(`  ✗ "${f.q}"${crit}`);
    console.log(`     oczek: ${f.exp} | dostał: ${f.got}(${f.score}) | ${f.desc}`);
  }
} else {
  console.log("Wszystkie literówki obsłużone ✓");
}
console.log("\n══════════════════════════════════════════════════════\n");
