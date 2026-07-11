import { useState, useMemo } from "react";
import PlayerSearch from "./PlayerSearch";
import TierBadge from "./TierBadge";
import ComparisonRadar from "./ComparisonRadar";
import { BATTING_AXES, BOWLING_AXES } from "../lib/radarAxes";

// `signed` metrics are era-adjusted deviations (zero-centered — positive
// means better than baseline, negative means worse), so they get a "+"
// prefix and emerald/rose semantic coloring when they're NOT the gold
// winner of the row. GOAT Score, Pure Talent, Legacy Score, and
// Durability are cumulative point totals, not deviations, so they stay
// exactly as they are in the dataset — plain formatting, gold only when
// they win the row.
const BATTING_METRICS = [
  { key: "goat_score", label: "GOAT Score" },
  { key: "overall_z_wpa", label: "WPA (vs. era baseline)", signed: true },
  { key: "career_true_avg", label: "True Avg (era-adjusted)", signed: true },
  { key: "career_true_sr", label: "True SR (era-adjusted)", signed: true },
  { key: "raw_batting_talent", label: "Pure Talent" },
  { key: "legacy_score", label: "Legacy Score" },
  { key: "durability_points", label: "Durability" },
];

const BOWLING_METRICS = [
  { key: "bowling_goat_score", label: "GOAT Score" },
  { key: "overall_bowler_z_wpa", label: "WPA (vs. era baseline)", signed: true },
  { key: "career_true_average", label: "True Average", signed: true },
  { key: "career_true_economy", label: "True Economy", signed: true },
  { key: "career_true_strike_rate", label: "True Strike Rate", signed: true },
  { key: "raw_bowling_talent", label: "Pure Talent" },
  { key: "legacy_score", label: "Legacy Score" },
  { key: "durability_points", label: "Durability" },
];

// Winner cell: always gold, regardless of sign (still gets the "+"
// prefix if positive and signed). Runner-up cell on a signed metric:
// emerald if positive, rose if negative, neutral muted otherwise.
// Unsigned metrics never get the sign prefix or emerald/rose treatment.
function ValueCell({ value, isWinner, signed, align = "left" }) {
  const hasValue = typeof value === "number" && !Number.isNaN(value);
  const alignClass = align === "right" ? "text-right" : "";

  if (!hasValue) {
    return (
      <div className={`mono text-lg ${alignClass}`} style={{ color: "var(--text-muted)" }}>
        —
      </div>
    );
  }

  const text = signed ? `${value > 0 ? "+" : ""}${value.toFixed(2)}` : value.toFixed(2);

  if (isWinner) {
    return (
      <div className={`mono text-lg ${alignClass}`} style={{ color: "var(--accent-gold)" }}>
        {text}
      </div>
    );
  }

  if (signed && value > 0) {
    return <div className={`mono text-lg text-emerald-400 ${alignClass}`}>{text}</div>;
  }
  if (signed && value < 0) {
    return <div className={`mono text-lg text-rose-400 ${alignClass}`}>{text}</div>;
  }

  return (
    <div className={`mono text-lg ${alignClass}`} style={{ color: "var(--text-muted)" }}>
      {text}
    </div>
  );
}

function RoleSubToggle({ rows, roleKey, active, onChange }) {
  if (rows.length <= 1) return null;
  return (
    <div className="flex gap-2 mt-2">
      {rows.map((r) => (
        <button
          key={r[roleKey]}
          onClick={() => onChange(r[roleKey])}
          className="mono text-xs px-2 py-1 rounded-full transition-colors duration-150"
          style={{
            background: r[roleKey] === active ? "var(--accent-gold)" : "transparent",
            color: r[roleKey] === active ? "#0a0e17" : "var(--text-faint)",
            border: `1px solid ${r[roleKey] === active ? "var(--accent-gold)" : "var(--border-soft)"}`,
          }}
        >
          {r[roleKey]}
        </button>
      ))}
    </div>
  );
}

function PlayerSlot({ label, allNames, name, setName, rows, roleKey, activeRole, setActiveRole }) {
  return (
    <div className="flex-1 min-w-[240px]">
      <div className="mono text-xs mb-2" style={{ color: "var(--text-faint)" }}>
        {label}
      </div>
      <PlayerSearch names={allNames} onSelect={setName} />
      {name && (
        <div className="mt-3">
          <div className="text-lg font-medium" style={{ color: "var(--text-primary)" }}>
            {name}
          </div>
          {rows.length === 0 && (
            <div className="text-xs mt-1" style={{ color: "var(--tier-f)" }}>
              no data for this discipline
            </div>
          )}
          <RoleSubToggle rows={rows} roleKey={roleKey} active={activeRole} onChange={setActiveRole} />
        </div>
      )}
    </div>
  );
}

export default function HeadToHead({ allNames, battingByPlayer, bowlingByPlayer }) {
  const [discipline, setDiscipline] = useState("Batting");
  const [nameA, setNameA] = useState(null);
  const [nameB, setNameB] = useState(null);
  const [roleA, setRoleA] = useState(null);
  const [roleB, setRoleB] = useState(null);

  const isBatting = discipline === "Batting";
  const byPlayer = isBatting ? battingByPlayer : bowlingByPlayer;
  const roleKey = isBatting ? "role" : "bowler_type";
  const metrics = isBatting ? BATTING_METRICS : BOWLING_METRICS;

  const rowsA = nameA ? byPlayer.get(nameA) ?? [] : [];
  const rowsB = nameB ? byPlayer.get(nameB) ?? [] : [];

  const activeRowA = useMemo(
    () => rowsA.find((r) => r[roleKey] === roleA) ?? rowsA[0],
    [rowsA, roleA, roleKey]
  );
  const activeRowB = useMemo(
    () => rowsB.find((r) => r[roleKey] === roleB) ?? rowsB[0],
    [rowsB, roleB, roleKey]
  );

  const axes = isBatting ? BATTING_AXES : BOWLING_AXES;

  const radarData = useMemo(() => {
    if (!activeRowA || !activeRowB) return [];
    return axes.map(([key, label]) => ({
      axis: label,
      A: activeRowA[key] ?? 0,
      B: activeRowB[key] ?? 0,
    }));
  }, [axes, activeRowA, activeRowB]);

  function winner(metricKey) {
    const a = activeRowA?.[metricKey];
    const b = activeRowB?.[metricKey];
    if (typeof a !== "number" || typeof b !== "number") return null;
    if (Math.abs(a - b) < 1e-9) return "tie";
    return a > b ? "A" : "B"; // higher is better for every metric exported here
  }

  return (
    <div className="w-full max-w-3xl">
      <div className="flex gap-2 mb-6">
        {["Batting", "Bowling"].map((d) => (
          <button
            key={d}
            onClick={() => {
              setDiscipline(d);
              setRoleA(null);
              setRoleB(null);
            }}
            className="mono text-xs px-4 py-2 rounded-full transition-colors duration-150"
            style={{
              background: discipline === d ? "var(--accent-gold)" : "var(--bg-panel)",
              border: `1px solid ${discipline === d ? "var(--accent-gold)" : "var(--border-soft)"}`,
              color: discipline === d ? "#0a0e17" : "var(--text-muted)",
            }}
          >
            compare as {d.toLowerCase()}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-8 mb-8">
        <PlayerSlot
          label="player a"
          allNames={allNames}
          name={nameA}
          setName={(n) => {
            setNameA(n);
            setRoleA(null);
          }}
          rows={rowsA}
          roleKey={roleKey}
          activeRole={activeRowA?.[roleKey]}
          setActiveRole={setRoleA}
        />
        <PlayerSlot
          label="player b"
          allNames={allNames}
          name={nameB}
          setName={(n) => {
            setNameB(n);
            setRoleB(null);
          }}
          rows={rowsB}
          roleKey={roleKey}
          activeRole={activeRowB?.[roleKey]}
          setActiveRole={setRoleB}
        />
      </div>

      {activeRowA && activeRowB && (
        <div className="glass-panel rounded-2xl p-6 mb-6">
          <div className="mono text-xs mb-2" style={{ color: "var(--text-faint)" }}>
            shape comparison · z-scored measures, same [-3, 3] scale as the scout card
          </div>
          <ComparisonRadar data={radarData} labelA={nameA} labelB={nameB} />
        </div>
      )}

      {activeRowA && activeRowB && (
        <div className="glass-panel rounded-2xl overflow-hidden">
          <div
            className="grid px-6 py-4"
            style={{ gridTemplateColumns: "1fr 2fr 1fr", borderBottom: "1px solid var(--border-soft)" }}
          >
            <div className="flex justify-start"><TierBadge tier={activeRowA.tier} size="sm" discipline={discipline} /></div>
            <div className="text-center mono text-xs" style={{ color: "var(--text-faint)" }}>
              metric
            </div>
            <div className="flex justify-end"><TierBadge tier={activeRowB.tier} size="sm" discipline={discipline} /></div>
          </div>

          {metrics.map((m) => {
            const w = winner(m.key);
            const av = activeRowA[m.key];
            const bv = activeRowB[m.key];
            return (
              <div
                key={m.key}
                className="grid items-center px-6 py-4"
                style={{ gridTemplateColumns: "1fr 2fr 1fr", borderBottom: "1px solid var(--border-soft)" }}
              >
                <ValueCell value={av} isWinner={w === "A"} signed={m.signed} />
                <div className="text-center text-xs" style={{ color: "var(--text-faint)" }}>
                  {m.label}
                </div>
                <ValueCell value={bv} isWinner={w === "B"} signed={m.signed} align="right" />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
