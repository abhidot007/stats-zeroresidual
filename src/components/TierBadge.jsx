const TIER_COLORS = {
  S: "var(--tier-s)",
  "A+": "var(--tier-a-plus)",
  A: "var(--tier-a)",
  B: "var(--tier-b)",
  C: "var(--tier-c)",
  F: "var(--tier-f)",
};

// Fixed bands, matching src/export/export_web_data.py's BATTING_TIER_BANDS
// / BOWLING_TIER_BANDS exactly — keep these in sync if the cutoffs ever
// change. Batting and bowling get separate scales: both goat scores are
// built the same way, but bowling's distribution is more compressed at
// the top (see export_web_data.py's module docstring), so reusing
// batting's floors made bowling's S tier nearly unreachable and its F
// tier overpopulated. Same tier letter, discipline-specific meaning.
const BATTING_TIER_FLOORS = { S: 80, "A+": 71, A: 64, B: 50, C: 35, F: null };
const BOWLING_TIER_FLOORS = { S: 73, "A+": 63, A: 59, B: 39, C: 26, F: null };

export default function TierBadge({ tier, size = "lg", discipline = "Batting" }) {
  const floors = discipline === "Bowling" ? BOWLING_TIER_FLOORS : BATTING_TIER_FLOORS;

  if (!tier) {
    return (
      <div
        className="mono text-xs px-3 py-1 rounded-full border"
        style={{ borderColor: "var(--border-soft)", color: "var(--text-faint)" }}
        title="Not enough measures eligible for a rated tier"
      >
        unrated
      </div>
    );
  }

  const color = TIER_COLORS[tier] ?? "var(--text-muted)";
  const dims = size === "lg" ? "w-20 h-20 text-4xl" : "w-10 h-10 text-lg";

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={`${dims} rounded-2xl flex items-center justify-center font-bold glass-panel`}
        style={{
          color,
          borderColor: color,
          boxShadow: `0 0 24px 0 ${color}33, inset 0 0 20px 0 ${color}14`,
        }}
        title={floors[tier] != null ? `GOAT Score ${floors[tier]}+` : `GOAT Score below ${floors.C}`}
      >
        {tier}
      </div>
    </div>
  );
}
