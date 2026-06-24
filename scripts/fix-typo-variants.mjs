/**
 * Dodaje realistyczne warianty fonetyczne/literówkowe (głównie kryzys + drobne).
 */
import { readFileSync, writeFileSync } from "fs";
const k = JSON.parse(readFileSync("./data/knowledge.json", "utf8"));
function addKw(id, kws) {
  const i = k.intents.find(x => x.id === id);
  if (!i) { console.error("NOT FOUND:", id); process.exit(1); }
  const ex = new Set(i.keywords);
  i.keywords.push(...kws.filter(kw => !ex.has(kw)));
}

// ── CRISIS: fonetyczne warianty krótkich słów krytycznych (ż→rz, ó→u) ──
const cEx = new Set(k.crisis.keywords);
[
  // "żyć" → fonetycznie "rzyc" (realistyczny błąd ortograficzny)
  "nie chce rzyc",
  "nie chce mi sie rzyc",
  "nie chce juz rzyc",
  "nie chec zyc",        // chce→chec (transpozycja sąsiednia, łapana przez Damerau na 4-zn.)
  // "zabić" warianty fonetyczne
  "chce sie zabicz",
  // "samobójstwo/samobójcze" przez u
  "samobujstwo",
  "samobujcze",
  "mysli samobujcze",
  // "śmierć"
  "mysle o smerci",      // śmierci→smerci
].forEach(kw => { if (!cEx.has(kw)) { k.crisis.keywords.push(kw); cEx.add(kw); } });

// ── odwolanie: podbij, by "chce odwolac wizyt" wygrało z zapisy ──
addKw("odwolanie", [
  "chce odwolac",
  "chce odwolac wizyt",
  "odwolac wizyt",
  "odwolanie wizyty",
]);

// ── stres: realistyczna pisownia "stress" (z ang.) ──
addKw("stres_praca", [
  "stress",
  "stres w pracy i w domu",
]);

writeFileSync("./data/knowledge.json", JSON.stringify(k, null, 2), "utf8");
console.log("Crisis keywords:", k.crisis.keywords.length);
