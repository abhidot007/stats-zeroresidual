// Real IPL franchise colors — used for the subtle glow behind a Scout
// Card, so a fan recognizes the team instantly without reading text.
// Deliberately a SMALL, curated map: only current/well-known franchises.
// Anything unmapped just gets no glow rather than a wrong-colored one.
export const FRANCHISE_COLORS = {
  "Chennai Super Kings": "#f7c948",
  "Mumbai Indians": "#3a6ec4",
  "Royal Challengers Bangalore": "#c23b3b",
  "Royal Challengers Bengaluru": "#c23b3b",
  "Kolkata Knight Riders": "#7d4bb0",
  "Delhi Capitals": "#3a7fc4",
  "Delhi Daredevils": "#3a7fc4",
  "Punjab Kings": "#c4443a",
  "Kings XI Punjab": "#c4443a",
  "Rajasthan Royals": "#d84f9c",
  "Sunrisers Hyderabad": "#e8792a",
  "Gujarat Titans": "#1a3d5c",
  "Lucknow Super Giants": "#2ba0a0",
  "Deccan Chargers": "#3a4a8f",
  "Pune Warriors": "#4a1a5c",
  "Gujarat Lions": "#e85a2a",
  "Rising Pune Supergiant": "#8f2a3a",
  "Rising Pune Supergiants": "#8f2a3a",
};

export function franchiseGlow(name) {
  const color = FRANCHISE_COLORS[name];
  if (!color) return "transparent";
  return color;
}
