import { readFileSync, writeFileSync } from "fs";

const k = JSON.parse(readFileSync("./data/knowledge.json", "utf8"));

// ── 1. Update fallback ──────────────────────────────────────────────────────
k.fallback =
  "Nie mam pewnej odpowiedzi na to pytanie, ale recepcja Centrum Otulone chętnie pomoże Ci dobrać odpowiednią formę wsparcia lub wyjaśni szczegóły wizyty.\n\n📞 573 909 822\n📧 recepcja@centrumotulone.pl";

// ── 2. Add dobor_specjalistki (quiz trigger) ────────────────────────────────
if (!k.intents.find((i) => i.id === "dobor_specjalistki")) {
  k.intents.push({
    id: "dobor_specjalistki",
    keywords: [
      "nie wiem do której specjalistki się umówić",
      "nie wiem do ktorej specjalistki sie umowic",
      "nie wiem do której specjalistki",
      "nie wiem do ktorej specjalistki",
      "nie wiem do kogo się zapisać",
      "nie wiem do kogo sie zapisac",
      "nie wiem jakiej pomocy potrzebuję",
      "nie wiem jakiej pomocy potrzebuje",
      "nie wiem jaką formę wsparcia wybrać",
      "nie wiem jaka forme wsparcia wybrac",
      "nie wiem czego potrzebuję",
      "nie wiem czego potrzebuje",
      "nie wiem co wybrać",
      "nie wiem co wybrac",
      "do której specjalistki się zapisać",
      "do ktorej specjalistki sie zapisac",
      "która specjalistka jest dla mnie",
      "ktora specjalistka jest dla mnie",
      "pomóż mi wybrać specjalistkę",
      "pomoz mi wybrac specjalistke",
      "pomoc w wyborze specjalistki",
      "do kogo się umówić",
      "do kogo sie umowic",
      "nie wiem do kogo iść",
      "nie wiem do kogo isc",
      "jak wybrać właściwą formę wsparcia",
      "jak wybrac wlasciwa forme wsparcia",
    ],
    response:
      "Znalezienie odpowiedniej formy wsparcia zajmie około 1 minutę.\n\nZ czym najbardziej się zmagasz?",
  });
}

// ── 3. Add menopauza intent ─────────────────────────────────────────────────
if (!k.intents.find((i) => i.id === "menopauza")) {
  k.intents.push({
    id: "menopauza",
    keywords: [
      "menopauza",
      "menopauzą",
      "perimenopauza",
      "perimenopauzą",
      "klimakterium",
      "uderzenia gorąca",
      "uderzenia goraca",
      "zmiany hormonalne",
      "wahania nastroju",
      "drażliwość przy menopauzie",
      "drazliwosc przy menopauzie",
      "mam menopauzę",
      "mam menopauzje",
      "trudności związane z menopauzą",
      "trudnosci zwiazane z menopauza",
      "jestem w menopauzie",
      "wsparcie przy menopauzie",
      "objawy menopauzy",
      "przez menopauzę",
      "przez menopauze",
      "hormony menopauza",
      "psycholog menopauza",
      "terapia menopauza",
      "pomoc przy menopauzie",
    ],
    response:
      "Centrum Otulone oferuje wsparcie psychologiczne i psychoterapeutyczne dla kobiet w okresie menopauzy i perimenopauzy.\n\nPodczas sesji możesz porozmawiać o:\n• Wahaniach nastroju, drażliwości i napięciu\n• Zmianach w ciele i samopostrzeganiu\n• Poczuciu przeciążenia i wyczerpania\n• Trudnościach w relacjach i seksualności\n\nKoszt konsultacji: 250 zł / 50 min\n\nUmów się lub zapytaj o dostępność:\n📞 573 909 822\n📧 recepcja@centrumotulone.pl",
  });
}

// helper
function addKw(id, kws) {
  const intent = k.intents.find((x) => x.id === id);
  if (!intent) { console.error("NOT FOUND:", id); return; }
  intent.keywords.push(...kws);
}

// ── 4. wypalenie — fatigue / overwhelm ────────────────────────────────────
addKw("wypalenie", [
  "ciągłe zmęczenie", "ciagle zmeczenie",
  "przeciążenie", "przeciazone",
  "przeciążona", "jestem przeciążona",
  "czuję ciągłe zmęczenie", "czuje ciagle zmeczenie",
  "ciągłe zmęczenie i przeciążenie",
  "czuję się przeciążona", "czuje sie przeciazona",
  "wszystko mnie przytłacza",
  "ciągle zmęczona", "ciagle zmeczona",
  "jestem ciągle zmęczona", "jestem ciagle zmeczona",
  "kto może mi pomóc z wyczerpaniem", "kto moze mi pomoc z wyczerpaniem",
  "czuję się wyczerpana", "czuje sie wyczerpana",
]);

// ── 5. relacje — relationship difficulties ────────────────────────────────
addKw("relacje", [
  "mam trudności w relacjach", "mam trudnosci w relacjach",
  "trudności w relacjach", "trudnosci w relacjach",
  "trudności w związku", "trudnosci w zwiazku",
  "mam trudności w związku", "mam trudnosci w zwiazku",
  "kryzys po rozstaniu",
  "jestem w kryzysie po rozstaniu",
  "kryzys emocjonalny po rozstaniu",
  "nie umiem się dogadać", "nie umiem sie dogadac",
  "kłócimy się", "klocimy sie",
  "ciągle się kłócimy", "ciagle sie klocimy",
  "zdrada", "po zdradzie",
  "kryzys w związku",
  "problemy komunikacyjne w związku",
]);

// ── 6. lek_napady_paniki — anxiety/tension ────────────────────────────────
addKw("lek_napady_paniki", [
  "lęk i napięcie", "lek i napiecie",
  "czuję lęk i napięcie", "czuje lek i napiecie",
  "czuję lęk", "czuje lek",
  "jestem spięta", "jestem spieta",
  "napięcie nerwowe", "napiecie nerwowe",
  "mam natłok myśli", "mam natlok mysli",
  "nie mogę się uspokoić", "nie moge sie uspokoic",
  "ciągły niepokój", "ciagle niepokoj",
  "czuję się niespokojna", "czuje sie niespokojona",
  "nerwy", "zdenerwowanie",
  "boję się wszystkiego", "boje sie wszystkiego",
  "czuję lęk bez powodu", "czuje lek bez powodu",
  "ciągły lęk", "ciagle lek",
  "zaburzenia lękowe",
]);

// ── 7. stres_praca — stress synonyms ─────────────────────────────────────
addKw("stres_praca", [
  "nie radzę sobie ze stresem", "nie radze sobie ze stresem",
  "ciągły stres", "ciagle stres",
  "za dużo stresu", "za duzo stresu",
  "zbyt dużo stresu", "zbyt duzo stresu",
  "stres mnie przytłacza",
  "mam za dużo na głowie", "mam za duzo na glowie",
  "stresująca sytuacja", "stresujaca sytuacja",
  "nie radzę sobie z sytuacją", "nie radze sobie z sytuacja",
  "trudno mi sobie poradzić", "trudno mi sobie poradzic",
]);

// ── 8. praca_z_cialem — body relationship ────────────────────────────────
addKw("praca_z_cialem", [
  "relacja z własnym ciałem", "relacja z wlasnym cialem",
  "pracować nad relacją z własnym ciałem", "pracowac nad relacja z wlasnym cialem",
  "chcę pracować nad relacją z ciałem", "chce pracowac nad relacja z cialem",
  "relacja z ciałem", "relacja z cialem",
  "wsparcie w relacji z ciałem",
  "nienawidzę swojego ciała", "nienawidze swojego ciala",
  "wstydzę się ciała", "wstydze sie ciala",
  "wstydzę się swojego ciała", "wstydze sie swojego ciala",
  "nie lubię swojego ciała", "nie lubie swojego ciala",
  "nie akceptuję ciała", "nie akceptuje ciala",
]);

// ── 9. seksuologia — sexology support ────────────────────────────────────
addKw("seksuologia", [
  "wsparcie seksuologiczne",
  "potrzebuję wsparcia seksuologicznego", "potrzebuje wsparcia seksuologicznego",
  "problemy seksualne",
  "bolesny seks", "ból podczas seksu", "bol podczas seksu",
  "brak libido", "spadek libido",
  "libido",
  "intymność", "intymnosc",
  "wstyd w seksualności",
  "trudności seksualne", "trudnosci seksualne",
  "pytania o seksualność", "pytania o seksualnosc",
  "moja seksualność", "moja seksualnosc",
  "seks sprawia ból", "seks sprawia bol",
  "nie chcę seksu", "nie chce seksu",
]);

// ── 10. zaburzenia_odzywiania — food & emotions ───────────────────────────
addKw("zaburzenia_odzywiania", [
  "mam problem z jedzeniem i emocjami",
  "jedzenie i emocje",
  "emocjonalne jedzenie",
  "jem z emocji", "jem ze stresu",
  "nie radzę sobie z jedzeniem", "nie radze sobie z jedzeniem",
  "objadanie się z emocji", "objadanie sie z emocji",
  "relacja z jedzeniem",
  "kontrola jedzenia",
  "problem z jedzeniem", "problemy z jedzeniem",
  "kompulsywne jedzenie",
  "nie lubię swojego wyglądu", "nie lubie swojego wygladu",
]);

// ── 11. adhd — synonyms ───────────────────────────────────────────────────
addKw("adhd", [
  "podejrzewam u siebie adhd", "podejrzewam adhd",
  "mam adhd", "chyba mam adhd",
  "diagnoza adhd kobiety",
  "prokrastynacja", "odkładanie na później", "odkladanie na pozniej",
  "bałagan w głowie", "balagan w glowie",
  "mam bałagan w głowie", "mam balagan w glowie",
  "nie mogę się skupić", "nie moge sie skupic",
  "chaos w głowie", "chaos w glowie",
  "zapominam wszystkiego", "ciągle zapominam", "ciagle zapominam",
  "trudności z organizacją", "trudnosci z organizacja",
  "problemy z koncentracją", "problemy z koncentracja",
  "impulsywność", "impulsywnosc",
  "czuję chaos", "czuje chaos",
  "nadmiar myśli", "nadmiar mysli",
]);

// ── 12. termin_oczekiwania — quick appointment ────────────────────────────
addKw("termin_oczekiwania", [
  "jak szybko mogę dostać termin", "jak szybko moge dostac termin",
  "jak szybko mogę się umówić", "jak szybko moge sie umowic",
  "jak szybko mogę przyjść", "jak szybko moge przyjsc",
  "szybki termin", "pilny termin",
  "kiedy mogę przyjść", "kiedy moge przyjsc",
  "najbliższy wolny termin", "najblizszy wolny termin",
  "jak długo się czeka", "jak dlugo sie czeka",
  "kiedy macie wolne terminy",
]);

// ── 13. pierwsza_wizyta — first appointment ───────────────────────────────
addKw("pierwsza_wizyta", [
  "jak wygląda pierwsze spotkanie", "jak wyglada pierwsze spotkanie",
  "jak wygląda pierwsza wizyta", "jak wyglada pierwsza wizyta",
  "co się dzieje na pierwszej wizycie", "co sie dzieje na pierwszej wizycie",
  "czego się spodziewać", "czego sie spodziewac",
  "jak wygląda pierwsza sesja", "jak wyglada pierwsza sesja",
  "pierwsze spotkanie z psychologiem",
  "pierwsze spotkanie z terapeutą",
  "jak to wygląda na pierwszej wizycie",
]);

writeFileSync("./data/knowledge.json", JSON.stringify(k, null, 2), "utf8");
console.log("Done. Total intents:", k.intents.length);
