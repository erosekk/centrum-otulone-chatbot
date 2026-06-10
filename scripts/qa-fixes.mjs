/**
 * QA Fixes — naprawia 28 błędów wykrytych podczas pełnego audytu jakości.
 * Uruchom: node scripts/qa-fixes.mjs
 */
import { readFileSync, writeFileSync } from "fs";

const k = JSON.parse(readFileSync("./data/knowledge.json", "utf8"));

function addKw(id, kws) {
  const intent = k.intents.find((x) => x.id === id);
  if (!intent) { console.error("NOT FOUND:", id); return; }
  intent.keywords.push(...kws);
}

function removeKw(id, kwToRemove) {
  const intent = k.intents.find((x) => x.id === id);
  if (!intent) { console.error("NOT FOUND:", id); return; }
  intent.keywords = intent.keywords.filter(kw => kw !== kwToRemove);
}

// ═══════════════════════════════════════════════════════════════
// 1. SAFETY MODE — krytyczne: "Boję się wrócić do domu"
// ═══════════════════════════════════════════════════════════════
k.crisis.keywords.push(
  "boję się wrócić do domu",
  "boje sie wrocic do domu",
  "boję się iść do domu",
  "boje sie isc do domu",
  "nie mogę wrócić do domu",
  "nie moge wrocic do domu",
  "niebezpiecznie w domu",
  "nie jest bezpiecznie w domu",
  "muszę uciekać z domu",
  "uciekam z domu",
  "boję się go",
  "boje sie go",
  "on mi grozi",
  "grozi mi"
);

// ═══════════════════════════════════════════════════════════════
// 2. online — usunięcie "z domu" (zbyt ogólny, powoduje false positives)
//    "boję się wychodzić z domu" → online zamiast lek_napady_paniki
// ═══════════════════════════════════════════════════════════════
removeKw("online", "z domu");
// Zastępujemy konkretniejszymi frazami
addKw("online", [
  "sesja z domu",
  "terapia z domu",
  "konsultacja z domu",
]);

// ═══════════════════════════════════════════════════════════════
// 3. psychoterapia — "Czy będę oceniana?", "Coś jest ze mną nie tak"
// ═══════════════════════════════════════════════════════════════
addKw("psychoterapia", [
  "czy będę oceniana",
  "czy bede oceniana",
  "oceniana",
  "nie chcę być oceniana",
  "nie chce byc oceniana",
  "boje sie oceny",
  "boję się oceny",
  "czy terapeutka mnie oceni",
  "czy jest bezpieczna przestrzeń",
  "coś jest ze mną nie tak",
  "cos jest ze mna nie tak",
  "coś nie tak ze mną",
  "nie wiem co mi jest",
  "nie rozumiem siebie",
  "jestem zagubiona",
  "zagubiłam się",
  "czuję się zagubiona",
]);

// ═══════════════════════════════════════════════════════════════
// 4. wsparcie_psychologiczne — "Pomocy", "Szukam pomocy", etc.
// ═══════════════════════════════════════════════════════════════
addKw("wsparcie_psychologiczne", [
  "pomocy",
  "szukam pomocy",
  "potrzebuję pomocy",
  "potrzebuje pomocy",
  "sama sobie nie radzę",
  "sama sobie nie radze",
  "sama już sobie nie radzę",
  "sama juz sobie nie radze",
  "nie radzę sobie z tym",
  "nie radze sobie z tym",
  "nie mogę sobie poradzić",
  "nie moge sobie poradzic",
  "potrzebuję kogoś kto mnie wysłucha",
  "potrzebuje kogos kto mnie wyslucha",
  "potrzebuję kogoś do rozmowy",
  "potrzebuje kogos do rozmowy",
  "kogoś do wysłuchania",
  "kogos do wysluchania",
  "chcę porozmawiać",
  "chce porozmawiac",
  "potrzebuję wsparcia emocjonalnego",
  "potrzebuje wsparcia emocjonalnego",
]);

// ═══════════════════════════════════════════════════════════════
// 5. adhd — "Odkładam na później", "Zapominam o wszystkim",
//            "Co to jest DIVA5", "Jak wygląda diagnoza ADHD"
// ═══════════════════════════════════════════════════════════════
addKw("adhd", [
  "odkładam na później",
  "odkladam na pozniej",
  "odkładam wszystko na później",
  "odkladam wszystko na pozniej",
  "ciągle odkładam",
  "ciagle odkladam",
  "zapominam o wszystkim",
  "zapominam o wszystko",
  "ciągle zapominam",
  "ciagle zapominam",
  "nie pamiętam",
  "nie pamietam",
  "co to jest diva5",
  "co to jest diva",
  "czym jest diva5",
  "jak działa diva5",
  "jak dziala diva5",
  "jak wygląda diagnoza adhd",
  "jak wyglada diagnoza adhd",
  "jak wygląda diagnoza",
  "jak wyglada diagnoza",
]);

// ═══════════════════════════════════════════════════════════════
// 6. relacje — "Nie potrafię postawić granic"
// ═══════════════════════════════════════════════════════════════
addKw("relacje", [
  "nie potrafię postawić granic",
  "nie potrafia postawic granic",
  "nie umiem postawić granic",
  "nie umiem postawic granic",
  "nie umiem stawiać granic",
  "nie umiem stawiac granic",
  "trudno mi stawiać granice",
  "trudno mi stawiac granice",
  "brak granic",
  "mam problem z granicami",
  "nie potrafię odmówić",
  "nie potrafia odmowic",
  "trudno mi odmawiać",
  "trudno mi odmawiac",
]);

// ═══════════════════════════════════════════════════════════════
// 7. lek_napady_paniki — "Boję się o przyszłość",
//    "Boję się wychodzić z domu", "Serce mi kołata"
// ═══════════════════════════════════════════════════════════════
addKw("lek_napady_paniki", [
  "boję się o przyszłość",
  "boje sie o przyszlosc",
  "lęk o przyszłość",
  "lek o przyszlosc",
  "boję się o jutro",
  "boje sie o jutro",
  "strach przed przyszłością",
  "strach przed przyszloscia",
  "boję się wychodzić z domu",
  "boje sie wychodzic z domu",
  "boję się wychodzić",
  "boje sie wychodzic",
  "nie wychodzę z domu",
  "nie wychodze z domu",
  "nie mogę wyjść z domu",
  "nie moge wyjsc z domu",
  "strach przed wyjściem",
  "strach przed wyjsciem",
  "serce mi kołata",
  "serce mi kolata",
  "kołata mi serce",
  "kolata mi serce",
  "serce kołata",
  "serce kolata",
  "serce bije za szybko",
  "trzęsą mi się ręce",
  "trzesa mi sie rece",
  "drżę ze strachu",
  "drze ze strachu",
  "jestem przestraszona",
  "czuję się przestraszona",
  "czuje sie przestraszona",
  "boję się",
  "boje sie",
]);

// ═══════════════════════════════════════════════════════════════
// 8. menopauza — "Hormony mnie wykańczają", "Rozdrażniona",
//    "Nie poznaję siebie", "50 lat"
// ═══════════════════════════════════════════════════════════════
addKw("menopauza", [
  "hormony mnie wykańczają",
  "hormony mnie wykancaja",
  "hormony mnie niszczą",
  "hormony mnie niszcza",
  "hormony",
  "moje hormony",
  "gospodarka hormonalna",
  "rozdrażniona",
  "jestem rozdrażniona",
  "jestem bardzo rozdrażniona",
  "jestem rozdrazniona",
  "jestem bardzo rozdrazniona",
  "stałam się rozdrażniona",
  "stalam sie rozdrazniona",
  "drażliwość",
  "drazliwosc",
  "jestem drażliwa",
  "jestem drazliwa",
  "bardzo drażliwa",
  "bardzo drazliwa",
  "nie poznaję siebie",
  "nie poznaje siebie",
  "nie rozpoznaję siebie",
  "nie rozpoznaje siebie",
  "zmieniłam się",
  "zmienilam sie",
  "zmieniłam się nie do poznania",
  "zmienilam sie nie do poznania",
  "50 lat i",
  "50 lat",
  "po 45 roku",
  "ok 50",
  "mam 50",
  "mam 48",
  "mam 52",
  "ciągle się pocę",
  "ciagle sie poce",
  "nocne poty",
  "nocne pocenie",
  "mam skoki nastrojów",
  "skoki nastroju",
  "huśtawka nastroju",
  "hustawka nastroju",
]);

// ═══════════════════════════════════════════════════════════════
// 9. seksuologia — "Seks mnie stresuje", "Wstydzę się seksualności"
// ═══════════════════════════════════════════════════════════════
addKw("seksuologia", [
  "seks mnie stresuje",
  "seks stresuje",
  "boję się seksu",
  "boje sie seksu",
  "strach przed seksem",
  "lęk przed seksem",
  "lek przed seksem",
  "wstydzę się swojej seksualności",
  "wstydze sie swojej seksualnosci",
  "wstydzę się seksualności",
  "wstydze sie seksualnosci",
  "nie wiem co z seksualnością",
  "mam problem z seksualnością",
  "mam problem z seksualnoscia",
  "przeżycia seksualne",
  "przezycia seksualne",
  "seksualność mnie stresuje",
  "mam pytania o seksualność",
]);

// ═══════════════════════════════════════════════════════════════
// 10. zaburzenia_odzywiania — "Objadam się wieczorami",
//     "Nie mogę przestać myśleć o jedzeniu", "Wstydzę się wyglądu"
// ═══════════════════════════════════════════════════════════════
addKw("zaburzenia_odzywiania", [
  "objadam się wieczorami",
  "objadam sie wieczorami",
  "objadam się",
  "objadam sie",
  "nie mogę przestać myśleć o jedzeniu",
  "nie moge przestac myslec o jedzeniu",
  "myślę cały czas o jedzeniu",
  "mysle caly czas o jedzeniu",
  "obsesja na punkcie jedzenia",
  "obsesja jedzenia",
  "nie mogę przestać jeść",
  "nie moge przestac jesc",
  "wstydzę się swojego wyglądu",
  "wstydze sie swojego wygladu",
  "wstydzę się wyglądu",
  "wstydze sie wygladu",
  "wstyd z powodu ciała",
  "wstydzę się ciała",
  "wstydze sie ciala",
  "nienawidzę swojego wyglądu",
  "nienawidze swojego wygladu",
  "brzydkota",
  "czuję się gruba",
  "czuje sie gruba",
]);

// ═══════════════════════════════════════════════════════════════
// 11. depresja_smutek — "Jest mi źle", "Wszystko mi się wali",
//     "Za dużo tego wszystkiego", "Nie wiem co ze sobą zrobić"
// ═══════════════════════════════════════════════════════════════
addKw("depresja_smutek", [
  "jest mi źle",
  "jest mi zle",
  "po prostu jest mi źle",
  "po prostu jest mi zle",
  "jest mi bardzo źle",
  "jest mi bardzo zle",
  "wszystko mi się wali",
  "wszystko mi sie wali",
  "wszystko się wali",
  "wszystko sie wali",
  "wszystko się sypie",
  "wszystko sie sypie",
  "za dużo tego wszystkiego",
  "za duzo tego wszystkiego",
  "za dużo wszystkiego",
  "za duzo wszystkiego",
  "nie wiem co ze sobą zrobić",
  "nie wiem co ze soba zrobic",
  "nie wiem co z sobą zrobić",
  "nie wiem co z soba zrobic",
  "nie wiem co robić",
  "nie wiem co robic",
  "wszystko mnie przytłacza",
  "wszystko mnie przytiaza",
  "mam dość życia",
  "mam dosc zycia",
  "nie mam siły na nic",
  "nie mam sily na nic",
  "brakuje mi siły",
  "brakuje mi sily",
  "jestem zmęczona życiem",
  "jestem zmeczona zyciem",
  "nie chce mi się żyć",
  "nie chce mi sie zyc",
  "płaczę bez powodu",
  "placze bez powodu",
  "cały czas płaczę",
  "caly czas placze",
  "ciągle płaczę",
  "ciagle placze",
]);

// ═══════════════════════════════════════════════════════════════
// 12. odwolanie — "Czy mogę przełożyć termin?"
// ═══════════════════════════════════════════════════════════════
addKw("odwolanie", [
  "przełożyć termin",
  "przelozyc termin",
  "zmienić termin wizyty",
  "zmienic termin wizyty",
  "czy mogę przełożyć",
  "czy moge przelozyc",
  "mogę przełożyć",
  "moge przelozyc",
]);

// ═══════════════════════════════════════════════════════════════
// 13. roznice_specjalistow — "nie wiem czy potrzebuję psychologa czy terapii"
// ═══════════════════════════════════════════════════════════════
addKw("roznice_specjalistow", [
  "nie wiem czy potrzebuję psychologa czy terapii",
  "nie wiem czy potrzebuje psychologa czy terapii",
  "nie wiem czy potrzebuję psychologa",
  "nie wiem czy potrzebuje psychologa",
  "psycholog czy terapia",
  "terapia czy psycholog",
  "do kogo iść po pomoc",
  "do kogo isc po pomoc",
  "psycholog a terapeuta",
  "różnica psycholog terapeuta",
  "roznica psycholog terapeuta",
]);

// ═══════════════════════════════════════════════════════════════
// 14. centrum_info — usuwamy "co to jest" (zbyt ogólne, powoduje
//     że "co to jest diva5" trafia do centrum zamiast adhd)
// ═══════════════════════════════════════════════════════════════
removeKw("centrum_info", "co to jest");
addKw("centrum_info", [
  "co to jest centrum otulone",
  "co to jest centrum",
  "czym jest centrum otulone",
]);

// ═══════════════════════════════════════════════════════════════
// 15. jak_zaczac — upewniamy się, że "nigdy nie byłam"
//     + "dopiero zaczynam" trafia tutaj
// ═══════════════════════════════════════════════════════════════
addKw("jak_zaczac", [
  "nigdy nie byłam u psychologa",
  "nigdy nie bylam u psychologa",
  "nigdy nie chodziłam na terapię",
  "nigdy nie chodzilam na terapie",
  "pierwszy raz szukam pomocy",
  "nie wiem jak zacząć szukać pomocy",
  "nie wiem jak zaczac szukac pomocy",
  "dopiero zaczynam",
  "jestem nowa",
  "pierwszy kontakt",
]);

// ═══════════════════════════════════════════════════════════════
// 16. pierwsza_wizyta — upewniamy się, że "boję się pierwszej wizyty"
// ═══════════════════════════════════════════════════════════════
addKw("pierwsza_wizyta", [
  "boję się pierwszej wizyty",
  "boje sie pierwszej wizyty",
  "strach przed pierwszą wizytą",
  "strach przed pierwsza wizyta",
  "jak się przygotować na pierwszą wizytę",
  "jak sie przygotowac na pierwsza wizyte",
  "stres przed pierwszą wizytą",
  "stres przed pierwsza wizyta",
]);

// ═══════════════════════════════════════════════════════════════
// Write result
// ═══════════════════════════════════════════════════════════════
writeFileSync("./data/knowledge.json", JSON.stringify(k, null, 2), "utf8");
console.log("Done. Total intents:", k.intents.length);
console.log("Crisis keywords:", k.crisis.keywords.length);
