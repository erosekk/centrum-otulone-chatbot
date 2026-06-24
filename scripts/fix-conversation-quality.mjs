/**
 * Naprawa 3 jakościowo słabych dopasowań wykrytych w symulacji rozmów.
 */
import { readFileSync, writeFileSync } from "fs";
const k = JSON.parse(readFileSync("./data/knowledge.json", "utf8"));
function addKw(id, kws) {
  const i = k.intents.find(x => x.id === id);
  if (!i) { console.error("NOT FOUND:", id); process.exit(1); }
  const ex = new Set(i.keywords);
  i.keywords.push(...kws.filter(kw => !ex.has(kw)));
}

// 1. "rozstałam się z chłopakiem i nie daję rady" → depresja_smutek (nie wypalenie)
//    Dodajemy konkretne wielowyrazowe frazy o rozstaniu, by przebiły "nie daje rady" (6 pkt)
addKw("depresja_smutek", [
  "rozstałam się z chłopakiem",
  "rozstalam sie z chlopakiem",
  "rozstanie z chłopakiem",
  "rozstanie z chlopakiem",
  "rozstałam się z dziewczyną",
  "rozstalam sie z dziewczyna",
  "po rozstaniu nie daję rady",
  "po rozstaniu nie daje rady",
  "rozstałam się i nie daję rady",
  "rozstalam sie i nie daje rady",
]);

// 2. "ile czeka się na termin" → termin_oczekiwania (nie zapisy)
addKw("termin_oczekiwania", [
  "ile czeka się na termin",
  "ile czeka sie na termin",
  "ile się czeka na termin",
  "ile sie czeka na termin",
  "jak długo na termin",
  "jak dlugo na termin",
  "czekanie na termin",
  "ile trzeba czekać na termin",
  "ile trzeba czekac na termin",
]);

// 3. "a moja żona może przyjść?" → dla_kogo (potwierdzenie: przyjmują kobiety)
addKw("dla_kogo", [
  "żona może przyjść",
  "zona moze przyjsc",
  "czy żona może przyjść",
  "czy zona moze przyjsc",
  "moja żona może przyjść",
  "moja zona moze przyjsc",
  "czy moja żona może",
  "czy moja zona moze",
  "partnerka może przyjść",
  "partnerka moze przyjsc",
  "dziewczyna może przyjść",
  "dziewczyna moze przyjsc",
  "siostra może przyjść",
  "siostra moze przyjsc",
  "mama może przyjść",
  "mama moze przyjsc",
]);

writeFileSync("./data/knowledge.json", JSON.stringify(k, null, 2), "utf8");
console.log("Done.");
