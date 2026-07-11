// Pulled directly from the rating system's 44-page design journal — real
// design decisions and real bugs, not marketing copy. Kept short here;
// the full reasoning lives in the journal for anyone who wants more.
export const ENGINE_NOTES = [
  {
    id: "rolling-window",
    category: "baseline methodology",
    title: "Rolling 3-Season Windows, One Hard Wall",
    summary:
      "Every rating is relative to a rolling 3-season baseline, not a fixed era bucket — with exactly one hard boundary the window may never cross.",
    body: `"Decent," for any player, means decent relative to their own role at that
point in IPL history — not the whole 18-season history at once, and not a
handful of hand-drawn eras either.

Fixed eras were tried first and abandoned: each era only had 5-6 seasons
of data, too little for reliable trend detection. The fix was a rolling
3-season window instead — every season's baseline pools three years of
real data, wherever it sits in history.

Only ONE of the original four era boundaries survived as a hard wall the
window may never cross: 2022/2023, the year the Impact Player rule
launched. That's a format mutation — an effective 8th/9th batter — not a
smoothable volume change like the 2022 ten-team expansion was.`,
  },
  {
    id: "wpa-model",
    category: "win probability model",
    title: "XGBoost, Monotonic Constraints, Platt Calibration",
    summary:
      "Win Probability Added bridges every era on one comparable scale — calibrated against each match's own required rate, not a fixed benchmark.",
    body: `Two XGBoost models (1st innings, 2nd innings) predict win probability
ball-by-ball, with monotonic constraints hand-derived from real cricket
logic (e.g. a lost wicket must never INCREASE win probability, holding
other state fixed) — a tree learns non-linear interactions a logistic
baseline can't, without losing that guardrail.

Isotonic regression was tried first for calibration and made things
WORSE (the validation set is only ~90 matches; consecutive balls within
a match are highly correlated, so effective sample size is much smaller
than row count suggests, and isotonic overfit that noise). Platt scaling
— a single-parameter logistic fit — proved far more robust.

Final test-set performance (2024-2026 held out): 1st innings AUC 0.734,
2nd innings AUC 0.888. Both improved via two engineered features:
projected final score and a leak-safe venue par score.`,
  },
  {
    id: "multi-row",
    category: "architecture",
    title: "Why Kohli Gets Two Cards, Not One",
    summary:
      "A player with two genuinely substantial roles gets two independently-computed rows — never one blended, less-honest number.",
    body: `V Kohli's career splits almost evenly: 51.7% of his innings as an
Opener, 42.4% as Middle-order. Forcing that into one row means picking a
label that isn't really true for a third of his career either way.

An earlier attempt blended role-specific weight overrides by innings
share — mathematically defensible, but the result corresponded to
nothing real: a weighted-average "51.7%-Opener/42.4%-Middle-order"
scheme isn't how any single innings was actually played.

The fix was structural, not cosmetic: three career rollups (WPA, true
average/strike rate, Legacy Score) were made role-aware, so a player
with multiple qualifying roles gets one honest row per role. Kohli:
Opener 71.4, Middle-order 60.6 — both real, neither diluting the other.`,
  },
  {
    id: "real-bugs",
    category: "things that were wrong first",
    title: "Three Real Bugs, Caught and Fixed",
    summary:
      "Domain knowledge caught what automated tests didn't — a season-merging bug, a survivorship-bias blind spot, and a recurring eligibility check.",
    body: `Season mislabeling: AB de Villiers's profile showed 18 contributing
seasons against a real 14-season career. Root cause — the COVID-delayed
2020 season (played Sep-Nov 2020, labeled "2020/21" by broadcasters) was
silently merged into 2021's bucket, combining two separate tournaments'
worth of data for every player active in either season. Fixed at the
source, full pipeline re-derived.

Survivorship bias: GJ Maxwell's real stats (141 matches, avg 23.88, SR
155) looked nothing like his system output. His worst stretches were
short enough, individually, to fall under the confidence floor — so his
career rollup never saw them. Fixed by pooling sub-threshold seasons
into one real, z-scoreable "fictitious season" instead of discarding
them — 425 (player, role) groups were affected project-wide.

Eligibility bypass: a generic "N of 5 measures present" check doesn't
guarantee any SPECIFIC required measure is present. Caught once on the
batting side, then independently twice more in separate bowling files —
a reminder that a bug fixed once doesn't protect a similarly-written
file elsewhere.`,
  },
];
