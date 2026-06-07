export interface UnansweredLog {
  question: string;
  timestamp: string;
  sessionId: string;
}

const STORAGE_KEY = "co_chatbot_unanswered";

function getSessionId(): string {
  if (typeof window === "undefined") return "ssr";
  let sid = sessionStorage.getItem("co_chatbot_session");
  if (!sid) {
    sid = Math.random().toString(36).slice(2, 10);
    sessionStorage.setItem("co_chatbot_session", sid);
  }
  return sid;
}

export function logUnanswered(question: string): void {
  if (typeof window === "undefined") return;

  const entry: UnansweredLog = {
    question,
    timestamp: new Date().toISOString(),
    sessionId: getSessionId(),
  };

  console.warn("[Chatbot] Unanswered question:", entry);

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const existing: UnansweredLog[] = raw ? JSON.parse(raw) : [];
    existing.push(entry);
    // Keep last 200 entries to avoid overflow
    const trimmed = existing.slice(-200);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch {
    // localStorage unavailable (iframe with strict policies) — console only
  }

  // TODO V2: POST to /api/logs endpoint when database is connected
  // fetch("/api/logs", {
  //   method: "POST",
  //   headers: { "Content-Type": "application/json" },
  //   body: JSON.stringify(entry),
  // });
}

export function getUnansweredLogs(): UnansweredLog[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
