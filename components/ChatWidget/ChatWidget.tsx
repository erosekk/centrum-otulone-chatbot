"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import ChatMessage, { Message } from "./ChatMessage";
import ChatInput from "./ChatInput";
import { matchIntent } from "@/lib/matcher";
import { logUnanswered } from "@/lib/logger";

const WELCOME_MESSAGE: Message = {
  id: "welcome",
  role: "bot",
  text: "Dzień dobry, jestem wirtualnym pomocnikiem Centrum Otulone. W czym mogę pomóc?",
  timestamp: new Date(),
};

const BOT_DELAY_MS = 400;

interface ChatWidgetProps {
  /** When true, widget renders as a full-page chat (for /widget iframe route) */
  inline?: boolean;
}

export default function ChatWidget({ inline = false }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(inline);
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasMounted = useRef(false);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (hasMounted.current) scrollToBottom();
    else hasMounted.current = true;
  }, [messages, scrollToBottom]);

  function addMessage(msg: Omit<Message, "id" | "timestamp">) {
    setMessages((prev) => [
      ...prev,
      { ...msg, id: Math.random().toString(36).slice(2), timestamp: new Date() },
    ]);
  }

  function handleUserMessage(text: string) {
    addMessage({ role: "user", text });
    setIsTyping(true);

    setTimeout(() => {
      const result = matchIntent(text);

      if (result.isFallback) {
        logUnanswered(text);
      }

      setIsTyping(false);
      addMessage({ role: "bot", text: result.response });
    }, BOT_DELAY_MS);
  }

  // ── Inline (full-page iframe) mode ────────────────────────────────────────
  if (inline) {
    return (
      <div className="flex flex-col h-screen bg-white">
        <ChatHeader onClose={undefined} showClose={false} />
        <div className="flex-1 overflow-y-auto px-4 pt-4 pb-2">
          {messages.map((m) => (
            <ChatMessage key={m.id} message={m} />
          ))}
          {isTyping && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>
        <ChatInput onSend={handleUserMessage} disabled={isTyping} />
      </div>
    );
  }

  // ── Floating widget mode ──────────────────────────────────────────────────
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      {/* Chat window */}
      {isOpen && (
        <div
          className="flex flex-col rounded-2xl overflow-hidden shadow-widget bg-white"
          style={{ width: 360, height: 520 }}
          role="dialog"
          aria-label="Czat z pomocnikiem Centrum Otulone"
        >
          <ChatHeader onClose={() => setIsOpen(false)} showClose />
          <div className="flex-1 overflow-y-auto px-4 pt-4 pb-2">
            {messages.map((m) => (
              <ChatMessage key={m.id} message={m} />
            ))}
            {isTyping && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>
          <ChatInput onSend={handleUserMessage} disabled={isTyping} />
        </div>
      )}

      {/* Floating button */}
      <button
        onClick={() => setIsOpen((o) => !o)}
        aria-label={isOpen ? "Zamknij czat" : "Otwórz czat z pomocnikiem"}
        className="w-14 h-14 rounded-full bg-brand-500 text-white shadow-widget flex items-center justify-center hover:bg-brand-600 active:scale-95 transition-all"
      >
        {isOpen ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        )}
      </button>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────

function ChatHeader({
  onClose,
  showClose,
}: {
  onClose?: () => void;
  showClose: boolean;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-brand-500 text-white">
      {/* Logo / Avatar */}
      <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2a10 10 0 0 1 10 10c0 5.52-4.48 10-10 10S2 17.52 2 12 6.48 2 12 2z" />
          <path d="M8 14s1.5 2 4 2 4-2 4-2" />
          <line x1="9" y1="9" x2="9.01" y2="9" />
          <line x1="15" y1="9" x2="15.01" y2="9" />
        </svg>
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm leading-tight">Centrum Otulone</p>
        <p className="text-xs text-white/75 leading-tight">Wirtualny Pomocnik</p>
      </div>

      {showClose && onClose && (
        <button
          onClick={onClose}
          aria-label="Zamknij czat"
          className="w-7 h-7 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors flex-shrink-0"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      )}
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-2 mb-3">
      <div className="w-7 h-7 rounded-full bg-brand-500 flex items-center justify-center flex-shrink-0">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2a10 10 0 0 1 10 10c0 5.52-4.48 10-10 10S2 17.52 2 12 6.48 2 12 2z" />
        </svg>
      </div>
      <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1 items-center">
        <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "0ms" }} />
        <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "150ms" }} />
        <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "300ms" }} />
      </div>
    </div>
  );
}
