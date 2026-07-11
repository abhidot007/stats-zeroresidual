import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";

/**
 * data: [{ axis: "WPA", value: 1.23 }, ...] — values must already be
 * z-scores (comparable units across axes). Fixed radius domain [-3, 3]
 * on purpose: z-scores this large are rare, and a FIXED domain means two
 * different players' cards are visually comparable at a glance — an
 * auto-scaled domain would make a modest player's shape look just as
 * "full" as an elite one, which defeats the point of a scout card.
 */
export default function MeasureRadar({ data, color = "var(--accent-gold)", height = 220 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RadarChart data={data} outerRadius="75%">
        <PolarGrid stroke="var(--border-soft)" />
        <PolarAngleAxis
          dataKey="axis"
          tick={{ fill: "var(--text-muted)", fontSize: 11, fontFamily: "JetBrains Mono, monospace" }}
        />
        <PolarRadiusAxis domain={[-3, 3]} tick={false} axisLine={false} />
        <Radar
          dataKey="value"
          stroke={color}
          fill={color}
          fillOpacity={0.28}
          strokeWidth={2}
          isAnimationActive={true}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
