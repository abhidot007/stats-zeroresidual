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
    meta: null,
    allNames: [],
  });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const base = import.meta.env.BASE_URL;
        const [batting, bowling, meta] = await Promise.all([
          fetch(`${base}data/batting_leaderboard.json`).then((r) => r.json()),
          fetch(`${base}data/bowling_leaderboard.json`).then((r) => r.json()),
          fetch(`${base}data/meta.json`).then((r) => r.json()),
        ]);

        const battingByPlayer = new Map();
        for (const row of batting) {
          if (!battingByPlayer.has(row.player)) battingByPlayer.set(row.player, []);
          battingByPlayer.get(row.player).push(row);
        }

        const bowlingByPlayer = new Map();
        for (const row of bowling) {
          if (!bowlingByPlayer.has(row.player)) bowlingByPlayer.set(row.player, []);
          bowlingByPlayer.get(row.player).push(row);
        }

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
