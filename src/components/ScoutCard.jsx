import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LineChart as TrendIcon, Undo2 } from "lucide-react";
import TierBadge from "./TierBadge";
import MeasureRadar from "./MeasureRadar";
import SeasonTrendPanel from "./SeasonTrendPanel";
import { franchiseGlow } from "../lib/franchiseColors";
import { BATTING_AXES, BOWLING_AXES } from "../lib/radarAxes";

function SegmentToggle({ options, active, onChange }) {
  if (options.length <= 1) return null;
  return (
    <div
      className="inline-flex rounded-full p-1 glass-panel"
      style={{ gap: "2px" }}
    >
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className="mono text-xs px-3 py-1.5 rounded-full transition-colors duration-200"
          style={{
            background: opt === active ? "var(--accent-gold)" : "transparent",
            color: opt === active ? "#0a0e17" : "var(--text-muted)",
          }}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

// `signed` metrics are deviations from an era/role baseline (WPA, true
// avg/SR/average/economy/strike rate) — zero-centered, so a "+" prefix and
// emerald/rose coloring make the direction legible at a glance instead of
// forcing a reader to guess whether e.g. "13.38" is good or bad. Legacy
// score and durability are cumulative point totals, not deviations, so
// they stay unsigned and neutrally colored.
function Metric({ label, value, decimals = 2, signed = false }) {
  const hasValue = typeof value === "number" && !Number.isNaN(value);
  const display = hasValue
    ? `${signed && value >= 0 ? "+" : ""}${value.toFixed(decimals)}`
    : "—";
  const colorClass = hasValue && signed ? (value >= 0 ? "text-emerald-400" : "text-rose-400") : "";

  return (
    <div>
      <div
        className={`mono text-base ${colorClass}`}
        style={colorClass ? undefined : { color: "var(--text-primary)" }}
      >
        {display}
      </div>
      <div className="text-xs" style={{ color: "var(--text-faint)" }}>
        {label}
      </div>
    </div>
  );
}

export default function ScoutCard({
  player,
  battingRows = [],
  bowlingRows = [],
  battingSeasonRows = [],
  bowlingSeasonRows = [],
}) {
  const hasBatting = battingRows.length > 0;
  const hasBowling = bowlingRows.length > 0;

  const [discipline, setDiscipline] = useState(hasBatting ? "Batting" : "Bowling");
  const [battingRole, setBattingRole] = useState(battingRows[0]?.role);
  const [bowlerType, setBowlerType] = useState(bowlingRows[0]?.bowler_type);
  const [statMode, setStatMode] = useState("Reality"); // "Myth" | "Reality" — batting only

  // Flip-card reveal for the season-trend chart. `flipPulse` drives a
  // quick rotateY 0->90->0 animation; the face swaps at the 90-degree
  // midpoint (edge-on to the viewer, so the swap itself is invisible),
  // giving the illusion of a two-sided card without needing to maintain
  // two absolutely-positioned faces of possibly different heights.
  const [showTrend, setShowTrend] = useState(false);
  const [flipPulse, setFlipPulse] = useState(false);

  function handleFlip() {
    setFlipPulse(true);
    setTimeout(() => {
      setShowTrend((s) => !s);
      setFlipPulse(false);
    }, 180);
  }

  const activeRow = useMemo(() => {
    if (discipline === "Batting") {
      return battingRows.find((r) => r.role === battingRole) ?? battingRows[0];
    }
    return bowlingRows.find((r) => r.bowler_type === bowlerType) ?? bowlingRows[0];
  }, [discipline, battingRole, bowlerType, battingRows, bowlingRows]);

  if (!activeRow) return null;

  const isBatting = discipline === "Batting";
  const axes = isBatting ? BATTING_AXES : BOWLING_AXES;
  const radarData = axes.map(([key, label]) => ({ axis: label, value: activeRow[key] ?? 0 }));

  const glow = franchiseGlow(activeRow.primary_franchise);
  const goatScore = isBatting ? activeRow.goat_score : activeRow.bowling_goat_score;

  return (
    <div className="relative">
      {glow !== "transparent" && (
        <div
          className="absolute -inset-8 rounded-3xl blur-3xl opacity-20 pointer-events-none"
          style={{ background: glow }}
        />
      )}

      <div className="relative glass-panel rounded-3xl p-7 max-w-md">
        <div className="flex items-start justify-between mb-5 gap-3">
          <div className="min-w-0 pr-2">
            <h2 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
              {player}
            </h2>
            <div className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
              {activeRow.primary_franchise ?? "franchise unknown"}
            </div>
            {isBatting && activeRow.primary_roles && (
              <div className="text-xs mt-0.5" style={{ color: "var(--text-faint)" }}>
                {activeRow.primary_roles}
              </div>
            )}
            {!isBatting && activeRow.bowler_type && (
              <div className="text-xs mt-0.5" style={{ color: "var(--text-faint)" }}>
                {activeRow.bowler_type} bowler
              </div>
            )}
          </div>
          <div className="flex-shrink-0 flex items-center gap-2">
            <button
              onClick={handleFlip}
              title={showTrend ? "back to card" : "season trends"}
              className="p-1.5 rounded-full transition-colors duration-150 glass-panel glass-panel-hover"
              style={{ color: "var(--text-muted)" }}
            >
              {showTrend ? <Undo2 size={14} /> : <TrendIcon size={14} />}
            </button>
            <TierBadge tier={activeRow.tier} discipline={discipline} />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-5">
          {hasBatting && hasBowling && (
            <SegmentToggle
              options={["Batting", "Bowling"]}
              active={discipline}
              onChange={setDiscipline}
            />
          )}
          {isBatting && (
            <SegmentToggle
              options={battingRows.map((r) => r.role)}
              active={battingRole}
              onChange={setBattingRole}
            />
          )}
          {!isBatting && (
            <SegmentToggle
              options={bowlingRows.map((r) => r.bowler_type)}
              active={bowlerType}
              onChange={setBowlerType}
            />
          )}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={`${discipline}-${activeRow.role ?? activeRow.bowler_type}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
          >
            <div style={{ perspective: 1200 }}>
              <motion.div
                animate={{ rotateY: flipPulse ? 90 : 0 }}
                transition={{ duration: 0.18, ease: "easeIn" }}
                style={{ transformStyle: "preserve-3d", backfaceVisibility: "hidden" }}
              >
                {showTrend ? (
                  <div className="flex flex-col" style={{ minHeight: 340 }}>
                    <SeasonTrendPanel
                      key={discipline}
                      seasonRows={isBatting ? battingSeasonRows : bowlingSeasonRows}
                      discipline={discipline}
                      roleKey={isBatting ? "role" : "bowler_type"}
                      activeRoleValue={isBatting ? activeRow.role : activeRow.bowler_type}
                    />
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-5">
                      <div>
                        <div className="mono text-3xl font-semibold" style={{ color: "var(--accent-gold)" }}>
                          {goatScore?.toFixed(1) ?? "—"}
                        </div>
                        <div className="text-xs" style={{ color: "var(--text-faint)" }}>
                          {isBatting ? "GOAT Score (as a batsman)" : "Bowling GOAT Score"}
                        </div>
                      </div>
                      {isBatting && (
                        <SegmentToggle
                          options={["Reality", "Myth"]}
                          active={statMode}
                          onChange={setStatMode}
                        />
                      )}
                    </div>

                    <MeasureRadar data={radarData} height={185} />

                    <div className="grid grid-cols-3 gap-x-3 gap-y-4 mt-5 pt-5" style={{ borderTop: "1px solid var(--border-soft)" }}>
                      {isBatting ? (
                        statMode === "Reality" ? (
                          <>
                            <Metric label="WPA (vs. era baseline)" value={activeRow.overall_z_wpa} signed />
                            <Metric label="true avg (era-adjusted)" value={activeRow.career_true_avg} signed />
                            <Metric label="true SR (era-adjusted)" value={activeRow.career_true_sr} signed />
                            <Metric label="legacy score" value={activeRow.legacy_score} decimals={1} />
                            <Metric label="durability" value={activeRow.durability_points} decimals={1} />
                          </>
                        ) : (
                          <>
                            <Metric label="career average (broadcast)" value={activeRow.myth_average} />
                            <Metric label="strike rate (broadcast)" value={activeRow.myth_strike_rate} />
                            <Metric label="legacy score" value={activeRow.legacy_score} decimals={1} />
                          </>
                        )
                      ) : (
                        <>
                          <Metric label="WPA (vs. era baseline)" value={activeRow.overall_bowler_z_wpa} signed />
                          <Metric label="true average" value={activeRow.career_true_average} signed />
                          <Metric label="true economy" value={activeRow.career_true_economy} signed />
                          <Metric label="true strike rate" value={activeRow.career_true_strike_rate} signed />
                          <Metric label="legacy score" value={activeRow.legacy_score} decimals={1} />
                          <Metric label="durability" value={activeRow.durability_points} decimals={1} />
                        </>
                      )}
                    </div>
                  </>
                )}
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
