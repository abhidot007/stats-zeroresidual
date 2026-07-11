import { useState, useMemo } from "react";
import TierBadge from "./TierBadge";

const TIER_ORDER = ["S", "A+", "A", "B", "C", "F"];
const BATTING_ROLES = ["Opener", "Middle-order", "Finisher", "Tailender"];
const BOWLER_TYPES = ["Pace", "Spin"];

const BATTING_COLUMNS = [
  { key: "goat_score", label: "GOAT Score" },
  { key: "career_true_avg", label: "True Avg" },
  { key: "career_true_sr", label: "True SR" },
  { key: "raw_batting_talent", label: "Pure Talent" },
  { key: "legacy_score", label: "Legacy" },
];

const BOWLING_COLUMNS = [
  { key: "bowling_goat_score", label: "GOAT Score" },
  { key: "career_true_average", label: "True Avg" },
  { key: "career_true_economy", label: "True Econ" },
  { key: "career_true_strike_rate", label: "True SR" },
  { key: "raw_bowling_talent", label: "Pure Talent" },
];

function FilterPill({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className="mono text-xs px-3 py-1.5 rounded-full transition-colors duration-150"
      style={{
        background: active ? "var(--accent-gold)" : "var(--bg-panel)",
        border: `1px solid ${active ? "var(--accent-gold)" : "var(--border-soft)"}`,
        color: active ? "#0a0e17" : "var(--text-muted)",
      }}
    >
      {children}
    </button>
  );
}

export default function Leaderboard({ batting, bowling, onSelectPlayer }) {
  const [discipline, setDiscipline] = useState("Batting");
  const [roleFilter, setRoleFilter] = useState("All");
  const [tierFilter, setTierFilter] = useState("All");
  const [eligibleOnly, setEligibleOnly] = useState(true);
  const [sortKey, setSortKey] = useState("goat_score");
  const [sortDir, setSortDir] = useState("desc");

  const isBatting = discipline === "Batting";
  const columns = isBatting ? BATTING_COLUMNS : BOWLING_COLUMNS;
  const roleOptions = isBatting ? BATTING_ROLES : BOWLER_TYPES;
  const roleKey = isBatting ? "role" : "bowler_type";
  const scoreKey = isBatting ? "goat_score" : "bowling_goat_score";

  const rows = useMemo(() => {
    let data = isBatting ? batting : bowling;
    if (eligibleOnly) data = data.filter((r) => r.goat_eligibility === "Eligible");
    if (roleFilter !== "All") data = data.filter((r) => r[roleKey] === roleFilter);
    if (tierFilter !== "All") data = data.filter((r) => r.tier === tierFilter);

    const key = sortKey === "goat_score" ? scoreKey : sortKey;
    const sorted = [...data].sort((a, b) => {
      const av = a[key] ?? -Infinity;
      const bv = b[key] ?? -Infinity;
      return sortDir === "desc" ? bv - av : av - bv;
    });
    return sorted;
  }, [batting, bowling, isBatting, eligibleOnly, roleFilter, tierFilter, sortKey, sortDir, roleKey, scoreKey]);

  function toggleSort(key) {
    if (sortKey === key) {
      setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  return (
    <div className="w-full max-w-4xl">
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <FilterPill
          active={discipline === "Batting"}
          onClick={() => {
            setDiscipline("Batting");
            setRoleFilter("All");
          }}
        >
          Batting
        </FilterPill>
        <FilterPill
          active={discipline === "Bowling"}
          onClick={() => {
            setDiscipline("Bowling");
            setRoleFilter("All");
          }}
        >
          Bowling
        </FilterPill>

        <div className="w-px h-5 mx-1" style={{ background: "var(--border-soft)" }} />

        <FilterPill active={roleFilter === "All"} onClick={() => setRoleFilter("All")}>
          all roles
        </FilterPill>
        {roleOptions.map((r) => (
          <FilterPill key={r} active={roleFilter === r} onClick={() => setRoleFilter(r)}>
            {r}
          </FilterPill>
        ))}

        <div className="w-px h-5 mx-1" style={{ background: "var(--border-soft)" }} />

        <FilterPill active={tierFilter === "All"} onClick={() => setTierFilter("All")}>
          all tiers
        </FilterPill>
        {TIER_ORDER.map((t) => (
          <FilterPill key={t} active={tierFilter === t} onClick={() => setTierFilter(t)}>
            {t}
          </FilterPill>
        ))}

        <div className="w-px h-5 mx-1" style={{ background: "var(--border-soft)" }} />

        <FilterPill active={eligibleOnly} onClick={() => setEligibleOnly((v) => !v)}>
          {eligibleOnly ? "eligible only" : "show all"}
        </FilterPill>
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden">
        <div
          className="grid text-xs mono px-5 py-3"
          style={{
            gridTemplateColumns: `2fr 1fr 0.6fr ${columns.map(() => "1fr").join(" ")}`,
            borderBottom: "1px solid var(--border-soft)",
            color: "var(--text-faint)",
          }}
        >
          <div>player</div>
          <div>{isBatting ? "role" : "type"}</div>
          <div>tier</div>
          {columns.map((c) => (
            <button
              key={c.key}
              onClick={() => toggleSort(c.key === "goat_score" ? scoreKey : c.key)}
              className="text-left transition-colors duration-150"
              style={{
                color: (sortKey === c.key || (c.key === "goat_score" && sortKey === scoreKey))
                  ? "var(--accent-gold)"
                  : "var(--text-faint)",
              }}
            >
              {c.label}
            </button>
          ))}
        </div>

        {rows.length === 0 && (
          <div className="px-5 py-8 text-sm text-center" style={{ color: "var(--text-faint)" }}>
            no players match these filters
          </div>
        )}

        {rows.map((row) => (
          <button
            key={`${row.player}-${row[roleKey]}`}
            onClick={() => onSelectPlayer(row.player)}
            className="w-full grid items-center px-5 py-3 text-left transition-colors duration-150 glass-panel-hover"
            style={{
              gridTemplateColumns: `2fr 1fr 0.6fr ${columns.map(() => "1fr").join(" ")}`,
              borderBottom: "1px solid var(--border-soft)",
            }}
          >
            <div style={{ color: "var(--text-primary)" }}>{row.player}</div>
            <div className="text-sm" style={{ color: "var(--text-muted)" }}>{row[roleKey]}</div>
            <div><TierBadge tier={row.tier} size="sm" discipline={discipline} /></div>
            {columns.map((c) => (
              <div key={c.key} className="mono text-sm" style={{ color: "var(--text-muted)" }}>
                {typeof row[c.key] === "number" ? row[c.key].toFixed(2) : "—"}
              </div>
            ))}
          </button>
        ))}
      </div>
    </div>
  );
}
