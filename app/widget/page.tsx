/**
 * Standalone widget page — embed on WordPress via:
 * <iframe src="https://your-domain.vercel.app/widget"
 *         style="position:fixed;bottom:0;right:0;width:380px;height:540px;border:none;z-index:9999;"
 *         allow="clipboard-write">
 * </iframe>
 */

import ChatWidget from "@/components/ChatWidget";

export default function WidgetPage() {
  return <ChatWidget inline />;
}
