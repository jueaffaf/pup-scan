import { Barcode } from './Barcode'
import { PixelPaw } from './PixelPaw'
import type { SessionMeta } from '../types'
import { funRatings } from '../utils/session'
import { CLASSIFICATION, DOG_PROFILE, PROFILE_ROWS, PROFILE_ROWS_LONG } from '../dogProfile'

type Variant = 'searching' | 'ready' | 'countdown'

function CameraMark() {
  return (
    <svg width="34" height="26" viewBox="0 0 34 26" fill="none" aria-hidden>
      <rect x="1" y="6" width="32" height="19" rx="3" stroke="currentColor" strokeWidth="1.7" />
      <path d="M11 6l2-4.4h8L23 6" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <circle cx="17" cy="15.5" r="5.4" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="17" cy="15.5" r="1.7" fill="currentColor" />
    </svg>
  )
}

export function Receipt({
  variant,
  score,
  count,
  seed,
}: {
  variant: Variant
  score: number
  count: number
  seed: string
}) {
  return (
    <div className={`ps-receipt ps-receipt--${variant}`} key={variant}>
      <div className="ps-receipt__body">
        {variant === 'searching' && (
          <>
            <h1 className="ps-receipt__headline">
              NO DOG
              <br />
              NO PHOTO!
            </h1>
            <span className="ps-receipt__rule" />
            <p className="ps-receipt__meta">
              DOG REQUIRED
              <br />
              TO UNLOCK
            </p>
          </>
        )}

        {variant === 'ready' && (
          <>
            <h1 className="ps-receipt__headline">
              READY
              <br />
              FOR PHOTO
            </h1>
            <span className="ps-receipt__rule" />
            <p className="ps-receipt__meta">
              OBJECT FOUND &mdash; DOG
              <br />
              STATUS &mdash; VERIFIED
              <br />
              CONFIDENCE &mdash; {(score * 100).toFixed(1)}%
              <br />
              CAMERA &mdash; READY
            </p>
          </>
        )}

        {variant === 'countdown' && (
          <>
            <span className="t-caption ps-receipt__kicker">GET READY</span>
            <div className="ps-receipt__numerals">
              {[3, 2, 1].map((n, i) => (
                <div key={n}>
                  {i > 0 && <span className="ps-receipt__rule ps-receipt__rule--wide" />}
                  <span className={`ps-receipt__num ${count === n ? 'is-now' : ''}`}>{n}</span>
                </div>
              ))}
            </div>
            <span className="t-caption">SMILE!</span>
          </>
        )}
      </div>

      <span className="ps-receipt__mark">
        {variant === 'countdown' ? <CameraMark /> : variant === 'ready' ? <PixelPaw size={28} /> : null}
      </span>

      <span className="ps-receipt__code">
        <Barcode seed={seed} />
      </span>
    </div>
  )
}

/** The compact ticket printed on 04 RESULT, next to the four cuts. */
export function SessionReceipt({ meta }: { meta: SessionMeta }) {
  const r = funRatings(meta.id)
  return (
    <div className="ps-receipt ps-receipt--session">
      <div className="ps-receipt__body">
        <Row k="PUP.SCAN SESSION" v={`#${meta.id}`} />
        <Dashed />
        <Row k="DATE" v={meta.date} />
        <Row k="TIME" v={meta.time} />
        <Dashed />
        <Row k="OBJECT" v="DOG" />
        <Row k="CONFIDENCE" v={`${(meta.confidence * 100).toFixed(1)}%`} />
        <Dashed />
        {PROFILE_ROWS.map(([k, v]) => (
          <Row key={k} k={k} v={v} />
        ))}
        <Dashed />
        <Row k="FLUFFINESS" v={`${r.fluffiness}%`} />
        <Row k="GOODNESS" v={`${r.goodness}%`} />
        <Row k="ATTITUDE" v={`${r.attitude}%`} />
        <Dashed />
        <div className="ps-class ps-class--compact">
          <span className="t-row ps-receipt__k">CLASSIFICATION</span>
          <span className="ps-class__v">{CLASSIFICATION}</span>
        </div>
        <Dashed />
        <h2 className="ps-receipt__certified">
          CERTIFIED
          <br />
          VERY GOOD DOG
        </h2>
      </div>
      <span className="ps-receipt__code">
        <Barcode seed={meta.id} width={260} />
      </span>
      <span className="ps-receipt__caption">
        <span className="t-caption">THANK YOU!</span>
        <PixelPaw size={28} />
      </span>
    </div>
  )
}

/**
 * The same ticket, enlarged into the hero object of 05 PUP PROFILE. Same
 * session data — nothing here is generated a second time — laid out with room
 * for score bars and the classification block.
 */
export function ProfileReceipt({ meta, revealed }: { meta: SessionMeta; revealed: boolean }) {
  const r = funRatings(meta.id)
  const [breedRow, ...traitRows] = PROFILE_ROWS_LONG

  return (
    <div className={`ps-receipt ps-receipt--session ps-receipt--profile${revealed ? ' is-revealed' : ''}`}>
      <div className="ps-receipt__body">
        <div className="ps-receipt__doc">
          <h2 className="ps-receipt__doctitle">PUP.SCAN DOG PROFILE</h2>
          <Row k="PUP ID" v={`#${meta.id}`} />
        </div>
        <Dashed />
        <Row k="DATE" v={meta.date} />
        <Row k="TIME" v={meta.time} />
        <Dashed />
        <Row k="PRIMARY SUBJECT" v="DOG" />
        <Row k="DETECTION CONFIDENCE" v={`${(meta.confidence * 100).toFixed(1)}%`} />
        <Dashed />

        <Reveal step={1}>
          <Row k={breedRow[0]} v={breedRow[1]} />
        </Reveal>
        <Reveal step={2}>
          {traitRows.map(([k, v]) => (
            <Row key={k} k={k} v={v} />
          ))}
        </Reveal>
        <Dashed />

        <Reveal step={3} className="ps-scores">
          <Score label="FLUFFINESS" value={r.fluffiness} on={revealed} />
          <Score label="GOODNESS" value={r.goodness} on={revealed} />
          <Score label="ATTITUDE" value={r.attitude} on={revealed} />
        </Reveal>
        <Dashed />

        <Reveal step={4} className="ps-class">
          <span className="t-row ps-receipt__k">PUP ID</span>
          <span className="ps-class__id">#{meta.id}</span>
          <span className="t-row ps-receipt__k ps-class__gap">CLASSIFICATION</span>
          <span className="ps-class__v">
            {DOG_PROFILE.classification.map((line, i) => (
              <span key={line} className="ps-class__line">
                {i > 0 && <br />}
                {line}
              </span>
            ))}
          </span>
        </Reveal>

        <Reveal step={5}>
          <h2 className="ps-receipt__certified">
            CERTIFIED
            <br />
            VERY GOOD DOG
          </h2>
        </Reveal>
      </div>

      <span className="ps-receipt__code">
        <Barcode seed={meta.id} width={312} height={32} />
      </span>
      <span className="t-value ps-receipt__auth">AUTHORIZED COMPANION: HUMAN</span>
      <span className="ps-receipt__caption">
        <span className="t-caption">THANK YOU!</span>
        <PixelPaw size={28} />
      </span>
    </div>
  )
}

/** One staged group of the profile reveal. `step` orders it in the sequence. */
function Reveal({
  step,
  className,
  children,
}: {
  step: number
  className?: string
  children: React.ReactNode
}) {
  return (
    <div
      className={className ? `ps-reveal ${className}` : 'ps-reveal'}
      style={{ ['--step' as string]: step } as React.CSSProperties}
    >
      {children}
    </div>
  )
}

function Score({ label, value, on }: { label: string; value: number; on: boolean }) {
  return (
    <div className="ps-score">
      <div className="ps-receipt__kv">
        <span className="t-row ps-receipt__k">{label}</span>
        <span className="t-row">{value}%</span>
      </div>
      <span className="ps-score__track">
        <i style={{ width: on ? `${value}%` : '0%' }} />
      </span>
    </div>
  )
}

const Row = ({ k, v }: { k: string; v: string }) => (
  <div className="ps-receipt__kv">
    <span className="t-row ps-receipt__k">{k}</span>
    <span className="t-row">{v}</span>
  </div>
)

const Dashed = () => <span className="ps-receipt__dashed" aria-hidden />
