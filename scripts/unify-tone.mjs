/**
 * Ujednolicenie tonu odpowiedzi emocjonalnych do stylu zatwierdzonego przez właścicielkę
 * (wzorzec: depresja_smutek, niska_samoocena — ciepły wstęp + zdanie otuchy).
 *
 * Zmieniamy WYŁĄCZNIE intencje emocjonalne (gdzie ktoś cierpi).
 * Intencje informacyjne/logistyczne (cennik, godziny, adres...) pozostają rzeczowe.
 *
 * Zachowane bez zmian: wszystkie ceny, punktory merytoryczne, dane kontaktowe.
 */
import { readFileSync, writeFileSync } from "fs";
const k = JSON.parse(readFileSync("./data/knowledge.json", "utf8"));
const set = (id, response) => {
  const i = k.intents.find(x => x.id === id);
  if (!i) { console.error("NOT FOUND:", id); process.exit(1); }
  i.response = response;
};

set("lek_napady_paniki",
`Rozumiem, że lęk i napady paniki potrafią być przytłaczające — to, że szukasz wsparcia, jest ważnym krokiem.

Centrum Otulone specjalizuje się w pracy z lękiem i atakami paniki. W ramach terapii indywidualnej lub psychoterapii z pracą z ciałem możesz pracować nad:
• Rozumieniem mechanizmów lęku
• Technikami oddechowymi i regulacją układu nerwowego
• Stopniowym oswajaniem trudnych sytuacji
• Przyczynami leżącymi u podłoża lęku

Koszt sesji: 250 zł / 50 min
Bezpłatna konsultacja telefoniczna (0 zł): 15 min

Nie musisz mierzyć się z tym sama.
📞 573 909 822
📧 recepcja@centrumotulone.pl`);

set("wypalenie",
`Rozumiem, że ciągłe wyczerpanie potrafi odbierać siłę na co dzień — dobrze, że szukasz dla siebie wsparcia.

Centrum Otulone pomaga kobietom w wypaleniu zawodowym i chronicznym wyczerpaniu. W terapii możesz pracować nad:
• Rozpoznaniem przyczyn wypalenia
• Odbudowaniem granic (zawodowych i osobistych)
• Regeneracją i odzyskaniem energii
• Zmianą wzorców myślowych (perfekcjonizm, nadodpowiedzialność)

Koszt sesji: 250 zł / 50 min

Nie musisz radzić sobie z tym sama.
📞 573 909 822
📧 recepcja@centrumotulone.pl`);

set("stres_praca",
`Rozumiem, że przewlekły stres potrafi być naprawdę obciążający — warto w takim momencie zadbać o siebie.

Centrum Otulone oferuje wsparcie w radzeniu sobie ze stresem i trudnymi sytuacjami zawodowymi. W ramach konsultacji psychologicznej lub psychoterapii możesz pracować nad:
• Strategiami radzenia sobie ze stresem
• Granicami i asertywnością w pracy
• Równowagą między pracą a życiem prywatnym
• Decyzjami zawodowymi i zmianą

Koszt: 250 zł / 50 min

Nie musisz radzić sobie z tym sama.
📞 573 909 822
📧 recepcja@centrumotulone.pl`);

set("zaburzenia_odzywiania",
`Rozumiem, że trudna relacja z jedzeniem i ciałem bywa bardzo bolesna — to ważne, że szukasz wsparcia.

Centrum Otulone oferuje wsparcie psychologiczne i terapeutyczne dla kobiet zmagających się z trudną relacją z jedzeniem i ciałem. W ramach terapii możliwa jest praca nad:
• Emocjami leżącymi u podłoża zaburzeń odżywiania
• Relacją z ciałem i jego obrazem
• Mechanizmami kontroli i impulsywności

Nie jesteś z tym sama. Aby dowiedzieć się, która forma wsparcia będzie najlepsza w Twojej sytuacji:
📞 573 909 822
📧 recepcja@centrumotulone.pl`);

set("zaburzenia_snu",
`Rozumiem, jak wyczerpujące potrafią być nieprzespane noce — i jak bardzo odbijają się na codziennym samopoczuciu.

Problemy ze snem często mają podłoże emocjonalne i mogą być objawem stresu, lęku, depresji lub traumy. Centrum Otulone może pomóc poprzez:
• Psychoterapię adresującą przyczyny bezsenności
• Pracę z lękiem i napięciem
• Techniki regulacji układu nerwowego

Koszt sesji: 250 zł / 50 min

Zacznij od bezpłatnej konsultacji telefonicznej (0 zł):
📞 573 909 822
📧 recepcja@centrumotulone.pl`);

set("relacje",
`Rozumiem, że trudności w relacjach potrafią mocno ważyć na codziennym samopoczuciu — dobrze, że chcesz o to zadbać.

Centrum Otulone pomaga kobietom w pracy nad relacjami — rodzinnymi, partnerskimi, przyjaźniami. W terapii możesz:
• Rozumieć wzorce relacyjne wyniesione z domu
• Budować zdrowe granice
• Pracować nad komunikacją i bliskością
• Radzić sobie z samotnością i izolacją

Koszt sesji: 250 zł / 50 min

Nie musisz mierzyć się z tym sama.
📞 573 909 822
📧 recepcja@centrumotulone.pl`);

set("menopauza",
`Rozumiem, że ten okres potrafi przynieść wiele zmian, które trudno udźwignąć w pojedynkę — masz prawo szukać wsparcia.

Centrum Otulone oferuje wsparcie psychologiczne i psychoterapeutyczne dla kobiet w okresie menopauzy i perimenopauzy. Podczas sesji możesz porozmawiać o:
• Wahaniach nastroju, drażliwości i napięciu
• Zmianach w ciele i samopostrzeganiu
• Poczuciu przeciążenia i wyczerpania
• Trudnościach w relacjach i seksualności

Koszt konsultacji: 250 zł / 50 min

Nie musisz przechodzić przez to sama.
📞 573 909 822
📧 recepcja@centrumotulone.pl`);

set("terapia_traumy",
`Rozumiem, że powrót do trudnych doświadczeń wymaga odwagi — w Centrum Otulone zadbamy o Twoje poczucie bezpieczeństwa na każdym etapie.

Terapię traumy prowadzi psychotraumatolożka. Pomaga ona w przepracowaniu:
• Trudnych doświadczeń z dzieciństwa
• Przemocy fizycznej, emocjonalnej lub seksualnej
• Strat i żałoby
• Wypadków i nagłych zdarzeń
• Traumy relacyjnej i z dorosłego życia

Koszt sesji: 250 zł / 50 min

Pracujemy we własnym, bezpiecznym tempie. Aby umówić konsultację:
📞 573 909 822
📧 recepcja@centrumotulone.pl`);

set("seksuologia",
`Rozumiem, że to bardzo osobisty temat — w Centrum Otulone możesz o nim porozmawiać bez wstydu i bez oceny.

Oferujemy konsultacje seksuologiczne (50 min). Konsultacja może dotyczyć:
• Trudności i bólu podczas intymności
• Niskiego libido lub jego braku
• Pytań o orientację lub tożsamość seksualną
• Relacji intymnych i bliskości
• Innych kwestii związanych z seksualnością

Koszt: 250 zł / 50 min

Aby umówić w komfortowych warunkach:
📞 573 909 822
📧 recepcja@centrumotulone.pl`);

set("praca_z_cialem",
`Rozumiem, że relacja z własnym ciałem bywa trudna — praca z ciałem może być łagodną drogą do tego, by poczuć się w nim bezpieczniej.

Psychoterapia z pracą z ciałem łączy rozmowę terapeutyczną z technikami somatycznymi. Sesje mogą obejmować:
• Ćwiczenia oddechowe i pracę z głosem
• Uważność na sygnały ciała
• Ruch i rozluźnianie napięć
• Pracę w pozycji stojącej lub na macie

Dotyk jest stosowany wyłącznie za wyraźną zgodą, w bezpiecznych granicach terapeutycznych. Podejście oparte na Core Energetics.

Koszt: 250 zł / 50 min
Aby umówić:
📞 573 909 822
📧 recepcja@centrumotulone.pl`);

set("wsparcie_psychologiczne",
`Dobrze, że szukasz wsparcia — to ważny pierwszy krok, nawet jeśli jeszcze nie wiesz dokładnie, czego potrzebujesz.

Centrum Otulone oferuje konsultacje psychologiczne i psychoterapię indywidualną:

• Konsultacja psychologiczna (50 min) — 250 zł
  Diagnoza i ocena sytuacji — jednorazowa lub kilka spotkań

• Psychoterapia indywidualna (50 min) — 250 zł
  Regularne spotkania ukierunkowane na trwałą zmianę i rozwój

Nie musisz wiedzieć, czego dokładnie potrzebujesz — specjalistka podczas pierwszego spotkania pomoże Ci ustalić najlepszą formę wsparcia.

📞 573 909 822
📧 recepcja@centrumotulone.pl`);

writeFileSync("./data/knowledge.json", JSON.stringify(k, null, 2), "utf8");
console.log("Ujednolicono ton 11 odpowiedzi emocjonalnych.");
