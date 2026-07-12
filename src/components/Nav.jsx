export default function Nav({ view, onChange }) {
  const tabs = [
    { key: "search", label: "scout" },
    { key: "leaderboard", label: "leaderboards" },
    { key: "compare", label: "head-to-head" },
  ];

  return (
    <nav className="flex flex-wrap items-center gap-2 mb-10">
      {tabs.map((t) => (
        <button
          key={t.key}
          onClick={() => onChange(t.key)}
          className="mono text-xs tracking-wider px-4 py-2 rounded-full transition-colors duration-150"
          style={{
            background: view === t.key ? "var(--accent-gold)" : "transparent",
            color: view === t.key ? "#0a0e17" : "var(--text-muted)",
            border: `1px solid ${view === t.key ? "var(--accent-gold)" : "var(--border-soft)"}`,
          }}
        >
          {t.label}
        </button>
      ))}
    </nav>
  );
}
