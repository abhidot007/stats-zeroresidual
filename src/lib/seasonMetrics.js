// Shared season-level metric definitions — used by both the Scout Card's
// flip-to-graph panel (single player, multiple measures overlaid) and
// Head-to-Head's season comparison (two players, one measure at a time).
// Keeping this in one place means both views agree on what "average" or
// "WPA (z)" means for a given season row, and pick up new season fields
// (e.g. if the pipeline export adds one) in exactly one spot.

// Batting's season file has raw box-score counting stats, so average and
// strike rate are derived here. `true_avg`/`true_sr` are joined in from
// real_ipl_statcards_v2.csv (rate_batters.py's actual per-(player, role,
// season) output) — the same era-adjusted residual the career-level
// career_true_avg/career_true_sr figures roll up from, just not yet
// aggregated across seasons. `season_z_wpa` is joined in from the rating
// pipeline's per-(player, role, season) pool z-score (see
// export_web_data.py) — same z-scoring convention as the career
// overall_z_wpa figure shown on the front of the Scout Card, just not
// aggregated across seasons.
export const BATTING_SEASON_METRICS = [
  {
    key: "avg",
    label: "Average",
    color: "var(--accent-gold)",
    compute: (r) => (r.dismissals > 0 ? r.runs / r.dismissals : null),
  },
  {
    key: "sr",
    label: "Strike Rate",
    color: "var(--tier-a)",
    compute: (r) => (r.balls_faced > 0 ? (r.runs / r.balls_faced) * 100 : null),
  },
  {
    key: "true_avg",
    label: "True Avg",
    color: "var(--tier-s)",
    compute: (r) => (typeof r.true_avg === "number" ? r.true_avg : null),
  },
  {
    key: "true_sr",
    label: "True SR",
    color: "var(--tier-b)",
    compute: (r) => (typeof r.true_sr === "number" ? r.true_sr : null),
  },
  {
    key: "wpa",
    label: "WPA (z)",
    color: "var(--tier-a-plus)",
    compute: (r) => (typeof r.season_z_wpa === "number" ? r.season_z_wpa : null),
  },
];

// Bowling's season file already carries true_average/true_economy/
// true_strike_rate per season (era-adjusted, same fields the Scout Card
// shows at career level) — used directly rather than re-derived.
export const BOWLING_SEASON_METRICS = [
  {
    key: "true_avg",
    label: "True Avg",
    color: "var(--accent-gold)",
    compute: (r) => (typeof r.true_average === "number" ? r.true_average : null),
  },
  {
    key: "true_econ",
    label: "True Economy",
    color: "var(--tier-a)",
    compute: (r) => (typeof r.true_economy === "number" ? r.true_economy : null),
  },
  {
    key: "true_sr",
    label: "True SR",
    color: "var(--tier-c)",
    compute: (r) => (typeof r.true_strike_rate === "number" ? r.true_strike_rate : null),
  },
  {
    key: "wpa",
    label: "WPA (z)",
    color: "var(--tier-a-plus)",
    compute: (r) => (typeof r.season_z_wpa === "number" ? r.season_z_wpa : null),
  },
];
