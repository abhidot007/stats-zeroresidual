// Shared z-scored axis definitions for radar charts (ScoutCard + Head-to-Head
// comparison). These are already role-relative z-scores, so they're
// comparable across players/roles on the same fixed [-3, 3] domain.
export const BATTING_AXES = [
  ["z_career_wpa", "WPA"],
  ["z_career_true_avg", "True Avg"],
  ["z_career_true_sr", "True SR"],
  ["z_legacy_score", "Legacy"],
  ["z_durability", "Durability"],
];

export const BOWLING_AXES = [
  ["z_bowler_wpa", "WPA"],
  ["z_true_average", "Average"],
  ["z_true_economy", "Economy"],
  ["z_true_strike_rate", "Strike Rate"],
  ["z_legacy_score", "Legacy"],
  ["z_durability", "Durability"],
];
