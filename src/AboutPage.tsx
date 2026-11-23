import { useEffect } from "react";
import "./AboutPage.css";
import aerialView from "./assets/01c-1b.jpg";
import facadeCloseup from "./assets/Astronomical_Clock_8341899828.jpg";
import towerStreetView from "./assets/orloj_prague.jpg";
import dialDetail from "./assets/prague-orloj-01.jpg";
import sunsetView from "./assets/73d8d74de8664f17f0c32fb7903844c103d3d6bdee1eebce65622964eca56ffd.avif";
import "./clock/ClockFace.css";
import { HorizonPlateLayer } from "./clock/HorizonPlateLayer";
import { PRAGUE_LOCATION } from "./clock/location";
import { Math } from "./Math";

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
    href: "https://orloj.cesnet.cz/en/",
    label: "CESNET: a 3D interactive digitalization of the Prague Orloj",
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
const MOON_MATH_URL = "https://moon-math.online/";

type DiagramItem = {
  src: string;
  alt: string;
  title: string;
  body: string;
  link?: { term: string; href: string };
};

function renderDiagramBody(
  body: string,
  link?: { term: string; href: string },
) {
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
    body: "This ring turns on its own sidereal clock — one full rotation every 23 hours and 56 minutes, the true rotation period of the Earth against the stars rather than the sun. Over the year it slowly drifts out of step with civil time, carrying the zodiac signs past the sun, moon, and star dials in their actual seasonal order.\n\nLook closely and the twelve signs aren't evenly sized — Taurus and Cancer stretch wide while Capricorn and Scorpio pinch narrow. That comes from how the ring is drawn: a classical astrolabe projects the ecliptic, the sun's path through the zodiac, onto a flat disk as seen from the celestial pole. Because the ecliptic sits 23.4° off from the celestial equator — Earth's axial tilt — that projection pushes the ring off-center, and the signs along it end up stretched or squeezed depending on how far each one falls from the pole in the projection.\n\nThat distortion comes entirely from the tilt of the Earth's axis, not from where the clock is built — the real Orloj's zodiac ring would look identical mounted in Prague or anywhere else on Earth. (The parts of a real astrolabe that are genuinely tied to one location — the horizon line and the unequal day-and-night hour curves — live on the plate behind the ring, not on the ring itself.)\n\nThe gold outer band of the ring isn't pure ornament either — it's a graduated scale. Each sign covers exactly 30° of the ecliptic, and the fine ticks running around the band subdivide that into smaller steps, letting the dial register the sun's precise ecliptic longitude rather than just which sign it's passing through. Since the sun creeps roughly one degree along the ecliptic per day, that scale effectively lets a reader pin down the date itself — the same instinct behind the minute-ticks between hour-numerals on an ordinary clock face: coarse divisions for the sign, fine divisions for an actual reading.",
    link: { term: "sidereal", href: "#learn/sidereal-time" },
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
    title: "The hand dial",
    body: "A single gilded hand, cast as a pointing arm, sweeps a full circle every 24 hours. Whatever numeral it reaches on the Roman ring is the current civil hour; read against the old Bohemian ring turning beneath it, that same position gives the hours elapsed since sunset.",
  },
  {
    src: "/about_page/sun_dial.svg",
    alt: "The golden sun dial",
    title: "The sun dial",
    body: "A golden sun glyph marks the sun's real position against the zodiac ring, circling once a day and drifting through the twelve signs over the course of the year exactly as the real sun does.\n\nThe glyph doesn't just travel in a circle, though — it also slides closer to or farther from the dial's center over the course of the year. It rides the zodiac ring's own off-center circle like a peg on a track: the ring's center sits well apart from the hand's own pivot, so as the sun's angle sweeps around with the time of day, the point where it meets the ring's rim keeps changing distance from the pivot.\n\nThat distance traces out a slow yearly breathing motion layered on top of the daily sweep. Around the summer solstice, with the sun in Cancer, the glyph rides out near the dial's outer edge; around the winter solstice, with the sun in Capricorn, it pulls in close to the center. It's the same off-center ecliptic projection described above for the zodiac ring, showing up a second time here as a changing radius instead of stretched and squeezed signs.",
  },
  {
    src: "/about_page/moon_dial.svg",
    alt: "The moon dial, half silvered to show its phase",
    title: "The moon dial",
    body: "Turning at nearly the same rate as the sun dial, this bicolor sphere shows the moon's true current phase — not just a fixed half-and-half split, but the actual crescent, quarter, gibbous, or full shape the real moon shows tonight — and its own place among the zodiac signs, offset from the sun by the moon's real phase so the two meet exactly at new moon and sit opposite each other at full moon.",
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
  { id: "developer", label: "About the developer" },
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
          The zodiac ring and sun-and-moon dials encode a geocentric, Ptolemaic
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
        <p>
          And yet the clock still works. Being wrong about what orbits what
          isn't the same as being wrong about what you'd see in the sky — a
          geocentric model and a heliocentric one describe the exact same
          apparent motion, just from two different vantage points, and anyone
          standing on the ground sees an identical result either way: the sun
          still rises in the east, the zodiac signs still pass overhead in the
          same yearly order, the moon still waxes and wanes on schedule. The
          Orloj was never really a claim about what orbits what; it was a claim
          about what you'd see from Prague at a given moment, and that claim has
          held up for over 600 years. It's the same reason this digital version
          can swap in modern orbital formulas underneath the same
          five-century-old geometry and have every dial still reads true.
        </p>
      </div>

      <div className="about-page-text">
        <h2 id="how-it-works" className="about-section-title">
          How it Works
        </h2>
        <p>
          The clock is a very unique and creative combination of rings and
          dials, built on top of a giant astrolabe tympan, or climate plate — a
          latitude-specific plate that's normally fitted inside the body of a
          classical astrolabe. It contains a stereographic projection: a
          two-dimensional map of the celestial sphere projected onto a flat
          plane for one specific geographic latitude.
        </p>
        <p>
          On top of that are layered three rings and four dials. They all move
          independently, but together they tell a story about the earth, the
          cosmos, and the current moment we're living through.
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

        <h2 className="about-section-title">
          The background plate, and the math behind it
        </h2>
        <div className="about-page-background-plate">
          <div className="about-page-background-plate-copy">
            <p>
              Behind the zodiac ring sits a fixed plate — the astrolabe tympan
              the whole clock is built on. Unlike every ring and hand layered
              above it, this plate never turns: it's cut for one specific
              latitude (Prague's, a little over 50°N) and stays locked in place
              while the rest of the mechanism sweeps across it once a day. Its
              curved bands mark where the sun sits relative to the horizon —
              blue for daylight, orange for twilight, dark blue for true night —
              and eleven gold curves divide the daylight band into the twelve
              Babylonian hours: the old unequal-hour system that splits whatever
              daylight a given day actually has, long or short, into twelve
              equal parts, numbered 1 to 12 from sunrise to sunset. Because the
              length of daylight itself stretches and shrinks with the seasons,
              so does each Babylonian hour along with it — a Prague summer hour
              runs well over 60 real minutes, a winter one well under — which is
              exactly why the numerals fan out unevenly around the dial instead
              of sitting at even 30° intervals, bunched tightly near the top
              (midday) and spread wide near the horizon (sunrise and sunset).
              This was ordinary civil time across much of medieval Europe, long
              before mechanical clocks made fixed, equal-length hours the
              default; the Orloj still keeps both systems side by side — the
              Babylonian hours on this plate, the familiar equal hours on the
              outer Roman-numeral ring.
            </p>
            <h4>Dawn, sunrise, sunset, dusk: the plate's four thresholds</h4>
            <p>
              Four Latin words are inscribed on the plate, with V standing in
              for U in the old orthography:
            </p>
            <dl className="about-page-background-plate-terms">
              <div>
                <dt>ORTVS</dt>
                <dd>
                  (<em>ortus</em>): sunrise. It's on the left, along the eastern
                  horizon curve.
                </dd>
              </div>
              <div>
                <dt>AVRORA</dt>
                <dd>
                  (<em>aurora</em>): dawn. It's on the left in the dawn band,
                  just below the horizon.
                </dd>
              </div>
              <div>
                <dt>OCCASVS</dt>
                <dd>
                  (<em>occasus</em>): sunset. It's on the right, along the
                  western horizon curve.
                </dd>
              </div>
              <div>
                <dt>CREPVSCVLVM</dt>
                <dd>
                  (<em>crepusculum</em>): dusk, or twilight. It's on the right
                  in the twilight band.
                </dd>
              </div>
            </dl>
            <p>
              The left side of the dial shows the morning — dawn, then sunrise —
              and the right side mirrors it for the evening — sunset, then dusk.
              The words follow the curved lines because those curves mark where
              the sun crosses each of those thresholds over the year.
            </p>
          </div>
          <div className="about-page-background-plate-stage">
            <HorizonPlateLayer location={PRAGUE_LOCATION} />
          </div>
        </div>

        <h4>A deliberate pole-inversion twist</h4>
        <p>
          The plate is a stereographic astrolabe projection cut for Prague's
          latitude (φ ≈ 50°N) — but not the standard kind. A handheld astrolabe
          of this era normally projects from the South Celestial Pole onto the
          equatorial plane, which puts the North Celestial Pole at the dial's
          center. Around 1410, the clock's designers — the
          astronomer/mathematician Jan Šindel and clockmaker Mikuláš of Kadaň —
          flipped that convention: the Orloj projects from the North Celestial
          Pole instead, placing the South Celestial Pole at the center of the
          dial.
        </p>
        <p>
          The reason was practical: projecting from the north makes the dial
          read the way the sky actually looks to someone in Prague facing south
          at midday, with the Tropic of Cancer forming the outer bounding ring
          and the Tropic of Capricorn the inner one. That flip shows up directly
          in the almucantar math — reversing the pole of projection reverses the
          sign on the altitude term:
        </p>
        <Math
          display
          tex="\sin\phi + \sin h \;\longrightarrow\; \sin\phi - \sin h"
        />
        <p>
          the same pole-flip this digital version's own projection formula
          carries (see <code>horizonPlate.ts</code>'s doc comments for the
          equivalent sign change in its stereographic-radius equation, verified
          numerically against hand-placed reference circles before being
          trusted).
        </p>
        <h4>Which almucantars are painted</h4>
        <p>
          Rather than a dense grid of altitude circles, the plate paints just
          two: the horizon almucantar (h = 0°), separating the blue daytime sky
          from the orange twilight band, and the astronomical twilight
          almucantar (h = −18°), separating twilight from the black circle of
          true night. The twilight circle doesn't reach all the way out to the
          Tropic of Cancer ring — which is exactly why the dial itself shows
          Prague never getting a full astronomical night around the summer
          solstice: at that time of year the sun's path stays close enough to
          the horizon that it never dips a full 18° below it, even at midnight.
        </p>
        <p>
          Both painted circles come from the same pair of equations, just
          evaluated at a different altitude h: the almucantar's center offset
          from the plate's own center (y<sub>c</sub>) and its radius (r
          <sub>a</sub>), each expressed as a multiple of R<sub>eq</sub>, the
          celestial equator's own projected radius:
        </p>
        <Math
          display
          tex="y_c = R_{\mathrm{eq}}\,\frac{\cos\phi}{\sin\phi-\sin h},\qquad r_a = R_{\mathrm{eq}}\,\frac{\cos h}{\left|\sin\phi-\sin h\right|}"
        />
        <p>
          Plug in h = 0° for the horizon and h = −18° for astronomical twilight,
          at Prague's own latitude, and these are the two circles the plate
          paints.
        </p>
        <h4>Exact dimensions at Prague's latitude</h4>
        <p>
          Using Prague's own geographic latitude (φ = 50°05′N ≈ 50.0833°) and an
          ecliptic obliquity of ε = 23.5° — the medieval/ early-Renaissance
          value the real plate's geometry was cut for, slightly rounder than the
          more precise ≈23.44° used elsewhere in this app's own live
          calculations — the plate's radii work out to clean, named proportions.
        </p>
        <p>
          Because the Orloj projects from the North Celestial Pole, the
          outermost bounding circle of the whole dial is the Tropic of Cancer (R
          <sub>outer</sub>), with the celestial equator sitting inside it at:
        </p>
        <Math
          display
          tex="R_{\mathrm{eq}} = R_{\mathrm{outer}} \,/\, \tan\!\left(\frac{90°+\varepsilon}{2}\right) \approx 0.6556\,R_{\mathrm{outer}}"
        />
        <p>Evaluated at Prague's own numbers, that works out to:</p>
        <div className="about-page-table-wrapper">
          <table className="about-page-dimensions-table">
            <thead>
              <tr>
                <th>Dial feature</th>
                <th>Defining altitude / angle</th>
                <th>
                  Center offset (y<sub>c</sub>/R<sub>eq</sub>)
                </th>
                <th>
                  Circle radius (r<sub>a</sub>/R<sub>eq</sub>)
                </th>
                <th>
                  Normalized to outer ring (R<sub>outer</sub> = 1)
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Tropic of Cancer (outer edge)</td>
                <td>δ = +23.5°</td>
                <td>0 (centered)</td>
                <td>1.5253</td>
                <td>r = 1.0000</td>
              </tr>
              <tr>
                <td>Celestial equator</td>
                <td>δ = 0°</td>
                <td>0 (centered)</td>
                <td>1.0000</td>
                <td>r = 0.6556</td>
              </tr>
              <tr>
                <td>Tropic of Capricorn (inner ring)</td>
                <td>δ = −23.5°</td>
                <td>0 (centered)</td>
                <td>0.6556</td>
                <td>r = 0.4298</td>
              </tr>
              <tr>
                <td>Horizon almucantar (day/twilight)</td>
                <td>h = 0°</td>
                <td>+0.8366 (north/up)</td>
                <td>1.3038</td>
                <td>
                  y<sub>c</sub> = +0.5485, r<sub>a</sub> = 0.8548
                </td>
              </tr>
              <tr>
                <td>Astronomical twilight almucantar</td>
                <td>h = −18°</td>
                <td>+0.5964 (north/up)</td>
                <td>0.8839</td>
                <td>
                  y<sub>c</sub> = +0.3910, r<sub>a</sub> = 0.5795
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <h4>Generated, not just redrawn</h4>
        <p>
          The real plate is a single fixed piece of brass, cut once for Prague's
          latitude and never changing. This digital version instead computes
          that same plate live from the formulas above — the horizon and
          twilight almucantars, the Babylonian-hour arcs, even the teal shading
          bands are all derived at render time from whatever latitude is in
          effect, not hand-traced to match a reference photo of Prague's own
          plate. The two approaches were checked against each other rather than
          one replacing the other: the computed geometry was tuned until it
          reproduced Prague's real plate closely, then re-verified by swapping
          in other latitudes (Reykjavík's, among others) to confirm the shapes
          still made astronomical sense rather than only looking right at the
          one latitude they were eyeballed against. That's exactly what powers
          the location picker in the app's header: choosing a city redraws this
          plate for that city's own latitude, something the real clock's fixed
          brass plate was never built to do. See{" "}
          <a href="#about/digital-version">About this digital version</a> for
          more on that feature.
        </p>
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
        <p>
          The sun dial itself is built to match the real Orloj's own mechanical
          engineering — a hand geared to civil time, a zodiac ring geared to
          true sidereal time, just like the original 15th-century clockwork. As
          a bonus only a digital version can offer, the precise solstice date
          predictions displayed in the "At this moment" drawer come from a
          proper solar ephemeris built alongside it: the exact moments the sun's
          own ecliptic longitude crosses 90° and 270°, the real astronomical
          definition of a solstice, accurate to within a few minutes.
        </p>
        <p>
          The moon dial takes the same approach a step further. The real Orloj's
          moon hand is geared to a fixed mean synodic month — 29.53 days, via a
          379-tooth wheel — a fine approximation that nonetheless drifts out of
          sync with the sky over time and periodically needs hand correction,
          because the moon's real orbital speed varies by several percent across
          its elliptical orbit, something no fixed gear ratio can capture. This
          digital version computes the moon's and the sun's true ecliptic
          longitudes straight from orbital mechanics and takes their real
          difference to get the moon's actual position and illuminated phase at
          every instant — so unlike the mechanical original, it never drifts and
          never needs winding back onto the real sky.
        </p>
        <p>
          Perhaps the biggest advantage this digital version has over the real
          Orloj: the real clock is bolted to one wall in Prague and can only
          ever show Prague's sky. The location picker in the header lets you
          pick any of roughly 250 cities worldwide — Reykjavík, Cairo, Rio de
          Janeiro, Sydney, Tokyo — and the entire clock recomputes itself for
          that city's own latitude and longitude, live. The background plate's
          horizon and twilight almucantars redraw for the new latitude, the
          Babylonian hour arcs reshape to match that city's own daylight length,
          the civil/sidereal/sunset math all shifts to the new longitude and
          time zone, and even the zodiac dials' seasonal reading stays correct
          for wherever you've chosen. A city near the equator shows almost no
          seasonal swing in day length; a city near the Arctic Circle shows the
          horizon band swelling and shrinking dramatically across the year —
          exactly the kind of comparison no single fixed plate of brass could
          ever make. Your choice of city is saved and baked into the page's own
          URL, so a link to this app can point at a specific place, not just a
          specific moment.
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
          rotating, axially-tilted globe. Run the animation long enough to see
          the zodiac ring's year-long drift or the moon dial's phase catch back
          up with the sun, and you're watching the consequences of a spherical,
          moving Earth play out mechanically — the same consequences the Orloj's
          original builders worked out five centuries ago with nothing but
          geometry. Maybe the simplest lesson is the most honest one: a
          clockmaker in 1410 built a model good enough that, with nothing but
          updated math and a screen instead of gears, it still tells the same
          true story about the sky today. The tools for measuring time and
          watching the heavens have gotten smaller and faster since 1510 — but
          the basic human itch to mark the hour and watch the sky turn hasn't
          changed all that much.
        </p>

        <p>
          I was personally fascinated by the Pražský orloj while visiting Prague
          in 2014. As is my process, I thought the best way to learn how the
          clock works was to build a digital replica of sorts. I hope this
          digital version helps other people fascinated by this wonderful
          achievement better understand how it functions.
        </p>
      </div>

      <div className="about-page-section">
        <h2 id="developer" className="about-section-title">
          About the developer
        </h2>
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
        <p>
          I enjoy building complex, data-driven applications engineered with AI
          tools, with the goal of turning dense technical or historical subjects
          into something people can explore and actually understand. This clock,
          like most of my projects, sits at that intersection: real astronomical
          data and history made interactive.
        </p>
        <p>
          More projects live at{" "}
          <a href={MOON_MATH_URL} target="_blank" rel="noopener noreferrer">
            moon-math.online
          </a>
          .
        </p>
      </div>

      <div className="about-page-section">
        <h3>The Kalendarium clockface</h3>
        <div className="about-page-kalendarium">
          <div className="about-page-kalendarium-copy">
            <p>
              Mounted directly below the astronomical dial is a second, quieter
              clockface — the Kalendarium. A large disc of 365 days turns once a
              year past a fixed pointer, held by a gilded angel, to mark today's
              date; its outer ring also carries a name-day for each day of the
              year. A middle ring holds twelve painted roundels, one per month,
              in the medieval "Labors of the Months" tradition — sowing,
              harvesting, and other scenes of the agricultural year paired with
              each zodiac sign. At the center sits a medallion bearing the coat
              of arms of Prague's Old Town.
            </p>
            <p>
              It's a much younger addition than the dial above it — the artwork
              you see today was painted by Josef Mánes in 1865–70, replacing an
              earlier Gothic calendar plate. (The roundels mounted on the tower
              are copies; Mánes's originals now hang in Prague's City Museum.)
            </p>
            <p>
              Mechanically it's simple: a single gear train advancing one
              division per day, with no sun, moon, or star position to compute.
              The real astronomical achievement is the dial above it — the
              Kalendarium is a civic and artistic companion piece, prized for
              its artwork and its saints'-day calendar rather than for any
              astronomy of its own. That's also why this digital version doesn't
              model it: there's no underlying mechanism to simulate, just a date
              on a painted disc.
            </p>
          </div>
          <img
            className="about-page-kalendarium-image"
            src="/about_page/kalendarium.png"
            alt="The Kalendarium, the calendar dial mounted below the astronomical dial"
          />
        </div>
      </div>
    </article>
  );
}
