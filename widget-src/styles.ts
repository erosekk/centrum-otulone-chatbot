// Brand palette — soothing teal matching therapeutic / women's wellness aesthetic
// Primary: #83ADAC  Dark: #527A7D  Mid: #6B9598

export const WIDGET_STYLES = `
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

/* ── Widget wrapper ─────────────────────────────────────────────────────── */
.co-widget {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 12px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
               'Helvetica Neue', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  line-height: normal;
}

/* ── Floating toggle button ─────────────────────────────────────────────── */
.co-toggle {
  width: 58px;
  height: 58px;
  border-radius: 50%;
  background: linear-gradient(145deg, #83ADAC, #527A7D);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow:
    0 4px 20px rgba(82,122,125,0.40),
    0 2px 6px  rgba(0,0,0,0.12);
  transition: filter 0.2s ease, transform 0.12s ease;
  outline: none;
  color: white;
  padding: 0;
  flex-shrink: 0;
}
.co-toggle:hover  { filter: brightness(1.08); }
.co-toggle:active { transform: scale(0.91); }
.co-toggle:focus-visible {
  box-shadow: 0 0 0 3px rgba(107,149,152,0.5),
              0 4px 20px rgba(82,122,125,0.35);
}

/* ── Chat window ─────────────────────────────────────────────────────────── */
.co-window {
  width: 365px;
  height: 530px;
  border-radius: 18px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background: #ffffff;
  box-shadow:
    0 12px 48px rgba(0,0,0,0.16),
    0  4px 14px rgba(0,0,0,0.08),
    0  0   0  1px rgba(0,0,0,0.04);
  animation: co-open 0.24s cubic-bezier(0.16, 1, 0.3, 1);
  transform-origin: bottom right;
}

@keyframes co-open {
  from { opacity: 0; transform: scale(0.88) translateY(14px); }
  to   { opacity: 1; transform: scale(1)    translateY(0); }
}

/* ── Header ──────────────────────────────────────────────────────────────── */
.co-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 13px 15px;
  background: linear-gradient(135deg, #83ADAC 0%, #527A7D 100%);
  color: #ffffff;
  flex-shrink: 0;
}
.co-header-avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: rgba(255,255,255,0.22);
  border: 1.5px solid rgba(255,255,255,0.30);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.co-header-info { flex: 1; min-width: 0; }
.co-header-name {
  font-weight: 700;
  font-size: 13.5px;
  line-height: 1.25;
  color: #fff;
  letter-spacing: 0.01em;
}
.co-header-sub {
  font-size: 11px;
  opacity: 0.82;
  line-height: 1.3;
  color: #fff;
  margin-top: 1px;
}
.co-header-status {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  opacity: 0.82;
  color: #fff;
  margin-top: 1px;
}
.co-status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #A8EFB2;
  flex-shrink: 0;
}
.co-header-close {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: none;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255,255,255,0.85);
  transition: background 0.15s, color 0.15s;
  flex-shrink: 0;
  padding: 0;
  outline: none;
}
.co-header-close:hover { background: rgba(255,255,255,0.18); color: #fff; }

/* ── Messages ────────────────────────────────────────────────────────────── */
.co-messages {
  flex: 1;
  overflow-y: auto;
  padding: 14px 14px 8px;
  background: #F6FAFA;
  scrollbar-width: thin;
  scrollbar-color: #B5CFCE transparent;
  -webkit-overflow-scrolling: touch;
}
.co-messages::-webkit-scrollbar { width: 4px; }
.co-messages::-webkit-scrollbar-thumb {
  background: #B5CFCE;
  border-radius: 2px;
}
.co-messages::-webkit-scrollbar-track { background: transparent; }

/* ── Message row ─────────────────────────────────────────────────────────── */
.co-msg {
  display: flex;
  align-items: flex-start;
  margin-bottom: 10px;
}
.co-msg.co-user { flex-direction: row-reverse; }

.co-msg-avatar {
  width: 27px;
  height: 27px;
  border-radius: 50%;
  background: linear-gradient(145deg, #83ADAC, #527A7D);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-right: 8px;
  margin-top: 2px;
}
.co-msg.co-user .co-msg-avatar { display: none; }

/* ── Bubbles ─────────────────────────────────────────────────────────────── */
.co-bubble {
  max-width: 82%;
  padding: 9px 13px;
  border-radius: 16px;
  border-bottom-left-radius: 4px;
  font-size: 13.5px;
  line-height: 1.58;
  white-space: pre-line;
  word-break: break-word;
  color: #283838;
  background: #FFFFFF;
  box-shadow: 0 1px 3px rgba(0,0,0,0.07);
  border: 1px solid rgba(0,0,0,0.05);
}
.co-msg.co-user .co-bubble {
  background: linear-gradient(135deg, #83ADAC 0%, #527A7D 100%);
  color: #ffffff;
  border: none;
  box-shadow: 0 2px 8px rgba(82,122,125,0.30);
  border-bottom-left-radius: 16px;
  border-bottom-right-radius: 4px;
}

/* ── Suggested questions (chips) ─────────────────────────────────────────── */
.co-suggestions {
  margin-left: 35px;
  margin-bottom: 10px;
  margin-top: -2px;
}
.co-suggestions-label {
  font-size: 10.5px;
  color: #7AAAAA;
  margin-bottom: 7px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.co-chips-scroll {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-height: 190px;
  overflow-y: auto;
  padding-right: 3px;
  scrollbar-width: thin;
  scrollbar-color: #B5CFCE transparent;
}
.co-chips-scroll::-webkit-scrollbar { width: 3px; }
.co-chips-scroll::-webkit-scrollbar-thumb { background: #B5CFCE; border-radius: 2px; }
.co-chip {
  display: inline-flex;
  align-items: center;
  padding: 7px 13px;
  border-radius: 20px;
  border: 1.5px solid #6B9598;
  background: transparent;
  color: #527A7D;
  font-size: 12.5px;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.18s ease;
  text-align: left;
  line-height: 1.3;
  outline: none;
  flex-shrink: 0;
}
.co-chip:hover {
  background: #6B9598;
  color: #ffffff;
  border-color: #6B9598;
  transform: translateY(-1px);
  box-shadow: 0 3px 10px rgba(82,122,125,0.28);
}
.co-chip:active  { transform: translateY(0); }
.co-chip:focus-visible { box-shadow: 0 0 0 2px rgba(107,149,152,0.4); }

/* Quiz variant — slightly warmer fill */
.co-chip-quiz {
  border-color: #83ADAC;
  color: #3D6E71;
}
.co-chip-quiz:hover {
  background: #83ADAC;
  border-color: #83ADAC;
}

/* ── Typing indicator ────────────────────────────────────────────────────── */
.co-typing {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}
.co-typing-avatar {
  width: 27px;
  height: 27px;
  border-radius: 50%;
  background: linear-gradient(145deg, #83ADAC, #527A7D);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.co-typing-dots {
  display: flex;
  gap: 4px;
  background: #FFFFFF;
  border: 1px solid rgba(0,0,0,0.05);
  padding: 10px 14px;
  border-radius: 16px;
  border-bottom-left-radius: 4px;
  align-items: center;
  box-shadow: 0 1px 3px rgba(0,0,0,0.07);
}
.co-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #8DBDBC;
  animation: co-bounce 1.1s infinite;
}
.co-dot:nth-child(2) { animation-delay: 0.16s; }
.co-dot:nth-child(3) { animation-delay: 0.32s; }

@keyframes co-bounce {
  0%, 60%, 100% { transform: translateY(0); }
  30%           { transform: translateY(-4px); }
}

/* ── Input area ──────────────────────────────────────────────────────────── */
.co-input-area {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  padding: 10px 12px;
  border-top: 1px solid #E7F1F1;
  background: #ffffff;
  flex-shrink: 0;
}
.co-textarea {
  flex: 1;
  resize: none;
  border: 1.5px solid #C8E0DF;
  border-radius: 13px;
  padding: 8px 12px;
  font-size: 13.5px;
  font-family: inherit;
  color: #283838;
  outline: none;
  transition: border-color 0.18s, box-shadow 0.18s;
  line-height: 1.45;
  overflow: hidden;
  min-height: 38px;
  max-height: 110px;
  background: #F3FAFA;
}
.co-textarea:focus {
  border-color: #6B9598;
  background: #fff;
  box-shadow: 0 0 0 3px rgba(107,149,152,0.15);
}
.co-textarea::placeholder { color: #9DBDBD; }
.co-textarea:disabled { opacity: 0.5; cursor: not-allowed; }

.co-send-btn {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: linear-gradient(145deg, #83ADAC, #527A7D);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  flex-shrink: 0;
  transition: filter 0.15s, transform 0.12s;
  outline: none;
  padding: 0;
  box-shadow: 0 2px 8px rgba(82,122,125,0.35);
}
.co-send-btn:hover:not(:disabled)  { filter: brightness(1.1); }
.co-send-btn:active:not(:disabled) { transform: scale(0.90); }
.co-send-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
  box-shadow: none;
}

/* ── Mobile responsive ───────────────────────────────────────────────────── */
@media (max-width: 480px) {
  .co-window {
    width: calc(100vw - 20px);
    height: calc(100dvh - 90px);
    min-height: 320px;
    max-height: none;
    border-radius: 16px;
  }
  .co-bubble {
    max-width: 88%;
  }
  .co-textarea {
    font-size: 16px; /* prevents iOS auto-zoom on input focus */
  }
  .co-chip {
    font-size: 13px;
    padding: 8px 13px;
  }
  .co-chips-scroll {
    max-height: 220px;
  }
  .co-suggestions {
    margin-left: 0;
  }
}
`;
