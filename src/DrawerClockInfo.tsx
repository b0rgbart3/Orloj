import { explainClock, zodiacLabel } from './clock/explainClock'
import type { PragueDateParts, PragueTime } from './clock/usePragueTime'
import './DrawerClockInfo.css'

function pad(n: number) {
  return n.toString().padStart(2, '0')
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
      <p className="drawer-info-row">
        <img className="drawer-info-icon" src="/clock/icons/sun-icon.svg" alt="" />
        <span className="drawer-info-text">
          The <strong>Sun dial</strong> currently rests in the house of{' '}
          <strong>{zodiacLabel(e.sunSign)}</strong>.
        </span>
      </p>
      <p className="drawer-info-row">
        <img className="drawer-info-icon" src="/clock/icons/hand-icon.svg" alt="" />
        <span className="drawer-info-text">
          The <strong>hand</strong> points to <strong>{e.outerRingNumeral}</strong> on the gold
          outer ring.
        </span>
      </p>
      <p className="drawer-info-row">
        <img className="drawer-info-icon" src="/clock/icons/moon-icon.svg" alt="" />
        <span className="drawer-info-text">
          The <strong>Moon dial</strong> shows a <strong>{e.moonPhase}</strong> (
          {e.moonIllumination}% lit), resting in <strong>{zodiacLabel(e.moonSign)}</strong>.
        </span>
      </p>
      <p className="drawer-info-row">
        <img className="drawer-info-icon" src="/clock/icons/star-icon.svg" alt="" />
        <span className="drawer-info-text">
          The <strong>star dial</strong> rests over <strong>{zodiacLabel(e.starSign)}</strong>.
        </span>
      </p>
      <p className="drawer-info-row drawer-info-row--text-only">
        <span className="drawer-info-text">
          On the <strong>zodiac</strong> ring: Sun in {zodiacLabel(e.sunSign)}, Moon in{' '}
          {zodiacLabel(e.moonSign)}, stars over {zodiacLabel(e.starSign)}.
        </span>
      </p>
      <p className="drawer-info-row drawer-info-row--text-only">
        <span className="drawer-info-text">
          The <strong>outer ring</strong> reads{' '}
          <span className="drawer-info-nowrap">
            <strong>{e.outerRingNumeral}</strong>; the
          </span>{' '}
          <strong>inner ring</strong> reads <strong>{e.innerRingHour}</strong> old Bohemian hours
          since sunset.
        </span>
      </p>
    </div>
  )
}
