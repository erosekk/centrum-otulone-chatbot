import {
  useState, useRef, useEffect, useCallback,
  KeyboardEvent, ChangeEvent, ReactNode,
} from "react";
import { matchIntent } from "../lib/matcher";
import { logUnanswered } from "../lib/logger";

interface Msg {
  id: string;
  role: "bot" | "user";
  text: string;
}

const WELCOME: Msg = {
  id: "welcome",
  role: "bot",
  text: "Witam Cię serdecznie. Jestem wirtualną pomocnicą Centrum Otulone.\n\nMogę pomóc Ci znaleźć odpowiednią formę wsparcia lub odpowiedzieć na pytania dotyczące wizyt.",
};

const SUGGESTED: readonly string[] = [
  "Nie wiem, do której specjalistki się umówić.",
  "Chcę rozpocząć psychoterapię.",
  "Szukam psychologa dla siebie.",
  "Interesuje mnie diagnoza ADHD.",
  "Chcę umówić konsultację wstępną.",
  "Jakie są ceny wizyt?",
  "Jak wygląda pierwsze spotkanie?",
  "Jak szybko mogę dostać termin?",
  "Gdzie znajduje się Centrum Otulone?",
  "Jak odwołać wizytę?",
  "Najczęstsze pytania",
];

const QUIZ_OPTIONS: readonly string[] = [
  "Lęk i stres",
  "Kryzys w związku",
  "ADHD",
  "Menopauza",
  "Trudne emocje",
  "Niska samoocena",
  "Trauma",
  "Problemy seksualne",
  "Relacja z jedzeniem",
  "Nie wiem, czego potrzebuję",
];

// Lista zespołu na stronie centrum — filtrowana po specjalizacji (zweryfikowane slugi)
const ZESPOL = "https://centrumotulone.pl/o-nas/zespol/";
const ZAPISY = "https://centrumotulone.pl/zapisy/";

// Stopka każdej odpowiedzi quizu: link do listy specjalistów danej kategorii + link do zapisów.
// Składnia [etykieta](url) jest renderowana jako klikalny link.
function footerWithLink(url: string, label = "Zobacz specjalistów →"): string {
  return `\n\nOto specjaliści:\n[${label}](${url})\n\nAby umówić wizytę:\n[Umów się online →](${ZAPISY})`;
}

// slug = undefined → pełna lista zespołu (gdy nie ma dedykowanego filtra specjalizacji).
function quizFooter(slug?: string): string {
  const list = slug ? `${ZESPOL}?e-filter-59db304-specjalizacja=${slug}` : ZESPOL;
  const label = slug ? "Zobacz specjalistów →" : "Zobacz cały zespół →";
  return footerWithLink(list, label);
}

const QUIZ_RESPONSES: Record<string, string> = {
  "Lęk i stres":
    "Przy lęku, napięciu i przewlekłym stresie dobrym pierwszym krokiem może być konsultacja psychologiczna." + quizFooter("psycholog"),

  "Kryzys w związku":
    "Jeśli trudność dotyczy relacji, rozstania lub komunikacji w związku, dobrym kierunkiem może być terapia par." + quizFooter("terapia-pary"),

  "ADHD":
    "Jeśli podejrzewasz u siebie ADHD, możesz zapytać o diagnozę ADHD metodą DIVA5 — pomocną przy trudnościach z koncentracją, organizacją, impulsywnością czy poczuciem chaosu." + quizFooter("diagnoza-adhd-diva5"),

  "Menopauza":
    "Przy trudnościach związanych z menopauzą możesz porozmawiać o emocjach, zmianach w ciele, napięciu i poczuciu przeciążenia podczas konsultacji psychologicznej." +
    footerWithLink("https://centrumotulone.pl/?s=menopauza"),

  "Trudne emocje":
    "Jeśli trudno Ci poradzić sobie z emocjami, napięciem, smutkiem lub przytłoczeniem, dobrym pierwszym krokiem może być konsultacja psychologiczna." + quizFooter("psycholog"),

  "Niska samoocena":
    "Przy niskiej samoocenie, krytycznym myśleniu o sobie lub trudnościach w stawianiu granic pomocna na początek może być konsultacja psychologiczna, a potem najczęściej psychoterapia." + quizFooter("psycholog"),

  "Trauma":
    "Jeśli chcesz pracować z trudnymi doświadczeniami lub traumą, warto skorzystać ze wsparcia psychotraumatologa. Pierwsza konsultacja pomoże dobrać bezpieczną formę pracy." + quizFooter("psychotraumatolog"),

  "Problemy seksualne":
    "W przypadku trudności seksualnych, bólu, spadku libido, wstydu lub pytań związanych z seksualnością dobrym kierunkiem może być konsultacja seksuologiczna." + quizFooter("seksuolog"),

  "Relacja z jedzeniem":
    "Jeśli trudności dotyczą jedzenia, emocji, ciała lub napięcia wokół wyglądu, pomocne może być wsparcie psychodietetyczne." + quizFooter("psychodietetyk"),

  "Nie wiem, czego potrzebuję":
    "To całkowicie w porządku, że nie wiesz jeszcze, jakiej formy pomocy potrzebujesz. Tutaj proponujemy darmową konsultację telefoniczną, w której rozwiejesz wszystkie swoje wątpliwości.\n\nAby umówić darmową konsultację telefoniczną:\n[Kliknij w link →](https://centrumotulone.pl/usluga/darmowa-konsultacja-telefoniczna/)",
};

// Etykieta startowego kafelka, który otwiera listę najczęstszych pytań (FAQ).
const FAQ_TRIGGER = "Najczęstsze pytania";
const FAQ_INTRO = "Oto najczęściej zadawane pytania. Kliknij, aby zobaczyć odpowiedź:";

// Pytania i odpowiedzi przeniesione 1:1 ze strony centrumotulone.pl/najczestsze-pytania/.
const FAQ_QUESTIONS: readonly string[] = [
  "Od czego zacząć?",
  "Co jeśli nie wiem, jak zacząć mówić o swoim problemie?",
  "Czy muszę wiedzieć, jaki rodzaj terapii jest dla mnie?",
  "Ile trwa sesja psychoterapii?",
  "Jak często odbywają się spotkania?",
  "Co jeśli spóźnię się na spotkanie?",
  "Czy mogę skorzystać z jednorazowej konsultacji?",
  "Jak mogę odwołać wizytę?",
  "Dlaczego obowiązuje opłata za wizytę odwołaną po 48 godz.?",
  "Jak długo trwa cała terapia?",
  "Czy mogę zrezygnować z terapii sama?",
  "Ile kosztuje terapia?",
  "Czy mogę zmienić terapeutkę?",
  "Czy terapia jest poufna?",
  "Co to jest kontrakt terapeutyczny?",
  "Kto ustala cele terapii?",
  "Czy specjalistka może zrezygnować z prowadzenia terapii?",
  "Czy można kontaktować się bezpośrednio ze specjalistką?",
  "Czy wystawiacie zwolnienia i recepty?",
  "Czy terapia jest dla mnie, jeśli nie mam dużych problemów?",
  "Czym różni się psycholog, psychoterapeutka i psychiatra?",
  "Czy mogę przyjść z partnerem?",
  "Czy prowadzicie konsultacje dla nastolatek?",
  "Czy mogę zacząć terapię, jeśli już kiedyś byłam w terapii?",
  "Czy sesje są nagrywane?",
  "Co jeśli czuję, że terapia „nie działa\"?",
];

const FAQ_RESPONSES: Record<string, string> = {
  "Od czego zacząć?":
    "Pierwszym krokiem jest konsultacja wstępna z psycholożką (ok. 3 spotkań) – to rozmowa, podczas której poznajemy Twoją sytuację, potrzeby i to, z czym do nas przychodzisz. Konsultacja pozwala nam dobrać dla Ciebie odpowiednią specjalistkę i formę terapii.",

  "Co jeśli nie wiem, jak zacząć mówić o swoim problemie?":
    "To częste i bardzo ludzkie. To psycholożka prowadzi spotkanie, zadaje pytania i pomaga Ci nazwać to, co czujesz. Nie musisz mieć przygotowanego „scenariusza\".",

  "Czy muszę wiedzieć, jaki rodzaj terapii jest dla mnie?":
    "Nie – to zadaniem zespołu jest wyjaśnienie różnic i zaproponowanie najlepszego podejścia. W Otulone pracujemy m.in. w nurcie CBT, podejściu ericksonowskim, psychodynamicznym, systemowym i integracyjnym. Pracujemy z traumą szeroko pojętą. Współpracujemy również z psychodietetyczką, seksuolożką i coachkami.",

  "Ile trwa sesja psychoterapii?":
    "Standardowa sesja trwa 50 minut.",

  "Jak często odbywają się spotkania?":
    "Rekomendujemy, aby sesje terapeutyczne odbywały się raz w tygodniu, ze względu na udowodnioną skuteczność, szybsze zdrowienie i możliwość optymalnego zaangażowania w proces terapii. W sytuacjach kryzysowych lub w terapii prowadzonej psychodynamicznie spotkania mogą odbywać się 2 razy w tygodniu.",

  "Co jeśli spóźnię się na spotkanie?":
    "Zdarza się i najlepszym — wiemy, że życie bywa nieprzewidywalne. Jeśli jednak spóźnisz się na wizytę, spotkanie zakończy się o zaplanowanej godzinie. Ze względu na kolejne pacjentki oraz krótką przerwę pomiędzy sesjami, terapeutka nie ma możliwości jego przedłużenia.\n\nCzas wizyty jest zarezerwowany wyłącznie dla Ciebie i staramy się dbać o punktualność oraz komfort wszystkich osób korzystających z naszych usług. Nawet jeśli sesja będzie krótsza, jej koszt pozostaje bez zmian.",

  "Czy mogę skorzystać z jednorazowej konsultacji?":
    "Tak. Jeśli nie jesteś pewna, czego potrzebujesz – jednorazowa konsultacja pomoże uporządkować sytuację, dostać wskazówki i poczuć ulgę.",

  "Jak mogę odwołać wizytę?":
    "Wizytę możesz odwołać telefonicznie, mailowo lub SMS-owo.\n\nMożesz bezpłatnie odwołać wizytę do 48 godzin przed terminem. Późniejsze odwołanie lub nieobecność (niezależnie od przyczyny) — wiąże się z opłatą 100% ceny wizyty.",

  "Dlaczego obowiązuje opłata za wizytę odwołaną po 48 godz.?":
    "Rozumiemy, że w życiu zdarzają się sytuacje nagłe, trudne i bardzo ważne. Wiemy, że decyzja o odwołaniu wizyty w ostatniej chwili często nie wynika z braku szacunku, lecz z przeciążenia, kryzysu lub okoliczności, na które nie mamy wpływu.\n\nJednocześnie chcemy być wobec Was uczciwe i transparentne. Czas wizyty jest rezerwowany wyłącznie dla Ciebie. Nasza specjalistka przygotowuje się do spotkania, pozostaje w gotowości i ma w tym czasie zablokowaną możliwość przyjęcia innej osoby. Za tę gotowość otrzymuje wynagrodzenie – niezależnie od tego, czy spotkanie się odbędzie.\n\nTen zapis nie ma na celu karania ani braku zrozumienia dla trudnych sytuacji. Jest sposobem na dbanie o stabilność pracy naszych specjalistek, uczciwość wobec innych pacjentek oraz możliwość utrzymania wysokiej jakości i ciągłości wsparcia, które oferujemy.",

  "Jak długo trwa cała terapia?":
    "To bardzo indywidualne, ale spytaj o to swoją specjalistkę, zazwyczaj:\n– konsultacje: ok. 3 spotkań\n– wsparcie krótkoterminowe: 6–12 spotkań\n– terapia krótkoterminowa: 3–6 miesięcy\n– terapia długoterminowa: 6 miesięcy – kilka lat",

  "Czy mogę zrezygnować z terapii sama?":
    "Tak. To nie jest zobowiązanie na całe życie. Jeśli nosisz się z taką decyzją, porozmawiaj o tym ze swoją terapeutką. Zakończenie długotrwałej terapii wymaga pożegnania i zamknięcia procesu.",

  "Ile kosztuje terapia?":
    "Ceny różnią się w zależności od specjalizacji, rodzaju spotkania i doświadczenia specjalistki.\n\nAktualny cennik znajdziesz pod tym linkiem:\n[Zobacz cennik →](https://centrumotulone.pl/cennik/)",

  "Czy mogę zmienić terapeutkę?":
    "Tak, masz do tego prawo. Relacja terapeutyczna jest bardzo ważną częścią procesu i czasem zdarza się, że pojawiają się wątpliwości, trudne emocje lub poczucie, że „coś nie działa\".\n\nZanim podejmiesz decyzję o zmianie, zachęcamy jednak, aby — jeśli to możliwe — porozmawiać o tym ze swoją obecną terapeutką. Opowiedzenie o tym, co Cię niepokoi, czego Ci brakuje lub co jest trudne, bywa samo w sobie bardzo terapeutyczne. Taka szczera rozmowa może pomóc w odbudowaniu zaufania, lepszym zrozumieniu siebie nawzajem i czasem staje się ważnym, przełomowym momentem w terapii.\n\nJeśli po tej rozmowie poczujesz, że zmiana jest dla Ciebie najlepszym rozwiązaniem — to również jest w porządku. Pomożemy Ci w spokojny i uważny sposób znaleźć inną specjalistkę, tak abyś mogła kontynuować proces w poczuciu bezpieczeństwa i zaopiekowania 🤍",

  "Czy terapia jest poufna?":
    "Tak. Obowiązuje nas pełna tajemnica zawodowa, określona ustawą o zawodzie psychologa. Wyjątki dotyczą jedynie sytuacji zagrożenia życia lub zdrowia.",

  "Co to jest kontrakt terapeutyczny?":
    "Przed rozpoczęciem terapii terapeutka przedstawi Tobie szczegółowe zasady i opowie, jak będzie wyglądała współpraca. Poprosi Cię o podpisanie kontraktu terapeutycznego, który jest rodzajem umowy i oświadczeniem woli uczestnictwa w psychoterapii na opisanych zasadach oraz wiedzy, z czym ta decyzja się wiąże.",

  "Kto ustala cele terapii?":
    "Ty jesteś sterem swoich celów, natomiast specjalistka może Ci w tym pomóc, nakierować na odpowiednie tory, nazwać czy pomóc Ci rozpoznawać Twoje potrzeby. Ich osiągnięcie zależy od Twojego zaangażowania w proces terapii.",

  "Czy specjalistka może zrezygnować z prowadzenia terapii?":
    "Tak, jeśli to przekracza jej kompetencje lub jeśli pacjentka nie przestrzega zasad kontraktu.",

  "Czy można kontaktować się bezpośrednio ze specjalistką?":
    "W Centrum Otulone kontaktem pomiędzy pacjentką a specjalistką są nasze panie w recepcji. Nie podajemy bezpośrednich numerów telefonów do naszych specjalistek, chyba że specjalistka ustali inaczej ze swoją pacjentką.",

  "Czy wystawiacie zwolnienia i recepty?":
    "Nie – to robi lekarz psychiatra. Jeśli potrzebujesz konsultacji psychiatrycznej, pokierujemy Cię dalej.",

  "Czy terapia jest dla mnie, jeśli nie mam dużych problemów?":
    "Tak. Terapia jest dla wszystkich ludzi. Jeśli przeżywasz różne rozterki, np. czujesz stres, przeciążenie, masz niską samoocenę, chcesz lepiej rozumieć swoje emocje, stoisz przed ważną decyzją, czy chcesz pokochać siebie bardziej — terapia może Ci w tym pomóc. Terapia to nie tylko leczenie, lecz także rozwój.",

  "Czym różni się psycholog, psychoterapeutka i psychiatra?":
    "Psycholog – diagnozuje, konsultuje, wspiera.\nPsychoterapeutka – prowadzi proces terapeutyczny.\nPsychiatra – lekarz, może wypisać leki i zwolnienie.",

  "Czy mogę przyjść z partnerem?":
    "Centrum Otulone jest miejscem dedykowanym tylko dla kobiet. Jeśli problem dotyczy relacji, można to omówić indywidualnie na konsultacji. Nasza specjalistka pokieruje Was do naszej terapeutki par, która we współpracy z nami przyjmuje pary poza siedzibą centrum.",

  "Czy prowadzicie konsultacje dla nastolatek?":
    "Niestety nie – prowadzimy konsultacje tylko dla kobiet powyżej 18 roku życia.",

  "Czy mogę zacząć terapię, jeśli już kiedyś byłam w terapii?":
    "Oczywiście. Terapia na różnych etapach życia działa inaczej – z inną dojrzałością, innymi doświadczeniami.",

  "Czy sesje są nagrywane?":
    "Nie – nie nagrywamy spotkań i nie wyrażamy zgody na nagrywanie przez pacjentki, aby zachować pełną poufność. Chyba że zostanie to ustalone między pacjentką a specjalistką inaczej.",

  "Co jeśli czuję, że terapia „nie działa\"?":
    "Porozmawiaj o tym z terapeutką – to ważny temat w procesie. Może być potrzebna zmiana metody, częstotliwości lub specjalistki. Terapia to współpraca – nie jesteś tu sama.",
};

// Renderuje tekst bota, zamieniając składnię [etykieta](url) na klikalne linki.
// Zwykły tekst i znaki nowej linii pozostają bez zmian (bąbelek ma white-space: pre-line).
const MD_LINK = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;
function renderRich(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let last = 0;
  let key = 0;
  let m: RegExpExecArray | null;
  MD_LINK.lastIndex = 0;
  while ((m = MD_LINK.exec(text)) !== null) {
    if (m.index > last) nodes.push(text.slice(last, m.index));
    nodes.push(
      <a key={key++} href={m[2]} target="_blank" rel="noopener noreferrer" className="co-link">
        {m[1]}
      </a>,
    );
    last = m.index + m[0].length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

const BOT_DELAY_MS = 380;

export default function ChatWidget() {
  const [open, setOpen]         = useState(false);
  const [msgs, setMsgs]         = useState<Msg[]>([WELCOME]);
  const [typing, setTyping]     = useState(false);
  const [draft, setDraft]       = useState("");
  const [quizStep, setQuizStep] = useState<null | "category">(null);
  const [faqStep, setFaqStep]   = useState<null | "list">(null);

  const bottomRef   = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const showSuggestions = msgs.length === 1 && msgs[0].id === "welcome" && !typing;
  const showQuiz        = quizStep === "category" && !typing;
  const showFaq          = faqStep === "list"  && !typing;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, typing]);

  useEffect(() => {
    if (open && !typing) textareaRef.current?.focus();
  }, [open, typing]);

  const addMsg = useCallback((role: "bot" | "user", text: string) => {
    setMsgs(prev => [
      ...prev,
      { id: Math.random().toString(36).slice(2), role, text },
    ]);
  }, []);

  function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || typing) return;
    setDraft("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    addMsg("user", trimmed);
    setTyping(true);

    setTimeout(() => {
      // Starter kafelek "Najczęstsze pytania" — otwiera listę FAQ, bypass matcher
      if (trimmed === FAQ_TRIGGER) {
        setQuizStep(null);
        setFaqStep("list");
        setTyping(false);
        addMsg("bot", FAQ_INTRO);
        return;
      }

      // Pytanie z listy FAQ wybrane — hardcoded odpowiedź, bypass matcher.
      // Lista FAQ zostaje widoczna, żeby można było przeglądać kolejne pytania.
      if (faqStep === "list" && FAQ_RESPONSES[trimmed]) {
        setTyping(false);
        addMsg("bot", FAQ_RESPONSES[trimmed]);
        return;
      }

      // Quiz category selected — use hardcoded response, bypass matcher
      if (quizStep === "category" && QUIZ_RESPONSES[trimmed]) {
        setQuizStep(null);
        setFaqStep(null);
        setTyping(false);
        addMsg("bot", QUIZ_RESPONSES[trimmed]);
        return;
      }

      const result = matchIntent(trimmed);
      if (result.isFallback) logUnanswered(trimmed);

      // Start quiz when "dobor_specjalistki" intent fires
      setQuizStep(result.intentId === "dobor_specjalistki" ? "category" : null);
      setFaqStep(null);
      setTyping(false);
      addMsg("bot", result.response);
    }, BOT_DELAY_MS);
  }

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(draft); }
  }

  function onDraftChange(e: ChangeEvent<HTMLTextAreaElement>) {
    setDraft(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 110) + "px";
  }

  return (
    <div className="co-widget">
      {open && (
        <div
          className="co-window"
          role="dialog"
          aria-label="Czat z pomocnikiem Centrum Otulone"
          aria-modal="false"
        >
          {/* Header */}
          <div className="co-header">
            <div className="co-header-avatar">
              <SmileIcon color="white" size={19} />
            </div>
            <div className="co-header-info">
              <div className="co-header-name">Centrum Otulone</div>
              <div className="co-header-status">
                <span className="co-status-dot" aria-hidden="true" />
                Wirtualna Pomocnica
              </div>
            </div>
            <button
              className="co-header-close"
              onClick={() => setOpen(false)}
              aria-label="Zamknij czat"
            >
              <XIcon color="white" size={15} />
            </button>
          </div>

          {/* Messages */}
          <div className="co-messages" role="log" aria-live="polite" aria-label="Historia rozmowy">
            {msgs.map(m => (
              <div key={m.id} className={`co-msg${m.role === "user" ? " co-user" : ""}`}>
                {m.role === "bot" && (
                  <div className="co-msg-avatar" aria-hidden="true">
                    <SmileIcon color="white" size={13} />
                  </div>
                )}
                <div className="co-bubble">{renderRich(m.text)}</div>
              </div>
            ))}

            {/* Initial quick-reply buttons */}
            {showSuggestions && (
              <div className="co-suggestions" role="group" aria-label="Podpowiedzi">
                <div className="co-chips-scroll">
                  {SUGGESTED.map(q => (
                    <button
                      key={q}
                      className="co-chip"
                      onClick={() => send(q)}
                      aria-label={`Zapytaj: ${q}`}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quiz category buttons */}
            {showQuiz && (
              <div className="co-suggestions" role="group" aria-label="Wybierz temat">
                <div className="co-suggestions-label">Z czym się zmagasz?</div>
                <div className="co-chips-scroll">
                  {QUIZ_OPTIONS.map(q => (
                    <button
                      key={q}
                      className="co-chip co-chip-quiz"
                      onClick={() => send(q)}
                      aria-label={`Wybierz: ${q}`}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* FAQ question buttons */}
            {showFaq && (
              <div className="co-suggestions" role="group" aria-label="Najczęstsze pytania">
                <div className="co-suggestions-label">Wybierz pytanie</div>
                <div className="co-chips-scroll">
                  {FAQ_QUESTIONS.map(q => (
                    <button
                      key={q}
                      className="co-chip co-chip-quiz"
                      onClick={() => send(q)}
                      aria-label={`Pokaż odpowiedź: ${q}`}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {typing && (
              <div className="co-typing" aria-label="Pomocnik pisze…" aria-live="polite">
                <div className="co-typing-avatar" aria-hidden="true">
                  <SmileIcon color="white" size={13} />
                </div>
                <div className="co-typing-dots" aria-hidden="true">
                  <span className="co-dot" />
                  <span className="co-dot" />
                  <span className="co-dot" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="co-input-area">
            <textarea
              ref={textareaRef}
              className="co-textarea"
              rows={1}
              placeholder="Wpisz wiadomość…"
              value={draft}
              onChange={onDraftChange}
              onKeyDown={onKeyDown}
              disabled={typing}
              aria-label="Wpisz wiadomość do pomocnika"
            />
            <button
              className="co-send-btn"
              onClick={() => send(draft)}
              disabled={typing || !draft.trim()}
              aria-label="Wyślij wiadomość"
            >
              <SendIcon color="white" size={15} />
            </button>
          </div>
        </div>
      )}

      {/* Floating toggle button */}
      <button
        className="co-toggle"
        onClick={() => setOpen(o => !o)}
        aria-label={open ? "Zamknij czat" : "Otwórz czat z pomocnikiem Centrum Otulone"}
        aria-expanded={open}
      >
        {open
          ? <XIcon    color="white" size={22} />
          : <ChatIcon color="white" size={24} />
        }
      </button>
    </div>
  );
}

// ── Icons ──────────────────────────────────────────────────────────────────

function SmileIcon({ color, size }: { color: string; size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <circle cx="12" cy="12" r="10"/>
      <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
      <line x1="9"  y1="9"  x2="9.01"  y2="9"/>
      <line x1="15" y1="9"  x2="15.01" y2="9"/>
    </svg>
  );
}

function XIcon({ color, size }: { color: string; size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <line x1="18" y1="6"  x2="6"  y2="18"/>
      <line x1="6"  y1="6"  x2="18" y2="18"/>
    </svg>
  );
}

function ChatIcon({ color, size }: { color: string; size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  );
}

function SendIcon({ color, size }: { color: string; size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <line x1="22" y1="2" x2="11" y2="13"/>
      <polygon points="22 2 15 22 11 13 2 9 22 2"/>
    </svg>
  );
}
