import { useState } from "react";
import { useIplData } from "./lib/useIplData";
import { getUrlParams, updateUrlParams } from "./lib/urlState";
import Nav from "./components/Nav";
import PlayerSearch from "./components/PlayerSearch";
import ScoutCard from "./components/ScoutCard";
import Leaderboard from "./components/Leaderboard";
import HeadToHead from "./components/HeadToHead";
import InspectEngine from "./components/InspectEngine";
import UserGuide from "./components/UserGuide";
import CopyLinkButton from "./components/CopyLinkButton";

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
    battingSeasonByPlayer,
    bowlingSeasonByPlayer,
    meta,
    allNames,
  } = useIplData();
  const initialParams = getUrlParams();
  const [activePlayer, setActivePlayerState] = useState(initialParams.get("player") || null);
  const [view, setViewState] = useState(initialParams.get("view") || "search");

  // Every navigation action funnels through these three setters, each of
  // which also mirrors the change into the URL — so at any point the
  // address bar is a valid, shareable link to exactly what's on screen.
  function setView(next) {
    setViewState(next);
    updateUrlParams({ view: next === "search" ? null : next });
  }

  function setActivePlayer(name) {
    setActivePlayerState(name);
    updateUrlParams({ player: name || null });
  }

  function goToPlayer(name) {
    setActivePlayerState(name);
    setViewState("search");
    updateUrlParams({ player: name || null, view: null });
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
    <div className="min-h-screen px-4 sm:px-6 py-10 sm:py-16">
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
              <div className="w-full max-w-md">
                <div className="flex justify-end mb-3">
                  <CopyLinkButton label="copy link to this card" />
                </div>
                <ScoutCard
                  player={activePlayer}
                  battingRows={battingByPlayer.get(activePlayer) ?? []}
                  bowlingRows={bowlingByPlayer.get(activePlayer) ?? []}
                  battingSeasonRows={battingSeasonByPlayer.get(activePlayer) ?? []}
                  bowlingSeasonRows={bowlingSeasonByPlayer.get(activePlayer) ?? []}
                />
              </div>
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
              battingSeasonByPlayer={battingSeasonByPlayer}
              bowlingSeasonByPlayer={bowlingSeasonByPlayer}
            />
          )}
        </div>
      )}

      <InspectEngine />
      <UserGuide />
    </div>
  );
}
