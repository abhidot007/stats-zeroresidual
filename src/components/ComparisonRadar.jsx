import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
} from "recharts";

/**
 * Two players' z-scored measures plotted on the same radar for a direct
 * visual read of shape, not just the raw numbers in the table below.
 * Same fixed [-3, 3] domain convention as the Scout Card radar so the
 * two views stay visually consistent.
 */
export default function ComparisonRadar({
  data,
  labelA,
  labelB,
  colorA = "var(--accent-gold)",
  colorB = "var(--tier-a)",
  height = 260,
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RadarChart data={data} outerRadius="72%">
        <PolarGrid stroke="var(--border-soft)" />
        <PolarAngleAxis
          dataKey="axis"
          tick={{ fill: "var(--text-muted)", fontSize: 11, fontFamily: "JetBrains Mono, monospace" }}
        />
        <PolarRadiusAxis domain={[-3, 3]} tick={false} axisLine={false} />
        <Radar
          name={labelA}
          dataKey="A"
          stroke={colorA}
          fill={colorA}
          fillOpacity={0.25}
          strokeWidth={2}
          isAnimationActive={true}
        />
        <Radar
          name={labelB}
          dataKey="B"
          stroke={colorB}
          fill={colorB}
          fillOpacity={0.18}
          strokeWidth={2}
          isAnimationActive={true}
        />
        <Legend
          wrapperStyle={{
            fontSize: 11,
            fontFamily: "JetBrains Mono, monospace",
            color: "var(--text-muted)",
            paddingTop: 8,
          }}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
