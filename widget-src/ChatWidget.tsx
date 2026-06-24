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
// slug = undefined → pełna lista zespołu. Składnia [etykieta](url) jest renderowana jako klikalny link.
function quizFooter(slug?: string): string {
  const list = slug ? `${ZESPOL}?e-filter-59db304-specjalizacja=${slug}` : ZESPOL;
  const listLabel = slug ? "Zobacz specjalistów →" : "Zobacz cały zespół →";
  return `\n\nOto specjaliści:\n[${listLabel}](${list})\n\nAby umówić wizytę:\n[Umów się online →](${ZAPISY})`;
}

const QUIZ_RESPONSES: Record<string, string> = {
  "Lęk i stres":
    "Przy lęku, napięciu i przewlekłym stresie dobrym pierwszym krokiem może być konsultacja psychologiczna." + quizFooter("psycholog"),

  "Kryzys w związku":
    "Jeśli trudność dotyczy relacji, rozstania lub komunikacji w związku, dobrym kierunkiem może być terapia par." + quizFooter("terapia-pary"),

  "ADHD":
    "Jeśli podejrzewasz u siebie ADHD, możesz zapytać o diagnozę ADHD metodą DIVA5 — pomocną przy trudnościach z koncentracją, organizacją, impulsywnością czy poczuciem chaosu." + quizFooter("diagnoza-adhd-diva5"),

  "Menopauza":
    "Przy trudnościach związanych z menopauzą możesz porozmawiać o emocjach, zmianach w ciele, napięciu i poczuciu przeciążenia podczas konsultacji psychologicznej." + quizFooter("psycholog"),

  "Trudne emocje":
    "Jeśli trudno Ci poradzić sobie z emocjami, napięciem, smutkiem lub przytłoczeniem, dobrym pierwszym krokiem może być konsultacja psychologiczna." + quizFooter("psycholog"),

  "Niska samoocena":
    "Przy niskiej samoocenie, krytycznym myśleniu o sobie lub trudnościach w stawianiu granic pomocna może być konsultacja psychologiczna." + quizFooter("psycholog"),

  "Trauma":
    "Jeśli chcesz pracować z trudnymi doświadczeniami lub traumą, warto skorzystać ze wsparcia psychotraumatologa. Pierwsza konsultacja pomoże dobrać bezpieczną formę pracy." + quizFooter("psychotraumatolog"),

  "Problemy seksualne":
    "W przypadku trudności seksualnych, bólu, spadku libido, wstydu lub pytań związanych z seksualnością dobrym kierunkiem może być konsultacja seksuologiczna." + quizFooter("seksuolog"),

  "Relacja z jedzeniem":
    "Jeśli trudności dotyczą jedzenia, emocji, ciała lub napięcia wokół wyglądu, pomocne może być wsparcie psychodietetyczne." + quizFooter("psychodietetyk"),

  "Nie wiem, czego potrzebuję":
    "To całkowicie w porządku, że nie wiesz jeszcze, jakiej formy pomocy potrzebujesz. Możesz zobaczyć cały zespół albo od razu umówić wizytę — pomożemy dobrać odpowiednią ścieżkę." + quizFooter(),
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

  const bottomRef   = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const showSuggestions = msgs.length === 1 && msgs[0].id === "welcome" && !typing;
  const showQuiz        = quizStep === "category" && !typing;

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
      // Quiz category selected — use hardcoded response, bypass matcher
      if (quizStep === "category" && QUIZ_RESPONSES[trimmed]) {
        setQuizStep(null);
        setTyping(false);
        addMsg("bot", QUIZ_RESPONSES[trimmed]);
        return;
      }

      const result = matchIntent(trimmed);
      if (result.isFallback) logUnanswered(trimmed);

      // Start quiz when "dobor_specjalistki" intent fires
      setQuizStep(result.intentId === "dobor_specjalistki" ? "category" : null);
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
              <div className="co-suggestions" role="group" aria-label="Najczęstsze pytania">
                <div className="co-suggestions-label">Najczęstsze pytania</div>
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
