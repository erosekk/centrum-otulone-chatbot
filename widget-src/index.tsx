/**
 * Centrum Otulone — embeddable chat widget
 *
 * Webmaster embed (one tag, place before </body>):
 *   <script src="https://YOUR-DOMAIN.vercel.app/widget.js" async></script>
 *
 * Uses Shadow DOM for full CSS isolation from the host page.
 */

import { createRoot } from "react-dom/client";
import { createElement } from "react";
import ChatWidget from "./ChatWidget";
import { WIDGET_STYLES } from "./styles";

function mount(): void {
  // Guard against double-mounting (e.g. script loaded twice)
  if (document.getElementById("co-chatbot-host")) return;

  /* ── 1. Create host element in the main document ── */
  const host = document.createElement("div");
  host.id = "co-chatbot-host";

  // Position lives on the host (outside shadow DOM) to avoid fixed-position
  // quirks when the WordPress theme applies transform/filter to body/html.
  Object.assign(host.style, {
    position:   "fixed",
    bottom:     "20px",
    right:      "20px",
    zIndex:     "2147483647",
    lineHeight: "normal",
    fontSize:   "16px",
    // Prevent host element itself from capturing pointer events when widget
    // is collapsed (the toggle button inside still receives them normally).
    pointerEvents: "none",
  });

  document.body.appendChild(host);

  /* ── 2. Attach Shadow DOM ── */
  const shadow = host.attachShadow({ mode: "open" });

  // Inject all widget CSS into the shadow root (fully isolated from host page)
  const style = document.createElement("style");
  style.textContent = WIDGET_STYLES;
  shadow.appendChild(style);

  // Container for React
  const container = document.createElement("div");
  // Re-enable pointer events on the actual widget container
  container.style.pointerEvents = "auto";
  shadow.appendChild(container);

  /* ── 3. Mount React ── */
  const root = createRoot(container);
  root.render(createElement(ChatWidget));
}

/* ── Bootstrap ── */
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", mount);
} else {
  mount();
}
