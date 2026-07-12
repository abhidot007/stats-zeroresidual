import { useState } from "react";
import { Link2, Check } from "lucide-react";

// The URL is kept in sync with app state via urlState.js as the user
// interacts (player selection, head-to-head picks, etc.), so by the time
// this is clicked window.location.href already reflects exactly what's
// on screen — no extra plumbing needed here.
export default function CopyLinkButton({ label = "copy link", className = "" }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard API can fail (permissions, insecure context) — the URL
      // is still shareable straight from the address bar either way.
    }
  }

  return (
    <button
      onClick={handleCopy}
      className={`mono text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-full glass-panel glass-panel-hover transition-colors duration-150 flex-shrink-0 ${className}`}
      style={{ color: copied ? "var(--tier-a-plus)" : "var(--text-muted)" }}
    >
      {copied ? <Check size={12} /> : <Link2 size={12} />}
      {copied ? "copied!" : label}
    </button>
  );
}
