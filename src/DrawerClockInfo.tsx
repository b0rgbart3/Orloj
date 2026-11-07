import { explainClock, HAND_COLOR_NAME, zodiacDateRange, zodiacName, zodiacSymbol } from './clock/explainClock'
import type { HandId, ZodiacSign } from './clock/zodiacHouses'
import type { PragueDateParts, PragueTime } from './clock/usePragueTime'
import './DrawerClockInfo.css'

function pad(n: number) {
  return n.toString().padStart(2, '0')
}

function ZodiacLabel({ sign }: { sign: ZodiacSign }) {
  return (
    <>
      {zodiacName(sign)} <span className="zodiac-symbol">{zodiacSymbol(sign)}</span>
    </>
  )
}

const HAND_LABEL: Record<HandId, string> = {
  sun: 'sun',
  moon: 'moon',
}

/** The clause explaining which color actually paints a dial's wedge, once
 * the sun-beats-moon-beats-star priority rule has resolved any ties. */
function HighlightNote({ hand, winner }: { hand: HandId; winner: HandId }) {
  const color = HAND_COLOR_NAME[winner]
  if (winner === hand) {
    return (
      <>
        , highlighting that wedge on the zodiac ring in <strong>{color}</strong>
      </>
    )
  }
  return (
    <>
      , sharing that wedge with the {HAND_LABEL[winner]}, so it shows the {HAND_LABEL[winner]}'s{' '}
      <strong>{color}</strong> rather than its own
    </>
  )
}

type DrawerClockInfoProps = {
  pragueTime: PragueTime
  dateParts: PragueDateParts
}

export function DrawerClockInfo({ pragueTime, dateParts }: DrawerClockInfoProps) {
  const e = explainClock(pragueTime)

  return (
    <div className="drawer-info">
      <p className="drawer-info-datetime">
        {dateParts.month} {dateParts.day}, {dateParts.year}{' '}
        <span className="drawer-info-datetime-separator">|</span> {pad(pragueTime.hours)}:
        {pad(pragueTime.minutes)}
      </p>
      <p className="drawer-info-datetime">At this moment:</p>
      <table className="drawer-info-table">
        <tbody>
          <tr>
            <td className="drawer-info-table-icon">
              <img className="drawer-info-icon" src="/clock/icons/sun-icon.svg" alt="" />
            </td>
            <td className="drawer-info-table-label">Sun</td>
            <td className="drawer-info-table-value">
              <ZodiacLabel sign={e.sunSign} />
              <span
                className="drawer-swatch"
                style={{ background: HAND_COLOR_NAME[e.sunHighlightHand] }}
              />
            </td>
          </tr>
          <tr>
            <td className="drawer-info-table-icon">
              <img className="drawer-info-icon" src="/clock/icons/moon-icon.svg" alt="" />
            </td>
            <td className="drawer-info-table-label">Moon</td>
            <td className="drawer-info-table-value">
              <ZodiacLabel sign={e.moonSign} />
              <span
                className="drawer-swatch"
                style={{ background: HAND_COLOR_NAME[e.moonHighlightHand] }}
              />
              <span className="drawer-info-table-sub">
                {e.moonPhase}, {e.moonIllumination}% lit
              </span>
            </td>
          </tr>
          <tr>
            <td className="drawer-info-table-icon">
              <img className="drawer-info-icon drawer-info-icon--star" src="/clock/icons/star-icon.svg" alt="" />
            </td>
            <td className="drawer-info-table-label">Star</td>
            <td className="drawer-info-table-value">
              {e.starRingNumeral} <span className="drawer-info-table-sub-inline">sidereal</span>
            </td>
          </tr>
          <tr>
            <td className="drawer-info-table-icon">
              <img className="drawer-info-icon" src="/clock/icons/hand-icon.svg" alt="" />
            </td>
            <td className="drawer-info-table-label">Hand</td>
            <td className="drawer-info-table-value">
              {e.innerRingNumeral} <span className="drawer-info-table-sub-inline">inner</span>
              {' · '}
              {e.outerRingHour} <span className="drawer-info-table-sub-inline">outer</span>
            </td>
          </tr>
        </tbody>
      </table>
      <p className="drawer-info-row">
        <img className="drawer-info-icon" src="/clock/icons/sun-icon.svg" alt="" />
        <span className="drawer-info-text">
          The <strong>sun dial</strong> currently rests in the house of{' '}
          <strong><ZodiacLabel sign={e.sunSign} /></strong>
          <HighlightNote hand="sun" winner={e.sunHighlightHand} />. This marks the sun's real
          position against the zodiac for today, so anyone born on this day is considered a{' '}
          <strong>{zodiacName(e.sunSign)}</strong>, because the sun is in the house of{' '}
          {zodiacName(e.sunSign)} during the date range{' '}
          <strong>{zodiacDateRange(e.sunSign)}</strong>.
        </span>
      </p>
      <div className="drawer-info-row">
        <img className="drawer-info-icon" src="/clock/icons/hand-icon.svg" alt="" />
        <div className="drawer-info-text">
          <p className="drawer-info-subpara">
            The <strong>hand</strong> points to <strong>{e.innerRingNumeral}</strong> on the inner
            ring. That's the current civil hour — the same hour you'd read off an ordinary clock,
            with each numeral marking two different hours as the hand sweeps around twice a day.
            (The value a 12-hour clock would show, as opposed to the modern European-style 24-hour
            clock.) It's one hand doing double duty: that same tip also reaches a numeral on the
            outer ring.
          </p>
          <p className="drawer-info-subpara">
            That same <strong>hand</strong> also reads{' '}
            <strong>{e.outerRingHour}</strong> on the <strong>outer ring</strong> — old Bohemian
            hours count from 1 at sunset rather than from midnight, so this means{' '}
            <strong>{e.outerRingHour}</strong> hour{e.outerRingHour === 1 ? '' : 's'}{' '}
            {e.outerRingHour === 1 ? 'has' : 'have'} passed since the sun went down today. As with
            the inner ring, it's the numeral under the hand that counts, not whatever sits at the
            very top — the outer ring itself slowly turns over the course of the year so its own
            "24" always lines up with the hand at the exact moment of sunset.
          </p>
        </div>
      </div>
      <p className="drawer-info-row">
        <img className="drawer-info-icon" src="/clock/icons/moon-icon.svg" alt="" />
        <span className="drawer-info-text">
          The <strong>moon dial</strong> shows a <strong>{e.moonPhase}</strong> (
          {e.moonIllumination}% lit), resting in <strong><ZodiacLabel sign={e.moonSign} /></strong>
          <HighlightNote hand="moon" winner={e.moonHighlightHand} />. Unlike the sun's sign, the
          moon drifts into a new house every couple of days, so this isn't a lasting birth trait —
          it's simply where the moon is passing through today, the kind of placement used in
          day-to-day lunar astrology rather than a permanent personal sign.
        </span>
      </p>
      <p className="drawer-info-row">
        <img className="drawer-info-icon drawer-info-icon--star" src="/clock/icons/star-icon.svg" alt="" />
        <span className="drawer-info-text">
          The <strong>star pointer</strong> currently reads <strong>{e.starRingNumeral}</strong> on
          the fixed Roman ring — true{' '}
          <a href="#learn/sidereal-time">Local Sidereal Time</a>, the stars' own clock, which runs
          about four minutes a day faster than civil time. It shares its spindle rigidly with the zodiac
          ring itself, so unlike the sun and moon it never settles into a zodiac house of its own
          (mechanically, it's stuck over the same wedge every day, whatever the date) — which is
          why it isn't highlighted on the ring the way the sun's and moon's positions are, and
          carries none of their birth-sign meaning.
        </span>
      </p>
    </div>
  )
}
