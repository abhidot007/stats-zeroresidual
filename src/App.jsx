import { useState } from "react";
import { useIplData } from "./lib/useIplData";
import Nav from "./components/Nav";
import PlayerSearch from "./components/PlayerSearch";
import ScoutCard from "./components/ScoutCard";
import Leaderboard from "./components/Leaderboard";
import HeadToHead from "./components/HeadToHead";
import InspectEngine from "./components/InspectEngine";
import UserGuide from "./components/UserGuide";

function SiteHeader({ meta, align = "center" }) {
  return (
    <header className={align === "left" ? "mb-8" : "text-center mb-8 max-w-xl"}>
      <div className="mono text-xs tracking-widest mb-3" style={{ color: "var(--text-faint)" }}>
        STATS.ZERORESIDUAL.DEV
      </div>
      <h1 className="text-3xl font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
        The IPL Rating Engine
      </h1>
      <p className="text-sm" style={{ color: "var(--text-muted)" }}>
        Era-adjusted, role-relative batting and bowling ratings — built from raw
        ball-by-ball data, not broadcast stats.
        {meta && (
          <>
            {" "}
            Coverage: {meta.season_range?.[0]}–{meta.season_range?.[1]}.
          </>
        )}
      </p>
      <a
        href="https://zeroresidual.dev"
        target="_blank"
        rel="noopener noreferrer"
        className="mono text-xs mt-4 inline-block transition-colors duration-150"
        style={{ color: "var(--text-faint)" }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent-gold)")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-faint)")}
      >
        an engineering project by Abhi ↗
      </a>
    </header>
  );
}

export default function App() {
  const {
    loading,
    error,
    batting,
    bowling,
    battingByPlayer,
    bowlingByPlayer,
    meta,
    allNames,
  } = useIplData();
  const [activePlayer, setActivePlayer] = useState(null);
  const [view, setView] = useState("search");

  function goToPlayer(name) {
    setActivePlayer(name);
    setView("search");
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="mono text-sm" style={{ color: "var(--text-faint)" }}>
          loading ratings…
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="mono text-sm" style={{ color: "var(--tier-f)" }}>
          couldn't load data: {error}
        </div>
      </div>
    );
  }

  const isSearch = view === "search";

  return (
    <div className="min-h-screen px-6 py-16">
      {isSearch ? (
        <div className="max-w-6xl mx-auto grid lg:grid-cols-[minmax(0,380px)_1fr] gap-x-16 gap-y-10 items-start">
          <div className="lg:sticky lg:top-16 flex flex-col items-center lg:items-start text-center lg:text-left">
            <SiteHeader meta={meta} align="left" />
            <Nav view={view} onChange={setView} />
            <div className="mt-8 w-full flex justify-center lg:justify-start">
              <PlayerSearch names={allNames} onSelect={setActivePlayer} />
            </div>
            {!activePlayer && (
              <div className="text-sm mt-6" style={{ color: "var(--text-faint)" }}>
                search a player above — try "AB de Villiers" or "V Kohli"
              </div>
            )}
          </div>

          <div className="flex justify-center lg:justify-start lg:pt-2" style={{ paddingLeft: "10px" }}>
            {activePlayer && (
              <ScoutCard
                player={activePlayer}
                battingRows={battingByPlayer.get(activePlayer) ?? []}
                bowlingRows={bowlingByPlayer.get(activePlayer) ?? []}
              />
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <SiteHeader meta={meta} align="center" />
          <Nav view={view} onChange={setView} />

          {view === "leaderboard" && (
            <Leaderboard batting={batting} bowling={bowling} onSelectPlayer={goToPlayer} />
          )}

          {view === "compare" && (
            <HeadToHead
              allNames={allNames}
              battingByPlayer={battingByPlayer}
              bowlingByPlayer={bowlingByPlayer}
            />
          )}
        </div>
      )}

      <InspectEngine />
      <UserGuide />
    </div>
  );
}
