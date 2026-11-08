import { useEffect } from "react";
import "./AboutPage.css";
import aerialView from "./assets/01c-1b.jpg";
import facadeCloseup from "./assets/Astronomical_Clock_8341899828.jpg";
import towerStreetView from "./assets/orloj_prague.jpg";
import dialDetail from "./assets/prague-orloj-01.jpg";
import sunsetView from "./assets/73d8d74de8664f17f0c32fb7903844c103d3d6bdee1eebce65622964eca56ffd.avif";

const GALLERY_IMAGES = [
  {
    src: aerialView,
    alt: "Aerial view of Old Town Square with the astronomical clock tower",
    area: "hero",
  },
  {
    src: facadeCloseup,
    alt: "Close-up of the tower facade showing the astronomical and calendar dials stacked",
    area: "tall-left",
  },
  {
    src: towerStreetView,
    alt: "The clock tower facade viewed from street level",
    area: "tall-right",
  },
  {
    src: dialDetail,
    alt: "Detail of the astronomical dial face with carved apostle figures",
    area: "small-left",
  },
  {
    src: sunsetView,
    alt: "Sunset over Old Town Square with the spires of Týn Church",
    area: "small-right",
  },
];

const EXTERNAL_LINKS = [
  {
    href: "https://www.amazingczechia.com/sights/prague-astronomical-clock-orloj/",
    label: "Amazing Czechia: Prague Astronomical Clock (Orloj)",
  },
  {
    href: "https://www.almanachotels.com/praguex/city-guide/prague-astronomical-clock/",
    label: "Almanac Hotels: Prague Astronomical Clock city guide",
  },
  {
    href: "https://en.wikipedia.org/wiki/Prague_astronomical_clock",
    label: "Wikipedia: Prague astronomical clock",
  },
  {
    href: "https://www.google.com/search?sca_esv=906155477d0fcc73&rlz=1C5MACD_enUS1116US1116&sxsrf=AKL5yDhkSEg_OG31SGgVsruaZl9Owzk45w:1793720929675&q=prague+astronomical+clock&source=lnms&fbs=ACAhTvwdifjn2dKXmjtOfBxVFl_koHVe5RLSnJlTH2QYaq_YVfnwA0k4pzZ9d-ZbRA0e6tww_WM0IOMLGL1GAIRO4RsbjJjjpycyTparesHCNTyqO8ZGu_yTJxggHqAlblyUQ10FCLRnvkxMEB9EO08PODvbUjIGT3xO42l6bARmMkjsY6WGvbo5otApwIskyZcF12Xk-NLTSd_HRuNGpKZEUIuLmcm7aVYIzAesJ0LVoKzYqmh9j_w&sa=X&ved=2ahUKEwj7jtuWk-yXAxXUMjQIHaVHO6wQ0pQJegQIDRAB&biw=1186&bih=693&dpr=2.5#lpg=cid:CgIgAQ%3D%3D,ik:CAoSFkNJSE0wb2dLRUlDQWdJQ1J6NS04RlE%3D",
    label: "Google: more photos of the Prague Astronomical Clock",
  },
];

const GOOGLE_MAPS_SEARCH_URL =
  "https://www.google.com/search?sca_esv=906155477d0fcc73&rlz=1C5MACD_enUS1116US1116&cs=1&output=search&kgmid=/m/032t0f&q=Prague+Astronomical+Clock&shem=dlvs1,epsd1,esd2e,ltae,rimspwouoe,sdpie&shndl=30&source=sh/x/loc/uni/m1/1&kgs=da7853d78a7e3356&utm_source=dlvs1,epsd1,esd2e,ltae,rimspwouoe,sdpie,sh/x/loc/uni/m1/1";

const MIKULAS_OF_KADAN_URL =
  "https://en.wikipedia.org/wiki/Mikul%C3%A1%C5%A1_of_Kada%C5%88";
const JAN_SINDEL_URL = "https://en.wikipedia.org/wiki/Jan_%C5%A0indel";
const DEVELOPER_PORTFOLIO_URL = "https://bartdorityportfolio.online/";

type DiagramItem = {
  src: string;
  alt: string;
  title: string;
  body: string;
  link?: { term: string; href: string };
};

function renderDiagramBody(body: string, link?: { term: string; href: string }) {
  return body.split("\n\n").map((paragraph) => {
    if (!link || !paragraph.includes(link.term)) {
      return <p key={paragraph}>{paragraph}</p>;
    }
    const [before, after] = paragraph.split(link.term);
    return (
      <p key={paragraph}>
        {before}
        <a href={link.href}>{link.term}</a>
        {after}
      </p>
    );
  });
}

const RING_ITEMS: DiagramItem[] = [
  {
    src: "/about_page/roman_ring.svg",
    alt: "The fixed Roman numeral ring, I to XII doubled over the 24-hour circle",
    title: "The Roman ring",
    body: "A fixed ring of Roman numerals, I–XII doubled over the full 24-hour circle, marks civil time — the hours on an ordinary clock. The hand and the sun and moon dials sweep past it once a day, and whichever numeral they reach is the current hour.",
  },
  {
    src: "/about_page/zodiac_ring.svg",
    alt: "The zodiac ring, carrying the twelve zodiac signs",
    title: "The zodiac ring",
    body: "This ring turns on its own sidereal clock — one full rotation every 23 hours and 56 minutes, the true rotation period of the Earth against the stars rather than the sun. Over the year it slowly drifts out of step with civil time, carrying the zodiac signs past the sun, moon, and star dials in their actual seasonal order.\n\nLook closely and the twelve signs aren't evenly sized — Taurus and Cancer stretch wide while Capricorn and Scorpio pinch narrow. That comes from how the ring is drawn: a classical astrolabe projects the ecliptic, the sun's path through the zodiac, onto a flat disk as seen from the celestial pole. Because the ecliptic sits 23.4° off from the celestial equator — Earth's axial tilt — that projection pushes the ring off-center, and the signs along it end up stretched or squeezed depending on how far each one falls from the pole in the projection.\n\nThat distortion comes entirely from the tilt of the Earth's axis, not from where the clock is built — the real Orloj's zodiac ring would look identical mounted in Prague or anywhere else on Earth. (The parts of a real astrolabe that are genuinely tied to one location — the horizon line and the unequal day-and-night hour curves — live on the plate behind the ring, not on the ring itself.)",
  },
  {
    src: "/about_page/numeric_ring.svg",
    alt: "The old Bohemian numeral ring, numbered I to XXIV",
    title: "The numeric ring",
    body: "Numbered I–XXIV in the old Bohemian style, this ring isn't geared to spin steadily through the year. Instead it's set so its \"24\" mark always lines up with the sun at the moment of sunset. Because sunset drifts later through spring and summer and earlier through fall and winter, the ring creeps one direction after the summer solstice and the other after the winter solstice — oscillating back and forth across the year rather than spinning continuously.",
  },
];

const DIAL_ITEMS: DiagramItem[] = [
  {
    src: "/about_page/hand_dial.svg",
    alt: "The gilded pointing hand",
    title: "The hand",
    body: "A single gilded hand, cast as a pointing arm, sweeps a full circle every 24 hours. Whatever numeral it reaches on the Roman ring is the current civil hour; read against the old Bohemian ring turning beneath it, that same position gives the hours elapsed since sunset.",
  },
  {
    src: "/about_page/sun_dial.svg",
    alt: "The golden sun dial",
    title: "The sun dial",
    body: "A golden sun glyph marks the sun's real position against the zodiac ring, circling once a day and drifting through the twelve signs over the course of the year exactly as the real sun does.",
  },
  {
    src: "/about_page/moon_dial.svg",
    alt: "The moon dial, half silvered to show its phase",
    title: "The moon dial",
    body: "Turning at nearly the same rate as the sun dial, this half-silvered sphere shows the moon's current phase and its own place among the zodiac signs — offset from the sun by the moon's actual phase, so the two meet exactly at new moon and sit opposite each other at full moon.",
  },
  {
    src: "/about_page/star_dial.svg",
    alt: "The star dial pointer",
    title: "The star dial",
    body: "A small star-tipped pointer, fixed to the zodiac ring, marks sidereal time directly — the true position of the stars overhead, completing one rotation every 23 hours and 56 minutes.",
    link: { term: "sidereal time", href: "#learn/sidereal-time" },
  },
];

const SECTIONS = [
  { id: "real-clock", label: "The real clock" },
  { id: "how-it-works", label: "How it works" },
  { id: "digital-version", label: "About this digital version" },
];

type AboutPageProps = {
  initialSection?: string;
};

export function AboutPage({ initialSection }: AboutPageProps) {
  useEffect(() => {
    if (initialSection) {
      document
        .getElementById(initialSection)
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [initialSection]);

  return (
    <article className="about-page">
      <nav className="about-page-nav" aria-label="About page sections">
        {SECTIONS.map(({ id, label }) => (
          <a key={id} className="pill-button" href={`#about/${id}`}>
            {label}
          </a>
        ))}
      </nav>

      <div className="about-page-text">
        <h2 id="real-clock" className="about-section-title">
          The real clock
        </h2>
        <p>
          The Prague Orloj is a medieval astronomical clock mounted on the Old
          Town Hall in Prague, first installed in 1410. It tracks the position
          of the sun and moon against the zodiac, the time in both civil and old
          Bohemian hours, and the phase of the moon — all on a single dial.
        </p>
        <p>
          It is the third-oldest astronomical clock in the world and the oldest
          still operating. Its original mechanism is credited to the clockmaker{" "}
          <a
            href={MIKULAS_OF_KADAN_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            Mikuláš of Kadaň
          </a>{" "}
          working with the mathematician and astronomer{" "}
          <a href={JAN_SINDEL_URL} target="_blank" rel="noopener noreferrer">
            Jan Šindel
          </a>
          , with later additions including the calendar dial and the moving
          figures that greet every passing hour.
        </p>

        <h3>Find it</h3>
        <div className="about-page-map">
          <iframe
            title="Prague Astronomical Clock on Google Maps"
            src="https://www.google.com/maps?q=Prague+Astronomical+Clock&output=embed"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        </div>
        <p className="about-page-map-link">
          <a
            href={GOOGLE_MAPS_SEARCH_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            View on Google Maps
          </a>
        </p>

        <h3>Learn more</h3>
        <ul className="about-page-links">
          {EXTERNAL_LINKS.map(({ href, label }) => (
            <li key={href}>
              <a href={href} target="_blank" rel="noopener noreferrer">
                {label}
              </a>
            </li>
          ))}
        </ul>
      </div>

      <div className="about-page-gallery">
        {GALLERY_IMAGES.map(({ src, alt, area }) => (
          <img
            key={area}
            src={src}
            alt={alt}
            className={`about-page-gallery-item about-page-gallery-item--${area}`}
          />
        ))}
      </div>

      <div className="about-page-section">
        <h3>
          What the Pražský orloj taught the residents of Prague in the 15th
          Century
        </h3>
        <p>
          Before 1410, Prague told time the way most of medieval Europe did — by
          the sun, by church bells, by the feel of morning, midday, and evening.
          Clocks were rare, expensive, and private. There was no such thing as
          "a watch" that people would wear on their wrist. The Orloj put
          something new in the town square: one public face showing every
          citizen the same 24 equal hours, readable by anyone who could count a
          numeral, without needing a priest or a sundial. That was a small
          social revolution. Time stopped belonging to the fields and the parish
          and became civic property — a shared, numerical system that belonged
          to the whole town. And once an hour is a fixed, visible unit everyone
          can check against the same dial, it becomes possible to ask someone to
          be somewhere at the third hour rather than "at sunrise" — which means
          labor itself can start to be scheduled, divided, and measured by the
          clock instead of by daylight. Historians of early wage labor have
          pointed to exactly that shift, from task time to clock time, as one of
          the quiet preconditions for the factory discipline that arrived
          centuries later. The Orloj didn't cause that on its own, but as one of
          Central Europe's first great public clocks, it helped teach an entire
          city to think of a day as a set of uniform, countable parts.
        </p>
        <p>
          It's worth being precise about what the clock itself actually claims:
          its zodiac ring and sun-and-moon dials encode a geocentric, Ptolemaic
          universe, with sun and moon circling a fixed Earth — not the
          heliocentric model Copernicus would publish in 1543, more than fifty
          years after the clock's major 1490s renovation. There's no documented
          link between the Orloj and Copernicus, or, a century later, Galileo.
          But all three are products of the same underlying conviction: that the
          heavens run on fixed, calculable rules precise enough to be built into
          a machine. By putting that conviction on permanent public display in a
          town square — the sky rendered as something orderly enough to gear and
          dial, not just observed — the Orloj helped normalize the habit of mind
          that later let Copernicus relocate the center of the universe, and let
          Galileo insist its rules answer to a telescope rather than a text. The
          clock's own answer was wrong about where the center sat — but the
          deeper assumption underneath it, that the cosmos is legible machinery,
          is the same thread running through all three.
        </p>
      </div>

      <div className="about-page-text">
        <h2 id="how-it-works" className="about-section-title">
          How it Works
        </h2>
        <p>
          The clock face layers three rings, one turning inside the next, with
          four dials sweeping across them at their own real rates. Each ring
          sets a stage; each dial is a pointer reading that stage.
        </p>
      </div>
      <img
        src={dialDetail}
        alt="Detail of the astronomical dial face with carved apostle figures"
        className="about-page-how-it-works-image"
      />

      <div className="about-page-section about-page-section--wide">
        <h3>Three rings</h3>
        <div className="about-page-diagram-list">
          {RING_ITEMS.map(({ src, alt, title, body, link }, index) => (
            <div
              key={title}
              className={`about-page-diagram-row${
                index % 2 === 1 ? " about-page-diagram-row--reverse" : ""
              }`}
            >
              <img className="about-page-diagram-image" src={src} alt={alt} />
              <div className="about-page-diagram-copy">
                <h4>{title}</h4>
                {renderDiagramBody(body, link)}
              </div>
            </div>
          ))}
        </div>

        <h3>Four dials</h3>
        <div className="about-page-diagram-list">
          {DIAL_ITEMS.map(({ src, alt, title, body, link }, index) => (
            <div
              key={title}
              className={`about-page-diagram-row${
                index % 2 === 1 ? " about-page-diagram-row--reverse" : ""
              }`}
            >
              <img className="about-page-diagram-image" src={src} alt={alt} />
              <div className="about-page-diagram-copy">
                <h4>{title}</h4>
                {renderDiagramBody(body, link)}
              </div>
            </div>
          ))}
        </div>

        <h3>Zodiac highlights</h3>
        <p>
          To make it easier to see at a glance which sign each dial is currently
          reading, this digital version shades that zodiac wedge: purple for the
          sun, black for the moon. When both dials land on the same sign, the
          sun's purple takes priority over the moon's black. This highlighting
          is a feature of this digital version only — the mechanical clock on
          Old Town Hall has no such coloring.
        </p>
        <p>
          The star pointer isn't part of this highlighting. It's rigidly fixed
          to the zodiac ring itself, so it always rests over the same wedge no
          matter the date — shading that wedge would look like a live reading
          without ever actually being one. The star's real, changing reading is
          sidereal time itself, shown as a Roman numeral in the info drawer
          instead.
        </p>

        <h3>The Kalendarium clockface</h3>
        <div className="about-page-kalendarium">
          <div className="about-page-kalendarium-copy">
            <p>
              Mounted directly below the astronomical dial is a second,
              quieter clockface — the Kalendarium. A large disc of 365 days
              turns once a year past a fixed pointer, held by a gilded angel,
              to mark today's date; its outer ring also carries a name-day for
              each day of the year. A middle ring holds twelve painted
              roundels, one per month, in the medieval "Labors of the Months"
              tradition — sowing, harvesting, and other scenes of the
              agricultural year paired with each zodiac sign. At the center
              sits a medallion bearing the coat of arms of Prague's Old Town.
            </p>
            <p>
              It's a much younger addition than the dial above it — the
              artwork you see today was painted by Josef Mánes in 1865–70,
              replacing an earlier Gothic calendar plate. (The roundels
              mounted on the tower are copies; Mánes's originals now hang in
              Prague's City Museum.)
            </p>
            <p>
              Mechanically it's simple: a single gear train advancing one
              division per day, with no sun, moon, or star position to
              compute. The real astronomical achievement is the dial above it
              — the Kalendarium is a civic and artistic companion piece,
              prized for its artwork and its saints'-day calendar rather than
              for any astronomy of its own. That's also why this digital
              version doesn't model it: there's no underlying mechanism to
              simulate, just a date on a painted disc.
            </p>
          </div>
          <img
            className="about-page-kalendarium-image"
            src="/about_page/kalendarium.png"
            alt="The Kalendarium, the calendar dial mounted below the astronomical dial"
          />
        </div>
      </div>

      <div className="about-page-section">
        <h2 id="digital-version" className="about-section-title">
          About this digital version
        </h2>
        <p>
          This is a live simulation of its mechanism, driven by real
          astronomical formulas rather than animation. The sun, moon, and zodiac
          hands move exactly as the real clock's gears would, and the whole
          thing stays in sync with the actual time in Prague — open it at any
          hour and it shows what the clock on Old Town Hall is showing at that
          same moment.
        </p>
        <p>
          Press the play button to watch the clock run forward on its own, and
          use the dropdown next to it to choose the pace — anywhere from real
          time up to 48 simulated hours per second — to watch the rings and
          dials race through days, months, even whole seasons. The scrub bar
          beneath the clock face does the same thing by hand: drag it to jump to
          any moment within three months of today, forward or back. The Now
          button snaps everything back to the current moment in Prague.
        </p>
        <p>
          The sidebar along the left edge — click it to open — reads the clock
          face for you at whatever moment is currently showing: which zodiac
          house the sun, moon, and stars are each resting in, the moon's current
          phase and illumination, and what the gold outer ring and inner ring
          are reading in both civil and old Bohemian hours. It's a detailed,
          moment-by-moment breakdown the mechanical clock itself can't offer —
          one of the real advantages of a digital version.
        </p>
        <h3>What this digital version can teach people in the 21st century</h3>
        <p>
          The real Orloj can only ever show one thing: right now. This digital
          version can show the clock at any moment — scrub forward to the next
          solstice, back to the day you were born, or press play and watch the
          rings race through a year in minutes. That turns the clock from a
          single daily reading into something closer to a planetarium: a way to
          actually watch the zodiac ring's 23-hour-56-minute sidereal rotation
          slowly pull away from the 24-hour civil ring, rather than just being
          told the two periods differ. Sidereal time is a concept almost nobody
          encounters day to day — this is one of the few places a person can
          watch it happen.
        </p>
        <p>
          The clock dials only work because they're based on the geometry of a
          rotating, axially-tilted globe. Run the animation
          long enough to see the zodiac ring's year-long drift or the moon
          dial's phase catch back up with the sun, and you're watching the
          consequences of a spherical, moving Earth play out mechanically — the
          same consequences the Orloj's original builders worked out five
          centuries ago with nothing but geometry. Maybe the simplest lesson is
          the most honest one: a clockmaker in 1410 built a model good enough
          that, with nothing but updated math and a screen instead of gears, it
          still tells the same true story about the sky today. The tools for
          measuring time and watching the heavens have gotten smaller and faster
          since 1510 — but the basic human itch to mark the hour and watch the
          sky turn hasn't changed all that much.
        </p>

        <p>
          I was personally fascinated by the Pražský orloj while visiting Prague
          in 2014. As is my process, I thought the best way to learn how the
          clock works was to build a digital replica of sorts. I hope this
          digital version helps other people fascinated by this wonderful
          achievement better understand how it functions.
        </p>
        <p>
          This digital version was built by{" "}
          <a
            href={DEVELOPER_PORTFOLIO_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            Bart Dority
          </a>
          .
        </p>
      </div>
    </article>
  );
}
