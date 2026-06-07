/**
 * Demo page — local preview only.
 * Loads /widget.js exactly as WordPress would — via a single <script> tag.
 * Run `npm run dev` first (builds widget.js, then starts Next.js on :3000).
 */
import Script from "next/script";
import ExportButton from "@/app/components/ExportButton";

export default function DemoPage() {
  return (
    <>
      <main className="min-h-screen bg-stone-50 flex items-center justify-center p-8">
        <div className="max-w-xl w-full space-y-7">

          {/* Header */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full"
              style={{ background: "linear-gradient(145deg,#7EA587,#527A5A)" }}>
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none"
                stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
                <line x1="9" y1="9" x2="9.01" y2="9"/>
                <line x1="15" y1="9" x2="15.01" y2="9"/>
              </svg>
            </div>
            <h1 className="text-2xl font-semibold text-gray-800">
              Centrum Otulone — Wirtualny Pomocnik
            </h1>
            <p className="text-gray-500 text-sm leading-relaxed">
              Strona demonstracyjna. Widget załadowany identycznie jak na WordPress —
              przez jeden tag{" "}
              <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono text-gray-700">
                &lt;script&gt;
              </code>.
              Kliknij ikonę w prawym dolnym rogu, aby przetestować.
            </p>
          </div>

          {/* Embed snippet for webmaster */}
          <div className="bg-gray-900 rounded-xl p-5 space-y-2">
            <p className="text-gray-400 text-xs font-mono uppercase tracking-wider">
              Kod dla webmastera — wkleić przed &lt;/body&gt;
            </p>
            <pre className="text-green-400 text-sm font-mono whitespace-pre-wrap break-all leading-relaxed select-all">
{`<script
  src="https://centrum-otulone-chatbot.vercel.app/widget.js"
  async
></script>`}
            </pre>
          </div>

          {/* Feature cards */}
          <div className="grid grid-cols-3 gap-3 text-center">
            {[
              { label: "Jeden tag",   desc: "Brak konfiguracji" },
              { label: "Shadow DOM",  desc: "Izolacja CSS" },
              { label: "0 zł / mies.", desc: "Bez płatnych API" },
            ].map(c => (
              <div key={c.label}
                className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <p className="font-semibold text-gray-800 text-sm">{c.label}</p>
                <p className="text-gray-400 text-xs mt-0.5">{c.desc}</p>
              </div>
            ))}
          </div>

          {/* Export unanswered questions */}
          <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm space-y-3">
            <div>
              <p className="font-semibold text-gray-800 text-sm">
                Pytania bez odpowiedzi
              </p>
              <p className="text-gray-500 text-xs mt-0.5 leading-relaxed">
                Gdy bot nie zna odpowiedzi, pytanie trafia do localStorage.
                Pobierz listę, aby uzupełnić bazę wiedzy.
              </p>
            </div>
            <ExportButton />
          </div>

          <p className="text-center text-xs text-gray-400 border-t border-gray-200 pt-4">
            Widget działa na{" "}
            <a href="https://centrumotulone.pl" target="_blank" rel="noopener noreferrer"
              className="text-green-700 hover:underline">
              centrumotulone.pl
            </a>{" "}
            · Next.js + esbuild + Shadow DOM · {new Date().getFullYear()}
          </p>
        </div>
      </main>

      {/* Widget loaded exactly as on any external site */}
      <Script src="/widget.js" strategy="afterInteractive" />
    </>
  );
}
