/**
 * Dodaje linki do listy specjalistów (filtr po kategorii) + linki do zapisów
 * we WSZYSTKICH odpowiedziach typu "chcę zacząć X" (problemy/usługi),
 * zastępując blok telefon+email klikalnymi linkami.
 *
 * Czyste informacyjne intencje (cennik, godziny, adres, kontakt itd.)
 * NIE są tu zmieniane — tam telefon/email pozostaje właściwy.
 */
import { readFileSync, writeFileSync } from "fs";
const k = JSON.parse(readFileSync("./data/knowledge.json", "utf8"));

const ZESPOL = "https://centrumotulone.pl/o-nas/zespol/";
const ZAPISY = "https://centrumotulone.pl/zapisy/";

function footer(slug) {
  const list = slug ? `${ZESPOL}?e-filter-59db304-specjalizacja=${slug}` : ZESPOL;
  const listLabel = slug ? "Zobacz specjalistów →" : "Zobacz cały zespół →";
  return `\n\nOto specjaliści:\n[${listLabel}](${list})\n\nAby umówić wizytę:\n[Umów się online →](${ZAPISY})`;
}

function setResponse(id, newResponse) {
  const i = k.intents.find(x => x.id === id);
  if (!i) { console.error("NOT FOUND:", id); process.exit(1); }
  i.response = newResponse;
}

// Każdy wpis: [id, slug_lub_null, treść BEZ stopki kontaktowej (bez końcowego telefonu/emaila)]
const updates = [
  ["psychoterapia", "psychoterapeuta",
    "Psychoterapia indywidualna w Centrum Otulone to regularne spotkania (50 min) z psychoterapeutką.\n\nCzego możesz się spodziewać:\n• Bezpiecznej, nieoceniającej przestrzeni do rozmowy\n• Pracy nad emocjami, przekonaniami i wzorcami zachowań\n• Stopniowego zrozumienia przyczyn Twoich trudności\n• Rozwijania nowych sposobów radzenia sobie\n\nCentrum pracuje w nurtach: CBT, ericksonowskim, psychodynamicznym, systemowym i integracyjnym, a także w terapii traumy.\n\nNie musisz wiedzieć, jakiego nurtu potrzebujesz — specjalistka pomoże Ci to ustalić.\n\nTerapia jest dla każdej, kto chce lepiej rozumieć siebie — nie musisz być w kryzysie.\n\nKoszt: 250 zł / 50 min"],

  ["wsparcie_psychologiczne", "psycholog",
    "Dobrze, że szukasz wsparcia — to ważny pierwszy krok, nawet jeśli jeszcze nie wiesz dokładnie, czego potrzebujesz.\n\nCentrum Otulone oferuje konsultacje psychologiczne i psychoterapię indywidualną:\n\n• Konsultacja psychologiczna (50 min) — 250 zł\n  Diagnoza i ocena sytuacji — jednorazowa lub kilka spotkań\n\n• Psychoterapia indywidualna (50 min) — 250 zł\n  Regularne spotkania ukierunkowane na trwałą zmianę i rozwój\n\nNie musisz wiedzieć, czego dokładnie potrzebujesz — specjalistka podczas pierwszego spotkania pomoże Ci ustalić najlepszą formę wsparcia."],

  ["terapia_traumy", "psychotraumatolog",
    "Centrum Otulone oferuje specjalistyczną terapię traumy prowadzoną przez psychotraumatolożkę.\n\nTerapia traumy pomaga w przepracowaniu:\n• Trudnych doświadczeń z dzieciństwa\n• Przemocy fizycznej, emocjonalnej lub seksualnej\n• Strat i żałoby\n• Wypadków i nagłych zdarzeń\n• Traumy relacyjnej i z dorosłego życia\n\nKoszt sesji: 250 zł / 50 min\n\nPracujemy we własnym, bezpiecznym tempie."],

  ["praca_z_cialem", "psychoterapeuta",
    "Psychoterapia z pracą z ciałem łączy rozmowę terapeutyczną z technikami somatycznymi.\n\nSesje mogą obejmować:\n• Ćwiczenia oddechowe i pracę z głosem\n• Uważność na sygnały ciała\n• Ruch i rozluźnianie napięć\n• Pracę w pozycji stojącej lub na macie\n\nDotyk jest stosowany wyłącznie za wyraźną zgodą, w bezpiecznych granicach terapeutycznych. Podejście oparte na Core Energetics.\n\nKoszt: 250 zł / 50 min"],

  ["seksuologia", "seksuolog",
    "Centrum Otulone oferuje konsultacje seksuologiczne (50 min).\n\nKonsultacja seksuologiczna może dotyczyć:\n• Trudności i bólu podczas intymności\n• Niskiego libido lub jego braku\n• Pytań o orientację lub tożsamość seksualną\n• Relacji intymnych i bliskości\n• Innych kwestii związanych z seksualnością\n\nKoszt: 250 zł / 50 min\n\nSesje odbywają się w komfortowych, bezpiecznych warunkach."],

  ["terapia_par", "terapia-pary",
    "Centrum Otulone oferuje terapię par (60 min, 300 zł).\n\nTerapia par pomaga w:\n• Poprawie komunikacji i zrozumienia w związku\n• Przepracowaniu kryzysu, zdrady lub utraty zaufania\n• Radzeniu sobie z dystansem emocjonalnym\n• Świadomym zakończeniu relacji, jeśli to właściwa droga\n\nSesje odbywają się co dwa tygodnie, w spokojnej, bezpiecznej przestrzeni poza główną siedzibą centrum (szczegóły po umówieniu)."],

  ["matka_corka", null,
    "Centrum Otulone oferuje unikalną usługę: terapię matki i dorosłej córki (50 min, 350 zł).\n\nTo wspólne sesje przeznaczone dla matki i dorosłej córki, które chcą:\n• Przepracować trudne wzorce w relacji\n• Lepiej się zrozumieć i komunikować\n• Uzdrowić relację i budować nową jakość więzi"],

  ["adhd", "diagnoza-adhd-diva5",
    "Centrum Otulone oferuje diagnozę ADHD metodą DIVA5 — dedykowaną specjalnie kobietom.\n\nDiagnoza składa się z 3 sesji po 50 minut i obejmuje:\n1. Wywiad kliniczny (dzieciństwo, edukacja, relacje, praca)\n2. Testy psychologiczne (DIVA-5, ASRS dla dorosłych)\n3. Omówienie wyników i zaleceń\n\nCena pakietu: 960 zł\n\nUwaga: ADHD u kobiet często maskuje się perfekcjonizmem, nadodpowiedzialnością i zewnętrznym porządkiem."],

  ["depresja_smutek", "psycholog",
    "Rozumiem, że jest Ci teraz trudno.\n\nCentrum Otulone oferuje wsparcie psychologiczne i psychoterapię, które pomagają w stanach depresyjnych, przygnębieniu i braku energii.\n\nNajlepszym pierwszym krokiem jest:\n1. Bezpłatna konsultacja telefoniczna (15 min, 0 zł)\n2. Konsultacja psychologiczna (50 min, 250 zł)\n\nNie musisz radzić sobie z tym sama."],

  ["lek_napady_paniki", "psycholog",
    "Rozumiem, że lęk i napady paniki potrafią być przytłaczające — to, że szukasz wsparcia, jest ważnym krokiem.\n\nCentrum Otulone specjalizuje się w pracy z lękiem i atakami paniki. W ramach terapii indywidualnej lub psychoterapii z pracą z ciałem możesz pracować nad:\n• Rozumieniem mechanizmów lęku\n• Technikami oddechowymi i regulacją układu nerwowego\n• Stopniowym oswajaniem trudnych sytuacji\n• Przyczynami leżącymi u podłoża lęku\n\nKoszt sesji: 250 zł / 50 min\nBezpłatna konsultacja telefoniczna (0 zł): 15 min\n\nNie musisz mierzyć się z tym sama."],

  ["wypalenie", "psycholog",
    "Rozumiem, że ciągłe wyczerpanie potrafi odbierać siłę na co dzień — dobrze, że szukasz dla siebie wsparcia.\n\nCentrum Otulone pomaga kobietom w wypaleniu zawodowym i chronicznym wyczerpaniu. W terapii możesz pracować nad:\n• Rozpoznaniem przyczyn wypalenia\n• Odbudowaniem granic (zawodowych i osobistych)\n• Regeneracją i odzyskaniem energii\n• Zmianą wzorców myślowych (perfekcjonizm, nadodpowiedzialność)\n\nKoszt sesji: 250 zł / 50 min\n\nNie musisz radzić sobie z tym sama."],

  ["stres_praca", "psycholog",
    "Rozumiem, że przewlekły stres potrafi być naprawdę obciążający — warto w takim momencie zadbać o siebie.\n\nCentrum Otulone oferuje wsparcie w radzeniu sobie ze stresem i trudnymi sytuacjami zawodowymi. W ramach konsultacji psychologicznej lub psychoterapii możesz pracować nad:\n• Strategiami radzenia sobie ze stresem\n• Granicami i asertywnością w pracy\n• Równowagą między pracą a życiem prywatnym\n• Decyzjami zawodowymi i zmianą\n\nKoszt: 250 zł / 50 min\n\nNie musisz radzić sobie z tym sama."],

  ["niska_samoocena", "psycholog",
    "Rozumiem, że relacja ze sobą może być naprawdę trudna — te uczucia są ważnym sygnałem, że warto poszukać wsparcia.\n\nCentrum Otulone pomaga kobietom w pracy z niską samooceną, poczuciem winy i nadmierną samokrytyką.\n\nW terapii możesz stopniowo:\n• Odkrywać źródła trudnych przekonań o sobie\n• Budować zdrowy, współczujący kontakt ze sobą\n• Zmniejszać wpływ perfekcjonizmu i wewnętrznego krytyka\n\nKoszt sesji: 250 zł / 50 min\n\nZacznij od bezpłatnej konsultacji telefonicznej (0 zł)."],

  ["zaburzenia_odzywiania", "psychodietetyk",
    "Rozumiem, że trudna relacja z jedzeniem i ciałem bywa bardzo bolesna — to ważne, że szukasz wsparcia.\n\nCentrum Otulone oferuje wsparcie psychologiczne i terapeutyczne dla kobiet zmagających się z trudną relacją z jedzeniem i ciałem. W ramach terapii możliwa jest praca nad:\n• Emocjami leżącymi u podłoża zaburzeń odżywiania\n• Relacją z ciałem i jego obrazem\n• Mechanizmami kontroli i impulsywności\n\nNie jesteś z tym sama."],

  ["zaburzenia_snu", "psycholog",
    "Rozumiem, jak wyczerpujące potrafią być nieprzespane noce — i jak bardzo odbijają się na codziennym samopoczuciu.\n\nProblemy ze snem często mają podłoże emocjonalne i mogą być objawem stresu, lęku, depresji lub traumy. Centrum Otulone może pomóc poprzez:\n• Psychoterapię adresującą przyczyny bezsenności\n• Pracę z lękiem i napięciem\n• Techniki regulacji układu nerwowego\n\nKoszt sesji: 250 zł / 50 min\n\nZacznij od bezpłatnej konsultacji telefonicznej (0 zł)."],

  ["relacje", "psycholog",
    "Rozumiem, że trudności w relacjach potrafią mocno ważyć na codziennym samopoczuciu — dobrze, że chcesz o to zadbać.\n\nCentrum Otulone pomaga kobietom w pracy nad relacjami — rodzinnymi, partnerskimi, przyjaźniami. W terapii możesz:\n• Rozumieć wzorce relacyjne wyniesione z domu\n• Budować zdrowe granice\n• Pracować nad komunikacją i bliskością\n• Radzić sobie z samotnością i izolacją\n\nKoszt sesji: 250 zł / 50 min\n\nNie musisz mierzyć się z tym sama."],

  ["menopauza", "psycholog",
    "Rozumiem, że ten okres potrafi przynieść wiele zmian, które trudno udźwignąć w pojedynkę — masz prawo szukać wsparcia.\n\nCentrum Otulone oferuje wsparcie psychologiczne i psychoterapeutyczne dla kobiet w okresie menopauzy i perimenopauzy. Podczas sesji możesz porozmawiać o:\n• Wahaniach nastroju, drażliwości i napięciu\n• Zmianach w ciele i samopostrzeganiu\n• Poczuciu przeciążenia i wyczerpania\n• Trudnościach w relacjach i seksualności\n\nKoszt konsultacji: 250 zł / 50 min\n\nNie musisz przechodzić przez to sama."],
];

for (const [id, slug, body] of updates) {
  setResponse(id, body + footer(slug));
}

writeFileSync("./data/knowledge.json", JSON.stringify(k, null, 2), "utf8");
console.log(`Zaktualizowano ${updates.length} odpowiedzi z linkami do specjalistów + zapisów.`);
