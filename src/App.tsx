import { useState } from "react";
import { PragueTimeFootnote } from "./PragueTimeFootnote";
import { AboutPage } from "./AboutPage";
import { ClockFace } from "./clock/ClockFace";
import { useScrubbableTime } from "./clock/useScrubbableTime";
import { getPragueDateParts } from "./clock/usePragueTime";
import { Drawer } from "./Drawer";
import { LearnPage } from "./LearnPage";
import { usePageRoute } from "./routing";
import { SimpleControls } from "./SimpleControls";
import { SimpleScrubber } from "./SimpleScrubber";

export type { Page } from "./routing";

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

// Helvetica's "1" has a much wider right-side bearing than the other
// digits, so a leading "1" immediately followed by another digit (e.g. the
// "1" in "10", "12", "19", or "11") reads with an oversized internal gap.
// Tighten just that pairing rather than kerning every digit.
function renderDigits(digits: string) {
  return digits.split("").map((digit, index) => {
    const isTightLeadingOne = digit === "1" && index < digits.length - 1;
    return (
      <span key={index} className={isTightLeadingOne ? "app-datetime-digit-tight" : undefined}>
        {digit}
      </span>
    );
  });
}

function App() {
  const [page, navigate] = usePageRoute();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const {
    pragueTime,
    offsetMs,
    setOffsetMs,
    resetToNow,
    minOffsetMs,
    maxOffsetMs,
    isPlaying,
    togglePlay,
    speedHoursPerSecond,
    setSpeedHoursPerSecond,
  } = useScrubbableTime();
  const { day, month, year } = getPragueDateParts(pragueTime.date);

  return (
    <main
      className="app"
      onClick={() => {
        if (drawerOpen) setDrawerOpen(false);
      }}
    >
      <Drawer
        open={drawerOpen}
        onToggle={() => setDrawerOpen((isOpen) => !isOpen)}
        page={page}
        onNavigate={(nextPage) => {
          navigate(nextPage);
          setDrawerOpen(false);
        }}
        pragueTime={pragueTime}
        dateParts={{ day, month, year }}
      />
      <header className="app-header">
        <div className="app-header-text">
          <button
            type="button"
            className="app-title-block"
            onClick={() => navigate(page === "home" ? "about" : "home")}
            aria-label={page === "home" ? "View about page" : "View home page"}
          >
            <h1 className="app-title">pražský orloj</h1>
            <p className="app-subtitle">Prague's Astronomical Clock</p>
          </button>
          {page === "home" && (
            <p className="app-datetime">
              {month} {day}, {year} <span className="app-datetime-separator">|</span>{" "}
              <span className="app-datetime-hour">{renderDigits(pragueTime.hours.toString())}</span>
              <span className="app-datetime-colon">:</span>
              <span className="app-datetime-minute">{renderDigits(pad(pragueTime.minutes))}</span>
              <PragueTimeFootnote />
            </p>
          )}
        </div>
        {page === "home" && (
          <SimpleControls
            offsetMs={offsetMs}
            onReset={resetToNow}
            isPlaying={isPlaying}
            onTogglePlay={togglePlay}
            speedHoursPerSecond={speedHoursPerSecond}
            onSpeedChange={setSpeedHoursPerSecond}
          />
        )}
      </header>
      {page === "home" ? (
        <>
          <ClockFace pragueTime={pragueTime} />
          <SimpleScrubber
            offsetMs={offsetMs}
            minOffsetMs={minOffsetMs}
            maxOffsetMs={maxOffsetMs}
            onOffsetChange={setOffsetMs}
          />
        </>
      ) : page === "about" ? (
        <AboutPage />
      ) : (
        <LearnPage slug={page.slice("learn/".length)} />
      )}
    </main>
  );
}

export default App;
