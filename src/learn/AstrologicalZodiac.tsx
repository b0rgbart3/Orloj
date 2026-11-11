import { zodiacDateRange, zodiacName, zodiacSymbol } from "../clock/explainClock";
import type { ZodiacSign } from "../clock/zodiacHouses";

const SIGN_ORDER: ZodiacSign[] = [
  "aries",
  "taurus",
  "gemini",
  "cancer",
  "leo",
  "virgo",
  "libra",
  "scorpio",
  "sagittarius",
  "capricorn",
  "aquarius",
  "pisces",
];

type SignDetail = {
  element: string;
  rulingPlanet: string;
  description: string;
};

// Ruling planets given here are the classical ("traditional") rulers --
// the seven bodies visible to the naked eye, which is all 15th-century
// astrologers (and the Orloj's builders) had to work with. Uranus,
// Neptune, and Pluto weren't assigned modern rulerships until centuries
// after the clock was built.
const SIGN_DETAILS: Record<ZodiacSign, SignDetail> = {
  aries: {
    element: "Fire",
    rulingPlanet: "Mars",
    description:
      "The glyph is read as a ram's horns. The first sign of the zodiac, marking the point the sun crosses into the northern sky at the spring equinox -- traditionally associated with initiative and new starts.",
  },
  taurus: {
    element: "Earth",
    rulingPlanet: "Venus",
    description:
      "The glyph is a bull's head and horns. An earth sign, traditionally linked to steadiness, patience, and material groundedness.",
  },
  gemini: {
    element: "Air",
    rulingPlanet: "Mercury",
    description:
      "The glyph shows two upright figures side by side, representing the Twins. An air sign, traditionally tied to communication, duality, and quick thinking.",
  },
  cancer: {
    element: "Water",
    rulingPlanet: "the Moon",
    description:
      "The glyph is usually read as a pair of crab's claws. A water sign ruled by the Moon, traditionally associated with the home, memory, and emotional tides.",
  },
  leo: {
    element: "Fire",
    rulingPlanet: "the Sun",
    description:
      "The glyph traces a lion's mane and tail. The only sign ruled by the Sun itself, traditionally linked to confidence, performance, and leadership.",
  },
  virgo: {
    element: "Earth",
    rulingPlanet: "Mercury",
    description:
      "The glyph is usually read as a stylized 'm' with a crossed, folded final stroke. An earth sign traditionally associated with precision, service, and harvest-season order.",
  },
  libra: {
    element: "Air",
    rulingPlanet: "Venus",
    description:
      "The glyph is a balance beam and pan -- the Scales, the only inanimate object in the zodiac. Traditionally tied to balance, fairness, and the autumn equinox it marks.",
  },
  scorpio: {
    element: "Water",
    rulingPlanet: "Mars",
    description:
      "The glyph is the bull's-head-like loop of Taurus with an added barbed tail -- the Scorpion's sting. A water sign traditionally associated with intensity, transformation, and hidden depths.",
  },
  sagittarius: {
    element: "Fire",
    rulingPlanet: "Jupiter",
    description:
      "The glyph is a drawn arrow -- the Archer's shot. A fire sign traditionally linked to exploration, philosophy, and reaching beyond the immediate horizon.",
  },
  capricorn: {
    element: "Earth",
    rulingPlanet: "Saturn",
    description:
      "The glyph blends a goat's horns with a fish's tail, for the Sea-Goat. An earth sign marking the winter solstice, traditionally associated with discipline and long-term ambition.",
  },
  aquarius: {
    element: "Air",
    rulingPlanet: "Saturn",
    description:
      "The glyph is a pair of parallel wavy lines -- not the Water-Bearer's jug itself, but the water poured from it. An air sign despite the name, traditionally linked to invention and community.",
  },
  pisces: {
    element: "Water",
    rulingPlanet: "Jupiter",
    description:
      "The glyph shows two fish linked by a line, swimming in opposite directions. The last sign before the cycle repeats at Aries, traditionally associated with empathy and dissolving boundaries.",
  },
};

export function AstrologicalZodiac() {
  return (
    <>
      <p>
        The ring of twelve symbols circling the Orloj's dial -- and still visible, counter-rotating
        slowly through the year, on this digital version's zodiac ring -- is the Western tropical
        zodiac: twelve roughly month-long divisions of the sun's annual path against the stars, each
        with its own glyph, element, and classical ruling planet. Below is each sign in order, starting
        from Aries at the spring equinox.
      </p>
      <ol className="zodiac-list">
        {SIGN_ORDER.map((sign) => {
          const detail = SIGN_DETAILS[sign];
          return (
            <li key={sign} className="zodiac-list-item">
              <h4 className="zodiac-list-heading">
                <span className="zodiac-list-symbol" aria-hidden="true">
                  {zodiacSymbol(sign)}
                </span>
                {zodiacName(sign)}
                <span className="zodiac-list-dates">{zodiacDateRange(sign)}</span>
              </h4>
              <p>
                {detail.element} sign, ruled by {detail.rulingPlanet} (traditional). {detail.description}
              </p>
            </li>
          );
        })}
      </ol>
      <p>
        On the clock itself, the zodiac ring is geared to sidereal rather than solar time, so it slowly
        laps the sun and moon hands over the course of a year -- carrying each sign past the sun dial on
        roughly the date traditionally considered "its" season. See{" "}
        <a href="#learn/sidereal-time">Local Sidereal Time</a> for why that gearing choice was worth
        building into gears at all.
      </p>
    </>
  );
}
