import { useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { BATTING_SEASON_METRICS, BOWLING_SEASON_METRICS } from "../lib/seasonMetrics";

const AXIS_TICK = { fill: "var(--text-faint)", fontSize: 10, fontFamily: "JetBrains Mono, monospace" };

function MetricTab({ active, label, onClick }) {
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
      {label}
    </button>
  );
}

function TrendTooltip({ active, payload, label, labelA, labelB }) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="mono"
      style={{
        background: "#12161f",
        border: "1px solid var(--border-soft)",
        borderRadius: 8,
        padding: "8px 10px",
        fontSize: 11,
      }}
    >
      <div style={{ color: "var(--text-muted)", marginBottom: 4 }}>{label}</div>
      {payload.map((p) => (
        <div key={p.dataKey} style={{ color: p.stroke }}>
          {p.dataKey === "A" ? labelA : labelB}: {typeof p.value === "number" ? p.value.toFixed(2) : "—"}
        </div>
      ))}
    </div>
  );
}

/**
 * Season-by-season comparison for Head-to-Head — unlike the Scout Card's
 * flip panel (one player, several measures overlaid on normalized scales),
 * here it's one measure at a time shared by both players on a real axis,
 * since same-metric-same-units means an honest shared scale is actually
 * meaningful (no normalization trickery needed).
 */
export default function HeadToHeadSeasonTrend({
  seasonRowsA,
  seasonRowsB,
  discipline,
  roleKey,
  roleValueA,
  roleValueB,
  labelA,
  labelB,
}) {
  const isBatting = discipline === "Batting";
  const metrics = isBatting ? BATTING_SEASON_METRICS : BOWLING_SEASON_METRICS;
  const [metricKey, setMetricKey] = useState(metrics[0].key);
  const metric = metrics.find((m) => m.key === metricKey) ?? metrics[0];

  const filteredA = useMemo(
    () => seasonRowsA.filter((r) => r[roleKey] === roleValueA),
    [seasonRowsA, roleKey, roleValueA]
  );
  const filteredB = useMemo(
    () => seasonRowsB.filter((r) => r[roleKey] === roleValueB),
    [seasonRowsB, roleKey, roleValueB]
  );

  const data = useMemo(() => {
    const years = new Set([
      ...filteredA.map((r) => r.season_year),
      ...filteredB.map((r) => r.season_year),
    ]);
    const byYearA = new Map(filteredA.map((r) => [r.season_year, r]));
    const byYearB = new Map(filteredB.map((r) => [r.season_year, r]));
    return Array.from(years)
      .sort((a, b) => a - b)
      .map((year) => ({
        season: year,
        A: byYearA.has(year) ? metric.compute(byYearA.get(year)) : null,
        B: byYearB.has(year) ? metric.compute(byYearB.get(year)) : null,
      }));
  }, [filteredA, filteredB, metric]);

  // Whether the CURRENTLY SELECTED metric has enough overlapping data to
  // draw a trend — but this must never hide the tab row itself, or
  // switching to a metric with sparse data (e.g. a newer field like
  // true_avg that isn't backfilled for every season yet) would trap the
  // viewer with no way to switch back to one that does have data.
  const hasEnoughData = data.filter((d) => d.A != null || d.B != null).length >= 2;

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-4">
        {metrics.map((m) => (
          <MetricTab
            key={m.key}
            active={m.key === metricKey}
            label={m.label}
            onClick={() => setMetricKey(m.key)}
          />
        ))}
      </div>
      {hasEnoughData ? (
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={data} margin={{ top: 4, right: 4, left: -8, bottom: 0 }}>
            <CartesianGrid stroke="var(--border-soft)" vertical={false} />
            <XAxis
              dataKey="season"
              tick={AXIS_TICK}
              axisLine={{ stroke: "var(--border-soft)" }}
              tickLine={false}
            />
            <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} width={40} />
            <Tooltip content={<TrendTooltip labelA={labelA} labelB={labelB} />} />
            <Legend
              wrapperStyle={{
                fontSize: 11,
                fontFamily: "JetBrains Mono, monospace",
                color: "var(--text-muted)",
                paddingTop: 8,
              }}
            />
            <Line
              type="monotone"
              dataKey="A"
              name={labelA}
              stroke="var(--accent-gold)"
              strokeWidth={2}
              dot={{ r: 2 }}
              connectNulls
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="B"
              name={labelB}
              stroke="var(--tier-a)"
              strokeWidth={2}
              dot={{ r: 2 }}
              connectNulls
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <div className="mono text-xs text-center py-16" style={{ color: "var(--text-faint)" }}>
          not enough data for this measure yet
        </div>
      )}
    </div>
  );
}
