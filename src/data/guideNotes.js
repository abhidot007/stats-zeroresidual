// Plain-language "how to use this site" content — separate from
// engineNotes.js on purpose. Inspect Engine is for the curious who want
// methodology and real bugs; this is just orientation for a first-time
// visitor, so it stays short and un-collapsed (no click-to-expand).
export const GUIDE_SECTIONS = [
  {
    id: "scout",
    title: "Scout Card (search)",
    body: `Search any IPL player to pull up their card. If they batted and bowled seriously, a Batting/Bowling toggle appears. If they played more than one role (e.g. Opener and Middle-order), a second toggle appears — each role gets its own independently-computed score, never a blended average.

"Reality" vs "Myth" switches the metrics under the radar between era-adjusted "true" numbers (how they compare to their own era's baseline) and the traditional broadcast stats most fans already know.

The tier badge (S / A+ / A / B / C / F) is a fixed grade on the GOAT Score. Batting and bowling have their own cutoffs — bowling's scores don't reach as high as batting's at the top end, so a shared scale would have made bowling's S tier nearly unreachable.`,
  },
  {
    id: "leaderboards",
    title: "Leaderboards",
    body: `Filter by role or bowler type and by tier, and sort any column by clicking its header. "Eligible only" (on by default) hides players who didn't play enough to get a fair grade. Click any row to jump straight to that player's Scout Card.`,
  },
  {
    id: "compare",
    title: "Head-to-Head",
    body: `Pick two players in the same discipline to compare side by side. The table highlights whichever player wins each metric in gold, and the overlapping radar above it gives a shape comparison at a glance — bigger and further out is better on every axis.`,
  },
  {
    id: "engine",
    title: "Inspect Engine",
    body: `The gear icon (bottom-right) is for anyone who wants to go deeper — the actual methodology, real bugs found and fixed, and design decisions behind these numbers, pulled straight from the rating system's own design journal.`,
  },
];
