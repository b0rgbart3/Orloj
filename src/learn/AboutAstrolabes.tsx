import astrolabe1 from "../assets/astrolabe1.jpg";
import astrolabe2 from "../assets/astrolabe2.jpg";
import { Figure } from "./Figure";

type Term = {
  term: string;
  description: string;
};

const ASTROLABE_PARTS: Term[] = [
  {
    term: "Mater",
    description: "The heavy outer body and frame that houses the interior components.",
  },
  {
    term: "Tympan (Plate)",
    description:
      "An interchangeable plate engraved with stereographic projections of altitude and azimuth circles calculated for a specific latitude.",
  },
  {
    term: "Rete",
    description:
      "A rotating, open-work metal star map featuring pointers for major bright stars and the circle of the zodiac.",
  },
  {
    term: "Alidade",
    description:
      "A sighting rule attached to the back of the instrument used to measure the vertical angle of a celestial body.",
  },
  {
    term: "Rule / Regula",
    description: "A rotating pointer on the front used to align celestial positions with the outer hour scale.",
  },
];

const ASTROLABE_HISTORY: Term[] = [
  {
    term: "Antiquity",
    description:
      "The underlying principles of stereographic projection were known by Greek astronomers such as Apollonius of Perga around 225 BCE.",
  },
  {
    term: "Islamic Golden Age",
    description:
      "Scholars and instrument makers in the Islamic world -- including figures like Mariam al-Asturlabi -- greatly refined the astrolabe, adding complex calendar scales, azimuth curves, and trigonometric shadow squares.",
  },
  {
    term: "Medieval & Renaissance Europe",
    description:
      "Reintroduced via al-Andalus (Islamic Spain) in the 12th century, it became a cornerstone of Renaissance science, described in literary works such as Geoffrey Chaucer's A Treatise on the Astrolabe.",
  },
  {
    term: "Mariner's Astrolabe",
    description:
      "A simplified, heavy open-wheel design adapted in the 15th century for open-sea navigation to determine ship latitude using the sun or Polaris, before eventually being replaced by the sextant.",
  },
];

export function AboutAstrolabes() {
  return (
    <>
      <p>
        An astrolabe is an ancient astronomical instrument and analog calculating device that models
        the celestial sphere, functioning as a portable star chart and a tool for timekeeping,
        surveying, and measuring the altitude of the sun or stars.
      </p>

      <Figure caption="A brass planispheric astrolabe: the open-work rete sits over an engraved tympan, framed by the mater.">
        <img src={astrolabe1} alt="A brass planispheric astrolabe viewed from the front, showing the rete over the tympan" />
      </Figure>

      <h3>Key Parts of a Planispheric Astrolabe</h3>
      <dl className="term-list">
        {ASTROLABE_PARTS.map(({ term, description }) => (
          <div className="term-list-item" key={term}>
            <dt className="term-list-term">{term}</dt>
            <dd className="term-list-description">{description}</dd>
          </div>
        ))}
      </dl>

      <Figure caption="A closer view of the rete's star pointers and the rule swept across the engraved scales beneath.">
        <img src={astrolabe2} alt="Close-up of an astrolabe's rete and pointer against its engraved scales" />
      </Figure>

      <h3>History &amp; Evolution</h3>
      <dl className="term-list">
        {ASTROLABE_HISTORY.map(({ term, description }) => (
          <div className="term-list-item" key={term}>
            <dt className="term-list-term">{term}</dt>
            <dd className="term-list-description">{description}</dd>
          </div>
        ))}
      </dl>
    </>
  );
}
