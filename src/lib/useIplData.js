import { useEffect, useState } from "react";

/**
 * Loads the exported leaderboard JSON once and groups it by player name.
 *
 * Batting is genuinely multi-row per player (the rating pipeline's
 * multi-row redesign — a player with two substantial roles, e.g. Kohli
 * as Opener AND Middle-order, gets two independently-computed rows, not
 * one blended average). Bowling is effectively single-row per player in
 * practice (a player bowling both Pace and Spin at a substantial volume
 * is vanishingly rare), but is still grouped into an array for the same
 * uniform shape — the Scout Card doesn't need to special-case either.
 */
export function useIplData() {
  const [state, setState] = useState({
    loading: true,
    error: null,
    batting: [],
    bowling: [],
    battingByPlayer: new Map(),
    bowlingByPlayer: new Map(),
    battingSeasonByPlayer: new Map(),
    bowlingSeasonByPlayer: new Map(),
    meta: null,
    allNames: [],
  });

  useEffect(() => {
    let cancelled = false;

    function groupBy(rows, keyFn) {
      const map = new Map();
      for (const row of rows) {
        const key = keyFn(row);
        if (!map.has(key)) map.set(key, []);
        map.get(key).push(row);
      }
      return map;
    }

    async function load() {
      try {
        const base = import.meta.env.BASE_URL;
        // Season-by-season files back the career-trajectory chart on the
        // Scout Card. They're best-effort: older exports of this pipeline
        // may not have them yet, so a 404 here degrades to an empty trend
        // (chart just doesn't render) rather than breaking the whole page.
        const fetchOptional = (path) =>
          fetch(`${base}${path}`)
            .then((r) => (r.ok ? r.json() : []))
            .catch(() => []);

        const [batting, bowling, meta, battingSeason, bowlingSeason] = await Promise.all([
          fetch(`${base}data/batting_leaderboard.json`).then((r) => r.json()),
          fetch(`${base}data/bowling_leaderboard.json`).then((r) => r.json()),
          fetch(`${base}data/meta.json`).then((r) => r.json()),
          fetchOptional("data/batting_by_season.json"),
          fetchOptional("data/bowling_by_season.json"),
        ]);

        const battingByPlayer = groupBy(batting, (r) => r.player);
        const bowlingByPlayer = groupBy(bowling, (r) => r.player);
        const battingSeasonByPlayer = groupBy(battingSeason, (r) => r.player);
        const bowlingSeasonByPlayer = groupBy(bowlingSeason, (r) => r.player);

        const allNames = Array.from(
          new Set([...battingByPlayer.keys(), ...bowlingByPlayer.keys()])
        ).sort();

        if (!cancelled) {
          setState({
            loading: false,
            error: null,
            batting,
            bowling,
            battingByPlayer,
            bowlingByPlayer,
            battingSeasonByPlayer,
            bowlingSeasonByPlayer,
            meta,
            allNames,
          });
        }
      } catch (err) {
        if (!cancelled) {
          setState((s) => ({ ...s, loading: false, error: String(err) }));
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
