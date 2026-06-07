import {
  useState, useRef, useEffect, useCallback,
  KeyboardEvent, ChangeEvent,
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
  text: "Dzień dobry, jestem wirtualnym pomocnikiem Centrum Otulone. W czym mogę pomóc?",
};

const SUGGESTED: readonly string[] = [
  "Jak umówić wizytę?",
  "Ile kosztuje konsultacja?",
  "Jak odwołać wizytę?",
  "Jak długo trwa sesja?",
];

const BOT_DELAY_MS = 380;

export default function ChatWidget() {
  const [open, setOpen]     = useState(false);
  const [msgs, setMsgs]     = useState<Msg[]>([WELCOME]);
  const [typing, setTyping] = useState(false);
  const [draft, setDraft]   = useState("");

  const bottomRef   = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Show chips only while user hasn't sent any message yet
  const showSuggestions = msgs.length === 1 && msgs[0].id === "welcome" && !typing;

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
      const result = matchIntent(trimmed);
      if (result.isFallback) logUnanswered(trimmed);
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
      {/* Chat window — above the toggle button in flex column */}
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
                Wirtualny Pomocnik
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
                <div className="co-bubble">{m.text}</div>
              </div>
            ))}

            {/* Suggested quick-reply chips */}
            {showSuggestions && (
              <div className="co-suggestions" role="group" aria-label="Sugerowane pytania">
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
