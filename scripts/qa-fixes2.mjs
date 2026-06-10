/**
 * QA Fixes — runda 2 (4 pozostałe błędy)
 */
import { readFileSync, writeFileSync } from "fs";

const k = JSON.parse(readFileSync("./data/knowledge.json", "utf8"));

function getIntent(id) {
  const i = k.intents.find(x => x.id === id);
  if (!i) { console.error("NOT FOUND:", id); process.exit(1); }
  return i;
}

// 1. "Nie wiem od czego zacząć" trafia do pierwsza_wizyta (15 pkt) zamiast jak_zaczac
//    — przenosimy te słowa kluczowe z firstazyta do jak_zaczac
const firstazyta = getIntent("pierwsza_wizyta");
const jakzaczac  = getIntent("jak_zaczac");

const toMove = [
  "nie wiem od czego zacząć",
  "nie wiem od czego zaczac",
];
firstazyta.keywords = firstazyta.keywords.filter(kw => !toMove.includes(kw));
jakzaczac.keywords.push(...toMove);

// 2. "Pomocy." → podziekowanie (tie na 1 pkt) zamiast wsparcie_psychologiczne
//    — "pomocne" w podziekowaniu fuzzy-matcha "pomocy"; zamieniamy je na frazy wielowyrazowe
const podzieko = getIntent("podziekowanie");
podzieko.keywords = podzieko.keywords.filter(kw => kw !== "pomocne");
podzieko.keywords.push(
  "to jest pomocne",
  "to bylo pomocne",
  "to było pomocne",
  "to mi pomogło",
  "to mi pomoglo",
  "bardzo pomocne",
);

// 3. "Nie wiem czego potrzebuję, ale sama już sobie nie radzę." → wsparcie zamiast dobor_specjalistki
//    — akceptowalny wynik, ale warto podbić dobor_specjalistki dla "sama sobie nie radzę"
//    Usuwamy za-szeroką 5-wyrazową frazę z wsparcie i dodajemy krótsze wersje
const wsparcie = getIntent("wsparcie_psychologiczne");
wsparcie.keywords = wsparcie.keywords.filter(kw =>
  kw !== "sama już sobie nie radzę" && kw !== "sama juz sobie nie radze"
);
wsparcie.keywords.push(
  "sama sobie nie radzę",
  "sama sobie nie radze",
);

// Podbijamy dobor_specjalistki o zdanie "nie wiem czego potrzebuję ale nie radzę sobie"
const dobor = getIntent("dobor_specjalistki");
dobor.keywords.push(
  "sama sobie już nie radzę i nie wiem do kogo",
  "nie wiem czego potrzebuję ani do kogo się zwrócić",
  "nie wiem czego potrzebuje ani do kogo sie zwrocic",
  "sama nie wiem czego potrzebuję",
  "sama nie wiem czego potrzebuje",
);

writeFileSync("./data/knowledge.json", JSON.stringify(k, null, 2), "utf8");
console.log("Done.");
