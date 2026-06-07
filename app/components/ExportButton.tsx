"use client";

import { useState } from "react";
import { getUnansweredLogs } from "@/lib/logger";

export default function ExportButton() {
  const [count, setCount] = useState<number | null>(null);

  function handleExport() {
    const logs = getUnansweredLogs();
    setCount(logs.length);

    if (logs.length === 0) return;

    const json = JSON.stringify(logs, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url  = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href     = url;
    a.download = `unanswered-questions-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        onClick={handleExport}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-gray-200
                   text-gray-700 text-sm font-medium shadow-sm hover:bg-gray-50 hover:border-gray-300
                   active:scale-95 transition-all"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="7 10 12 15 17 10"/>
          <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
        Eksportuj nieznane pytania (.json)
      </button>

      {count !== null && (
        <p className="text-xs text-gray-500">
          {count === 0
            ? "Brak zapisanych pytań bez odpowiedzi."
            : `Pobrano ${count} pytanie${count === 1 ? "" : count < 5 ? "a" : "ń"}.`}
        </p>
      )}
    </div>
  );
}
