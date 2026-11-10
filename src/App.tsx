import { useState } from "react";
import { PragueTimeFootnote } from "./PragueTimeFootnote";
import { AboutPage } from "./AboutPage";
import { ChatPanel } from "./ChatPanel";
import { ClockFace } from "./clock/ClockFace";
import { useScrubbableTime } from "./clock/useScrubbableTime";
import { getPragueDateParts } from "./clock/usePragueTime";
import { DateTimeModal } from "./DateTimeModal";
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
      <span
        key={index}
        className={isTightLeadingOne ? "app-datetime-digit-tight" : undefined}
      >
        {digit}
      </span>
    );
  });
}

function App() {
  const [page, navigate] = usePageRoute();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dateTimeModalOpen, setDateTimeModalOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const {
    pragueTime,
    offsetMs,
    setOffsetMs,
    setExactDate,
    resetToNow,
    minOffsetMs,
    maxOffsetMs,
    isPlaying,
    togglePlay,
    speedHoursPerSecond,
    setSpeedHoursPerSecond,
    rangeOption,
    setRangeOption,
    customAnchor,
    anchorDate,
    minDate,
    maxDate,
  } = useScrubbableTime();
  const { day, month, year } = getPragueDateParts(pragueTime.date);

  return (
    <main
      className="app"
      onClick={() => {
        if (drawerOpen) setDrawerOpen(false);
        if (menuOpen) setMenuOpen(false);
        if (chatOpen) setChatOpen(false);
      }}
    >
      <Drawer
        open={drawerOpen}
        onToggle={() => {
          setDrawerOpen((isOpen) => !isOpen);
          setMenuOpen(false);
        }}
        menuOpen={menuOpen}
        onToggleMenu={() => setMenuOpen((isOpen) => !isOpen)}
        page={page}
        onNavigate={(nextPage) => {
          navigate(nextPage);
          setDrawerOpen(false);
          setMenuOpen(false);
          // Clicking a nav link should always jump to the top of its target
          // (or target section), even if the hash doesn't actually change --
          // e.g. re-clicking "about" while already deep-scrolled on the About
          // page, where no hashchange fires to trigger a re-render.
          const sectionId = nextPage.startsWith("about/")
            ? nextPage.slice("about/".length)
            : null;
          if (sectionId) {
            document
              .getElementById(sectionId)
              ?.scrollIntoView({ behavior: "smooth", block: "start" });
          } else {
            window.scrollTo({ top: 0, behavior: "smooth" });
          }
        }}
        pragueTime={pragueTime}
        dateParts={{ day, month, year }}
      />
      <ChatPanel
        open={chatOpen}
        onToggle={() => setChatOpen(false)}
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
              <button
                type="button"
                className="app-datetime-button"
                onClick={(e) => {
                  e.stopPropagation();
                  setDateTimeModalOpen(true);
                }}
                aria-label="Set an exact date and time"
              >
                {month} {day}, {year}{" "}
                <span className="app-datetime-separator">|</span>{" "}
                <span className="app-datetime-hour">
                  {renderDigits(pragueTime.hours.toString())}
                </span>
                <span className="app-datetime-colon">:</span>
                <span className="app-datetime-minute">
                  {renderDigits(pad(pragueTime.minutes))}
                </span>
              </button>
              <PragueTimeFootnote />
            </p>
          )}
        </div>
        {page === "home" && (
          <div className="app-header-right">
            <SimpleControls
              offsetMs={offsetMs}
              onReset={resetToNow}
              isPlaying={isPlaying}
              onTogglePlay={togglePlay}
              speedHoursPerSecond={speedHoursPerSecond}
              onSpeedChange={setSpeedHoursPerSecond}
              customAnchor={customAnchor}
              rangeOption={rangeOption}
              onRangeChange={setRangeOption}
            />
            <button
              type="button"
              className="app-moment-button"
              onClick={(e) => {
                e.stopPropagation();
                setDrawerOpen(true);
              }}
            >
              What the clock tells us <br className="app-moment-button-break" /> about this moment
            </button>
            <button
              type="button"
              className="app-moment-button"
              onClick={(e) => {
                e.stopPropagation();
                setChatOpen(true);
              }}
            >
              Ask the orloj expert
            </button>
          </div>
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
            minDate={minDate}
            maxDate={maxDate}
            anchorDate={anchorDate}
          />
          <DateTimeModal
            open={dateTimeModalOpen}
            initialDate={pragueTime.date}
            onClose={() => setDateTimeModalOpen(false)}
            onConfirm={setExactDate}
          />
        </>
      ) : page.startsWith("about") ? (
        <AboutPage
          initialSection={
            page === "about" ? undefined : page.slice("about/".length)
          }
        />
      ) : (
        <LearnPage slug={page.slice("learn/".length)} />
      )}
    </main>
  );
}

export default App;
