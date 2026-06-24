/**
 * Masowa rozbudowa pokrycia — priorytet: Safety Mode (CRISIS) + minimalizacja FALLBACK.
 * Uruchom: node scripts/expand-coverage.mjs
 */
import { readFileSync, writeFileSync } from "fs";

const k = JSON.parse(readFileSync("./data/knowledge.json", "utf8"));

function addKw(id, kws) {
  const intent = k.intents.find((x) => x.id === id);
  if (!intent) { console.error("NOT FOUND:", id); process.exit(1); }
  const existing = new Set(intent.keywords);
  const fresh = kws.filter(kw => !existing.has(kw));
  intent.keywords.push(...fresh);
  return fresh.length;
}

let totalAdded = 0;

// ═══════════════════════════════════════════════════════════════════════════
// CRISIS — rozbudowa (priorytet #1, zero przepuszczonych sygnałów)
// ═══════════════════════════════════════════════════════════════════════════

const crisisExisting = new Set(k.crisis.keywords);
const crisisNew = [
  // ── Myśli samobójcze — formy pośrednie / eufemizmy ──────────────────────
  "wolałabym nie istnieć",
  "wolalabym nie istniec",
  "szkoda że się urodziłam",
  "szkoda ze sie urodzilam",
  "po co ja żyję",
  "po co ja zyje",
  "po co żyć",
  "po co zyc",
  "nie ma dla mnie przyszłości",
  "nie ma dla mnie przyszlosci",
  "wszystkim byłoby lepiej bez mnie",
  "wszystkim byloby lepiej bez mnie",
  "byłoby lepiej gdybym nie istniała",
  "byloby lepiej gdybym nie istniala",
  "jestem ciężarem dla innych",
  "jestem ciezarem dla innych",
  "jestem tylko ciężarem",
  "jestem tylko ciezarem",
  "wszyscy beze mnie lepiej",
  "wszystkim beze mnie lepiej",
  "chcę odejść na zawsze",
  "chce odejsc na zawsze",
  "to już mój koniec",
  "to juz moj koniec",
  "nie wytrzymam już dłużej",
  "nie wytrzymam juz dluzej",
  "nie wytrzymam tego dłużej",
  "nie wytrzymam tego dluzej",
  "więcej już nie mogę",
  "wiecej juz nie moge",
  "nie ma już dla mnie ratunku",
  "nie ma juz dla mnie ratunku",
  "napisałam list pożegnalny",
  "napisalam list pozegnalny",
  "list pożegnalny",
  "list pozegnalny",
  "pożegnalny list",
  "pozegnalny list",
  "rozdaję swoje rzeczy",
  "rozdaje swoje rzeczy",
  "uporządkowałam swoje sprawy",
  "uporzadkowalam swoje sprawy",
  "kupiłam tabletki",
  "kupilam tabletki",
  "mam tabletki na koniec",
  "myślę o przedawkowaniu",
  "mysle o przedawkowaniu",
  "chcę przedawkować",
  "chce przedawkowac",
  "mam plan żeby się zabić",
  "mam plan zeby sie zabic",
  "mam plan jak to zrobić",
  "mam plan jak to zrobic",
  "jestem na skraju",
  "jestem na granicy wytrzymałości",
  "jestem na granicy wytrzymalosci",
  "nikt nie zauważy jak zniknę",
  "nikt nie zauwazy jak znikne",
  "nikomu nie będzie mnie żal",
  "nikomu nie bedzie mnie zal",
  "moja śmierć nikogo nie zaboli",
  "moja smierc nikogo nie zaboli",
  "chcę umrzeć we śnie",
  "chce umrzec we snie",
  "nie obudzę się rano",
  "nie obudze sie rano",
  "nie chcę się obudzić",
  "nie chce sie obudzic",
  "nikt mi nie pomoże",
  "nikt mi nie pomoze",
  "nie ma już sensu",
  "nie ma juz sensu",
  "wolałabym umrzeć",
  "wolalabym umrzec",
  "chciałabym zniknąć na zawsze",
  "chcialabym zniknac na zawsze",
  "myślę o końcu",
  "mysle o koncu",
  "myślę żeby to zakończyć na zawsze",
  "mysle zeby to zakonczyc na zawsze",
  "ratunku",
  "sos pomocy",
  "potrzebuję ratunku natychmiast",
  "potrzebuje ratunku natychmiast",

  // ── Samookaleczenie — dodatkowe metody/formy ────────────────────────────
  "ranię się",
  "ranie sie",
  "robię sobie krzywdę",
  "robie sobie krzywde",
  "palę się",
  "pale sie",
  "przypalam się",
  "przypalam sie",
  "uderzam się",
  "uderzam sie",
  "biję się",
  "bije sie",
  "głodzę się żeby ukarać siebie",
  "glodze sie zeby ukarac siebie",
  "karzę siebie fizycznie",
  "karze siebie fizycznie",
  "drę sobie skórę",
  "dre sobie skore",
  "tnę się",
  "tne sie",
  "samookaleczam się",
  "samookaleczam sie",

  // ── Przemoc domowa / kontrola / stalking ────────────────────────────────
  "jestem maltretowana",
  "partner mnie kontroluje",
  "kontroluje każdy mój ruch",
  "kontroluje kazdy moj ruch",
  "nie mogę wyjść bez pytania",
  "nie moge wyjsc bez pytania",
  "partner mi groził",
  "partner mi grozil",
  "partner grozi mi",
  "boję się zostać z nim sama",
  "boje sie zostac z nim sama",
  "izoluje mnie od rodziny",
  "zabiera mi pieniądze",
  "zabiera mi pieniadze",
  "nie mam dostępu do pieniędzy",
  "nie mam dostepu do pieniedzy",
  "zamyka mnie w domu",
  "śledzi mnie",
  "sledzi mnie",
  "kontroluje mój telefon",
  "kontroluje moj telefon",
  "czyta moje wiadomości",
  "czyta moje wiadomosci",
  "groził że mnie zabije",
  "grozil ze mnie zabije",
  "powiedział że mnie zabije",
  "powiedzial ze mnie zabije",
  "obawiam się o swoje bezpieczeństwo",
  "obawiam sie o swoje bezpieczenstwo",
  "nie czuję się bezpieczna w domu",
  "nie czuje sie bezpieczna w domu",
  "przemoc psychiczna",
  "przemoc fizyczna",
  "przemoc seksualna",
  "zmusza mnie do",
  "gwałci mnie",
  "gwalci mnie",
  "molestuje mnie",
  "wykorzystuje mnie seksualnie",
  "on mnie śledzi",
  "on mnie sledzi",
  "boję się że mnie znajdzie",
  "boje sie ze mnie znajdzie",
  "wie gdzie jestem",
  "nie mogę się od niego uwolnić",
  "nie moge sie od niego uwolnic",
  "ukrywam się przed nim",
  "ukrywam sie przed nim",
  "uciekłam od partnera",
  "uciekam przed partnerem",
  "boję się byłego partnera",
  "boje sie bylego partnera",
  "były partner mi groził",
  "byly partner mi grozil",
];

for (const kw of crisisNew) {
  if (!crisisExisting.has(kw)) {
    k.crisis.keywords.push(kw);
    crisisExisting.add(kw);
    totalAdded++;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// DEPRESJA / SMUTEK — szersze pokrycie kolokwialnego, pośredniego języka
// ═══════════════════════════════════════════════════════════════════════════
totalAdded += addKw("depresja_smutek", [
  "nie mam ochoty na nic",
  "nic mi się nie podoba",
  "nic mi sie nie podoba",
  "wszystko wydaje się bez sensu",
  "wszystko wydaje sie bez sensu",
  "nie widzę światła w tunelu",
  "nie widze swiatla w tunelu",
  "czuję pustkę w sobie",
  "czuje pustke w sobie",
  "nic nie czuję",
  "nic nie czuje",
  "jestem wypalona emocjonalnie",
  "trudno mi wstać z łóżka",
  "trudno mi wstac z lozka",
  "nie chce mi się wstawać",
  "nie chce mi sie wstawac",
  "nie mam siły wstać",
  "nie mam sily wstac",
  "leżę cały dzień",
  "leze caly dzien",
  "nie wychodzę z domu od dawna",
  "nie wychodze z domu od dawna",
  "izoluję się od ludzi",
  "izoluje sie od ludzi",
  "unikam ludzi",
  "nie mam z kim porozmawiać",
  "nie mam z kim porozmawiac",
  "czuję się niewidzialna",
  "czuje sie niewidzialna",
  "jestem ciężarem",
  "jestem ciezarem",
  "wszystko mnie boli",
  "boli mnie istnienie",
  "smutek mnie zalewa",
  "tonę w smutku",
  "tone w smutku",
  "czuję rozpacz",
  "czuje rozpacz",
  "jestem zrozpaczona",
  "nic nie ma sensu",
  "to nie ma sensu",
  "czuję się jak cień",
  "czuje sie jak cien",
  "jestem tylko cieniem siebie",
  "nie poznaję samej siebie od dawna",
  "nie poznaje samej siebie od dawna",
  "zgubiłam radość życia",
  "zgubilam radosc zycia",
  "nie umiem się już cieszyć",
  "nie umiem sie juz cieszyc",
]);

// ═══════════════════════════════════════════════════════════════════════════
// LĘK / ATAKI PANIKI — kolokwializmy, opisy fizjologiczne
// ═══════════════════════════════════════════════════════════════════════════
totalAdded += addKw("lek_napady_paniki", [
  "trzęsą mi się ręce",
  "trzesa mi sie rece",
  "drżę ze strachu",
  "drze ze strachu",
  "jestem przestraszona",
  "czuję się przestraszona",
  "czuje sie przestraszona",
  "boję się",
  "boje sie",
  "pocą mi się ręce ze stresu",
  "poca mi sie rece ze stresu",
  "mam mokre dłonie ze stresu",
  "czuję ucisk w gardle",
  "czuje ucisk w gardle",
  "czuję ucisk w klatce",
  "czuje ucisk w klatce",
  "brakuje mi powietrza",
  "trudno mi złapać oddech",
  "trudno mi zlapac oddech",
  "mam gonitwę myśli",
  "mam gonitwe mysli",
  "panikuję bez powodu",
  "panikuje bez powodu",
  "wpadam w panikę",
  "wpadam w panike",
  "ogarnia mnie lęk",
  "ogarnia mnie lek",
  "czuję się sparaliżowana strachem",
  "czuje sie sparalizowana strachem",
  "boję się ludzi",
  "boje sie ludzi",
  "boję się oceny innych",
  "boje sie oceny innych",
  "boję się rozmów z ludźmi",
  "boje sie rozmow z ludzmi",
  "mam fobię",
  "mam fobie",
  "dostaję drgawek ze stresu",
  "trzęsie mnie ze stresu",
  "trzesie mnie ze stresu",
]);

// ═══════════════════════════════════════════════════════════════════════════
// WSPARCIE PSYCHOLOGICZNE — krótkie / niejasne wołania o pomoc
// ═══════════════════════════════════════════════════════════════════════════
totalAdded += addKw("wsparcie_psychologiczne", [
  "ratunku potrzebuję rozmowy",
  "nie wiem do kogo się zwrócić",
  "nie wiem do kogo sie zwrocic",
  "potrzebuję kogoś",
  "potrzebuje kogos",
  "chcę z kimś pogadać",
  "chce z kims pogadac",
  "muszę z kimś pogadać",
  "musze z kims pogadac",
  "nie mam z kim pogadać",
  "nie mam z kim pogadac",
  "potrzebuję rozmowy",
  "potrzebuje rozmowy",
  "chcę się wyżalić",
  "chce sie wyzalic",
  "potrzebuję się wyżalić",
  "potrzebuje sie wyzalic",
  "szukam kogoś kto wysłucha",
  "szukam kogos kto wysluchaa",
  "nie mam się komu zwierzyć",
  "nie mam sie komu zwierzyc",
]);

// ═══════════════════════════════════════════════════════════════════════════
// RELACJE — toksyczne wzorce, samotność relacyjna
// ═══════════════════════════════════════════════════════════════════════════
totalAdded += addKw("relacje", [
  "boję się zostać sama",
  "boje sie zostac sama",
  "nie umiem kochać",
  "nie umiem kochac",
  "boję się zaufać komuś",
  "boje sie zaufac komus",
  "wszyscy mnie zostawiają",
  "wszyscy mnie zostawiaja",
  "ludzie mnie odpychają",
  "ludzie mnie odpychaja",
  "czuję się niekochana",
  "czuje sie niekochana",
  "nikt mnie nie rozumie",
  "czuję się wykorzystywana w relacji",
  "czuje sie wykorzystywana w relacji",
  "boję się że zostanę sama",
  "boje sie ze zostane sama",
  "powtarzam te same błędy w relacjach",
  "powtarzam te same bledy w relacjach",
  "przyciągam toksycznych ludzi",
  "przyciagam toksycznych ludzi",
]);

// ═══════════════════════════════════════════════════════════════════════════
// STRES / WYPALENIE — krótkie kolokwialne formy
// ═══════════════════════════════════════════════════════════════════════════
totalAdded += addKw("stres_praca", [
  "jestem na granicy wypalenia",
  "nie mam już siły na pracę",
  "nie mam juz sily na prace",
  "praca mnie wykańcza",
  "praca mnie wykancza",
  "nie mogę się wyłączyć",
  "nie moge sie wylaczyc",
  "myślę o pracy cały czas",
  "mysle o pracy caly czas",
]);

totalAdded += addKw("wypalenie", [
  "jestem psychicznie wyczerpana",
  "nie mam już zapału do niczego",
  "nie mam juz zapalu do niczego",
  "wszystko mnie męczy",
  "wszystko mnie meczy",
  "nie mam energii na nic",
  "czuję pustkę po pracy",
  "czuje pustke po pracy",
]);

// ═══════════════════════════════════════════════════════════════════════════
// NISKA SAMOOCENA — autodestrukcyjne myślenie o sobie
// ═══════════════════════════════════════════════════════════════════════════
totalAdded += addKw("niska_samoocena", [
  "jestem do niczego",
  "nie jestem nic warta",
  "czuję się bezwartościowa",
  "czuje sie bezwartosciowa",
  "wszyscy są lepsi od mnie",
  "wszyscy sa lepsi od mnie",
  "zawsze coś ze mną jest nie tak",
  "zawsze cos ze mna jest nie tak",
  "nie umiem siebie pokochać",
  "nie umiem siebie pokochac",
  "czuję się niewystarczająca",
  "czuje sie niewystarczajaca",
]);

// ═══════════════════════════════════════════════════════════════════════════
// ADHD — dodatkowe kolokwialne opisy
// ═══════════════════════════════════════════════════════════════════════════
totalAdded += addKw("adhd", [
  "nie mogę usiedzieć w miejscu",
  "nie moge usiedziec w miejscu",
  "gubię rzeczy",
  "gubie rzeczy",
  "wszystko zaczynam i nie kończę",
  "wszystko zaczynam i nie konczę",
  "ciągle się rozpraszam",
  "ciagle sie rozpraszam",
  "trudno mi dokończyć zadania",
  "trudno mi dokonczyc zadania",
  "żyję w chaosie",
  "zyje w chaosie",
]);

// ═══════════════════════════════════════════════════════════════════════════
// ZABURZENIA ODŻYWIANIA — dodatkowe formy
// ═══════════════════════════════════════════════════════════════════════════
totalAdded += addKw("zaburzenia_odzywiania", [
  "głodzę się",
  "glodze sie",
  "liczę kalorie obsesyjnie",
  "licze kalorie obsesyjnie",
  "boję się jeść",
  "boje sie jesc",
  "wymiotuję po jedzeniu",
  "wymiotuje po jedzeniu",
  "czuję winę po jedzeniu",
  "czuje wine po jedzeniu",
]);

// ═══════════════════════════════════════════════════════════════════════════
// MENOPAUZA — dodatkowe formy
// ═══════════════════════════════════════════════════════════════════════════
totalAdded += addKw("menopauza", [
  "tracę kontrolę nad emocjami",
  "trace kontrole nad emocjami",
  "czuję się jak inna osoba",
  "czuje sie jak inna osoba",
  "nie rozpoznaję swojego ciała",
  "nie rozpoznaje swojego ciala",
]);

// ═══════════════════════════════════════════════════════════════════════════
// SEKSUOLOGIA — dodatkowe formy
// ═══════════════════════════════════════════════════════════════════════════
totalAdded += addKw("seksuologia", [
  "unikam bliskości fizycznej",
  "unikam bliskosci fizycznej",
  "czuję się obco we własnym ciele",
  "czuje sie obco we wlasnym ciele",
]);

writeFileSync("./data/knowledge.json", JSON.stringify(k, null, 2), "utf8");
console.log("Crisis keywords now:", k.crisis.keywords.length);
console.log("Total new keywords added:", totalAdded);
