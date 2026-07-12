import { useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  YAxis,
} from "recharts";
import { BATTING_SEASON_METRICS, BOWLING_SEASON_METRICS } from "../lib/seasonMetrics";

const AXIS_TICK = { fill: "var(--text-faint)", fontSize: 10, fontFamily: "JetBrains Mono, monospace" };

function MetricChip({ active, color, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="mono text-xs px-2.5 py-1 rounded-full transition-colors duration-150 flex items-center gap-1.5"
      style={{
        background: active ? `${color}22` : "transparent",
        border: `1px solid ${active ? color : "var(--border-soft)"}`,
        color: active ? color : "var(--text-faint)",
      }}
    >
      <span
        className="inline-block rounded-full"
        style={{ width: 6, height: 6, background: active ? color : "var(--text-faint)" }}
      />
      {label}
    </button>
  );
}

function SeasonTooltip({ active, payload, label, metrics }) {
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
      {payload.map((p) => {
        const metric = metrics.find((m) => m.key === p.dataKey);
        const raw = p.payload[`${p.dataKey}_raw`];
        return (
          <div key={p.dataKey} style={{ color: p.stroke }}>
            {metric?.label}: {typeof raw === "number" ? raw.toFixed(2) : "—"}
          </div>
        );
      })}
    </div>
  );
}

/**
 * Back-of-card view revealed by the Scout Card's flip button. Lets the
 * viewer toggle which season-level measures overlay on one chart instead
 * of committing to one fixed pairing — each metric is normalized to its
 * own min–max range for the overlay (units differ too much to share a raw
 * axis: average is ~10-50, true economy deviations are ~-5 to 5, WPA z is
 * ~-3 to 3), with the tooltip always showing the real, non-normalized value.
 */
export default function SeasonTrendPanel({ seasonRows, discipline, roleKey, activeRoleValue }) {
  const isBatting = discipline === "Batting";
  const metrics = isBatting ? BATTING_SEASON_METRICS : BOWLING_SEASON_METRICS;

  const [activeKeys, setActiveKeys] = useState(() => new Set([metrics[0].key, metrics[metrics.length - 1].key]));

  function toggleMetric(key) {
    setActiveKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        if (next.size === 1) return prev; // keep at least one metric plotted
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }

  const filtered = useMemo(
    () =>
      seasonRows
        .filter((r) => r[roleKey] === activeRoleValue)
        .sort((a, b) => a.season_year - b.season_year),
    [seasonRows, roleKey, activeRoleValue]
  );

  const { data, ranges } = useMemo(() => {
    const raws = filtered.map((r) => {
      const point = { season: r.season_year };
      for (const m of metrics) point[`${m.key}_raw`] = m.compute(r);
      return point;
    });

    const ranges = {};
    for (const m of metrics) {
      const values = raws.map((p) => p[`${m.key}_raw`]).filter((v) => typeof v === "number");
      ranges[m.key] = values.length ? { min: Math.min(...values), max: Math.max(...values) } : null;
    }

    const data = raws.map((point) => {
      const normalized = { season: point.season };
      for (const m of metrics) {
        const raw = point[`${m.key}_raw`];
        normalized[`${m.key}_raw`] = raw;
        const range = ranges[m.key];
        if (raw == null || !range) {
          normalized[m.key] = null;
        } else if (range.max === range.min) {
          normalized[m.key] = 0.5;
        } else {
          normalized[m.key] = (raw - range.min) / (range.max - range.min);
        }
      }
      return normalized;
    });

    return { data, ranges };
  }, [filtered, metrics]);

  if (filtered.length < 2) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="mono text-xs text-center" style={{ color: "var(--text-faint)" }}>
          not enough seasons of data for a trend yet
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      <div className="mono text-xs mb-3" style={{ color: "var(--text-faint)" }}>
        career trajectory · toggle measures to overlay, by season
      </div>
      <div className="flex flex-wrap gap-2 mb-4">
        {metrics.map((m) => (
          <MetricChip
            key={m.key}
            active={activeKeys.has(m.key)}
            color={m.color}
            label={m.label}
            onClick={() => toggleMetric(m.key)}
          />
        ))}
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={data} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
          <CartesianGrid stroke="var(--border-soft)" vertical={false} />
          <XAxis
            dataKey="season"
            tick={AXIS_TICK}
            axisLine={{ stroke: "var(--border-soft)" }}
            tickLine={false}
          />
          <YAxis domain={[0, 1]} hide />
          <Tooltip content={<SeasonTooltip metrics={metrics} />} />
          {metrics
            .filter((m) => activeKeys.has(m.key))
            .map((m) => (
              <Line
                key={m.key}
                type="monotone"
                dataKey={m.key}
                name={m.label}
                stroke={m.color}
                strokeWidth={2}
                dot={{ r: 2 }}
                connectNulls
                isAnimationActive={false}
              />
            ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
