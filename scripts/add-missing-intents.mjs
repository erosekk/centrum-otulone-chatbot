/**
 * Dodaje 2 brakujące tematy FAQ wykryte w teście:
 *  - zniżki / pakiety / ceny indywidualne
 *  - terapia w języku obcym (angielski itp.)
 *
 * Odpowiedzi NIE wymyślają polityki gabinetu (której nie znam) — kierują po
 * konkretną informację do recepcji. Mama może je później uzupełnić o realne dane.
 */
import { readFileSync, writeFileSync } from "fs";
const k = JSON.parse(readFileSync("./data/knowledge.json", "utf8"));

if (!k.intents.find(i => i.id === "znizki_pakiety")) {
  k.intents.push({
    id: "znizki_pakiety",
    keywords: [
      "zniżka", "znizka", "zniżki", "znizki",
      "rabat", "rabaty", "rabacik",
      "zniżka dla studentek", "znizka dla studentek",
      "zniżki dla studentek", "znizki dla studentek",
      "zniżka studencka", "znizka studencka",
      "czy są zniżki", "czy sa znizki",
      "czy jest zniżka", "czy jest znizka",
      "czy są rabaty", "czy sa rabaty",
      "tańsza terapia", "tansza terapia",
      "taniej", "czy można taniej", "czy mozna taniej",
      "promocja", "promocje", "promocyjna cena",
      "pakiet", "pakiety", "pakiet sesji", "pakiet spotkań", "pakiet spotkan",
      "zniżka dla seniora", "znizka dla seniora",
      "ceny indywidualne", "cena indywidualna",
      "czy da się taniej", "czy da sie taniej",
    ],
    response:
      "Ceny sesji w Centrum Otulone są stałe i zgodne z cennikiem (np. konsultacja lub psychoterapia — 250 zł / 50 min).\n\nW sprawie ewentualnych zniżek, pakietów lub indywidualnych ustaleń najlepiej zapytać bezpośrednio recepcję — podpowiedzą aktualne możliwości.\n\n📞 573 909 822\n📧 recepcja@centrumotulone.pl",
  });
}

if (!k.intents.find(i => i.id === "jezyk_obcy")) {
  k.intents.push({
    id: "jezyk_obcy",
    keywords: [
      "po angielsku", "terapia po angielsku", "sesja po angielsku",
      "konsultacja po angielsku", "terapia w języku angielskim",
      "terapia w jezyku angielskim", "sesja w języku angielskim",
      "sesja w jezyku angielskim",
      "english", "in english", "therapy in english",
      "do you speak english", "czy mówicie po angielsku",
      "czy mowicie po angielsku",
      "po niemiecku", "terapia po niemiecku",
      "po ukraińsku", "po ukrainsku", "terapia po ukraińsku",
      "terapia po ukrainsku",
      "w obcym języku", "w obcym jezyku",
      "język obcy", "jezyk obcy", "obcy język", "obcy jezyk",
      "inny język", "inny jezyk", "w innym języku", "w innym jezyku",
      "terapia obcojęzyczna", "terapia obcojezyczna",
      "sesje po angielsku", "terapia angielski",
    ],
    response:
      "Aby sprawdzić możliwość sesji w języku angielskim (lub innym), skontaktuj się z recepcją — podpowie, która specjalistka prowadzi sesje w danym języku i z jaką dostępnością.\n\n📞 573 909 822\n📧 recepcja@centrumotulone.pl",
  });
}

writeFileSync("./data/knowledge.json", JSON.stringify(k, null, 2), "utf8");
console.log("Intents now:", k.intents.length);
