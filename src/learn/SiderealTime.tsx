export function SiderealTime() {
  return (
    <>
      <h3>Two kinds of day</h3>
      <p>
        Every clock on your wall keeps <strong>solar time</strong>: one full day is however long it
        takes the sun to return to the same spot in the sky — roughly overhead at noon, back overhead
        at noon tomorrow. That's 24 hours, by definition; it's the whole reason an hour is the length
        it is.
      </p>
      <p>
        But the sun returning to the same spot isn't the same thing as the Earth completing one full
        spin. While the Earth turns on its axis, it has also crept about 1/365th of the way around its
        orbit — so it has to rotate a little <em>past</em> a full turn to bring the sun back into view
        at the same place. That extra sliver is almost exactly four minutes. Measured instead against
        the far more distant stars, which don't shift with Earth's orbital creep, a full rotation —
        a <strong>sidereal day</strong> — takes just 23 hours, 56 minutes, 4 seconds. Shorter than a
        solar day, every single day, forever.
      </p>
      <p>
        That four-minute gap is small, but it compounds. Over 365-ish solar days it adds up to one
        entire extra sidereal rotation — which is exactly why, over the course of a year, the
        background stars appear to complete one extra lap around the sky relative to the sun. It's the
        same reason a given constellation rises about four minutes earlier each night, drifting
        noticeably across a season and swinging all the way around over a year. On this clock, it's
        why the zodiac ring doesn't stay still relative to the sun and moon hands: it's geared to the
        sidereal day, so it slowly laps the civil-time dials once a year, carrying each zodiac sign
        past the sun on the date that's traditionally "its" season.
      </p>

      <h3>The sky's own zero point</h3>
      <p>
        Civil time needs a reference point to count from (midnight, by convention). Sidereal time
        needs one too — and astronomers picked a specific point in the sky rather than a specific
        moment. Picture the sun's apparent yearly path against the stars (the <strong>ecliptic</strong>)
        crossing the sky's equator (the <strong>celestial equator</strong>, the Earth's equator
        projected outward onto the stars). There are two crossings; the one where the sun crosses
        heading north is the point the sun sits at on the March equinox, so it's called the{" "}
        <strong>vernal equinox point</strong> — or, in older astronomical language, the First Point of
        Aries. It works as a zero mark precisely because it's fixed relative to the stars: unlike the
        sun or the moon, it doesn't wander, so every other position in the sky can be measured against
        it consistently, year after year.
      </p>
      <p>
        The other half of the definition is the <strong>meridian</strong> — not a time-zone boundary,
        but a literal line in your local sky: the arc running from due north on your horizon, straight
        up through the <strong>zenith</strong> (the point directly overhead), down to due south. Because
        the Earth spins, every star appears to sweep across your sky from east to west and cross this
        line exactly once per sidereal day. That moment — a star reaching its highest point, dead
        centered overhead on the north–south line — is called its <strong>transit</strong>, or{" "}
        <strong>culmination</strong>.
      </p>
      <p>
        Put the two together: <strong>Local Sidereal Time is defined as 0h at the instant the vernal
        equinox point transits your local meridian.</strong> From there it counts up, at the sidereal
        rate, until that same point transits again roughly 23h56m later and the count rolls back to
        0h. It's a 24-"hour" cycle (conventionally still divided into 24 sidereal hours, each a little
        shorter than a civil hour) built entirely out of the sky's own geometry, with no reference to
        the sun at all.
      </p>

      <h3>Why anyone bothered measuring it</h3>
      <p>
        Astronomers gave every cataloged star a fixed sky-coordinate called{" "}
        <strong>right ascension</strong> — the sky's version of longitude, also measured in hours,
        counted eastward from that same vernal equinox point. The payoff of all the definitions above
        is one clean fact: <strong>whatever right ascension currently equals your Local Sidereal Time
        is the thing on your meridian right now</strong> — transiting, at its highest, best-placed
        point for observation, as far from the murk near the horizon as it will get all night. A star
        chart doesn't need to be redrawn for the date or the hour; it just needs you to know LST, and
        you instantly know what's directly overhead. It's also exactly what an old equatorial-mount
        telescope's hour-angle dial is reading: the gap between LST and whatever star you're pointed
        at.
      </p>

      <h3>Why the Orloj has a dial for it at all</h3>
      <p>
        This is the real reason the clock on Old Town Hall carries a star pointer rigidly fixed to its
        zodiac ring, geared to the sidereal day rather than the solar one: in 1410, telling the time of
        day was only one of the jobs an astronomical clock was built to do. Knowing the sidereal
        reading told you, at a glance and without a star chart, which constellations were rising, which
        were culminating, and which zodiac sign currently governed the sky overhead — information with
        real weight at the time, for astrology, for timing agricultural and religious observances tied
        to the stars, and as a public demonstration of just how precisely the era's astronomers
        understood the heavens' machinery. Building that into gears and dials, centuries before
        anything resembling an accurate solar clock was common, is a genuine engineering and
        scientific feat — not a toy, a working instrument.
      </p>
      <p>
        On <em>this</em> digital version, the star pointer's reading against the fixed Roman ring —
        shown as a Roman numeral in the info drawer — is that same Local Sidereal Time, computed live
        from the real formula rather than approximated. Watch it over a few minutes and you'll see it
        run visibly faster than the civil-time hand right next to it — about four minutes faster, every
        single day.
      </p>
    </>
  );
}
