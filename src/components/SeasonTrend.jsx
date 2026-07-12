import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const AXIS_TICK = { fill: "var(--text-faint)", fontSize: 10, fontFamily: "JetBrains Mono, monospace" };

/**
 * Career-trajectory mini-chart for the Scout Card, built from the
 * season-by-season export files (previously fetched but never rendered
 * anywhere). Batting only has raw box-score counting stats per season
 * (runs/dismissals/balls_faced), so average and strike rate are derived
 * here rather than era-adjusted; bowling's season file already carries
 * true_average/true_economy per season, so those are used directly for
 * consistency with the rest of the card's era-adjusted framing.
 *
 * Two lines share one chart on independent axes (gold = primary metric,
 * blue = secondary) since the two units don't share a sensible scale.
 */
export default function SeasonTrend({ seasonRows, discipline, roleKey, activeRoleValue }) {
  const isBatting = discipline === "Batting";

  const filtered = seasonRows
    .filter((r) => r[roleKey] === activeRoleValue)
    .sort((a, b) => a.season_year - b.season_year);

  // A single point isn't a trajectory — only render once there's an
  // actual arc to show.
  if (filtered.length < 2) return null;

  const data = filtered.map((r) => {
    if (isBatting) {
      return {
        season: r.season_year,
        primary: r.dismissals > 0 ? Number((r.runs / r.dismissals).toFixed(1)) : null,
        secondary: r.balls_faced > 0 ? Number(((r.runs / r.balls_faced) * 100).toFixed(1)) : null,
      };
    }
    return {
      season: r.season_year,
      primary: typeof r.true_economy === "number" ? Number(r.true_economy.toFixed(2)) : null,
      secondary: typeof r.true_average === "number" ? Number(r.true_average.toFixed(2)) : null,
    };
  });

  const primaryLabel = isBatting ? "average" : "true economy";
  const secondaryLabel = isBatting ? "strike rate" : "true average";

  return (
    <div className="mt-5 pt-5" style={{ borderTop: "1px solid var(--border-soft)" }}>
      <div className="mono text-xs mb-2" style={{ color: "var(--text-faint)" }}>
        career trajectory ·{" "}
        <span style={{ color: "var(--accent-gold)" }}>{primaryLabel}</span> vs{" "}
        <span style={{ color: "var(--tier-a)" }}>{secondaryLabel}</span>, by season
      </div>
      <ResponsiveContainer width="100%" height={140}>
        <LineChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <CartesianGrid stroke="var(--border-soft)" vertical={false} />
          <XAxis
            dataKey="season"
            tick={AXIS_TICK}
            axisLine={{ stroke: "var(--border-soft)" }}
            tickLine={false}
          />
          <YAxis yAxisId="left" tick={AXIS_TICK} axisLine={false} tickLine={false} width={30} />
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={AXIS_TICK}
            axisLine={false}
            tickLine={false}
            width={30}
          />
          <Tooltip
            contentStyle={{
              background: "#12161f",
              border: "1px solid var(--border-soft)",
              borderRadius: 8,
              fontSize: 11,
              fontFamily: "JetBrains Mono, monospace",
            }}
            labelStyle={{ color: "var(--text-muted)" }}
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="primary"
            name={primaryLabel}
            stroke="var(--accent-gold)"
            strokeWidth={2}
            dot={{ r: 2 }}
            connectNulls
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="secondary"
            name={secondaryLabel}
            stroke="var(--tier-a)"
            strokeWidth={2}
            dot={{ r: 2 }}
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
