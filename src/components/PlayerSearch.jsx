import { useState, useMemo } from "react";
import { Search } from "lucide-react";

export default function PlayerSearch({ names, onSelect }) {
  const [query, setQuery] = useState("");

  const matches = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return names.filter((n) => n.toLowerCase().includes(q)).slice(0, 8);
  }, [query, names]);

  return (
    <div className="relative w-full max-w-lg">
      <div className="flex items-center gap-3 glass-panel rounded-full px-5 py-3">
        <Search size={18} color="var(--text-faint)" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="search any IPL player…"
          className="bg-transparent outline-none w-full text-sm"
          style={{ color: "var(--text-primary)" }}
        />
      </div>

      {matches.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 glass-panel rounded-2xl overflow-hidden z-10">
          {matches.map((name) => (
            <button
              key={name}
              onClick={() => {
                onSelect(name);
                setQuery("");
              }}
              className="w-full text-left px-5 py-3 text-sm transition-colors duration-150 glass-panel-hover"
              style={{ color: "var(--text-primary)" }}
            >
              {name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
