import { useLayoutEffect, useRef, useState } from 'react'
import { PhotoStrip } from './PhotoStrip'
import { ProfileReceipt, SessionReceipt } from './Receipt'
import { ProfileTab } from './ProfileTab'
import { SlotHardware } from './SlotHardware'
import type { SessionMeta } from '../types'
import type { Look } from '../look'

/** Kept in step with the transform transition declared on .ps-hero__out. */
const ZOOM_MS = 560

export function ResultDeck({
  cuts,
  meta,
  look,
  profile,
  onSave,
  onSaveProfile,
  onRestart,
  onOpenProfile,
}: {
  cuts: string[]
  meta: SessionMeta
  look: Look
  profile: boolean
  onSave: () => void
  onSaveProfile: () => void
  onRestart: () => void
  onOpenProfile: () => void
}) {
  const linkRef = useRef<HTMLButtonElement>(null)
  const heroRef = useRef<HTMLDivElement>(null)
  /** Where the compact ticket was standing when it was clicked. */
  const fromRect = useRef<DOMRect | null>(null)
  const [revealed, setRevealed] = useState(false)

  function open() {
    fromRect.current = linkRef.current?.getBoundingClientRect() ?? null
    onOpenProfile()
  }

  /*
   * FLIP: the hero is laid out where it belongs, then pushed back onto the
   * compact ticket's measured box for one frame and released. The zoom then
   * genuinely starts from the receipt the user clicked rather than from an
   * approximation of it, at any viewport size.
   */
  useLayoutEffect(() => {
    if (!profile) {
      setRevealed(false)
      return
    }
    const hero = heroRef.current
    const start = fromRect.current
    if (hero && start) {
      const to = hero.getBoundingClientRect()
      const scale = start.width / to.width
      hero.style.transition = 'none'
      hero.style.transform =
        `translate(${start.left - to.left}px, ${start.top - to.top}px) scale(${scale})`
      void hero.offsetWidth // flush, so the next assignment is a transition
      hero.style.transition = `transform ${ZOOM_MS}ms cubic-bezier(0.22, 0.61, 0.24, 1)`
      hero.style.transform = 'translate(0px, 0px) scale(1)'
    }
    const t = window.setTimeout(() => setRevealed(true), start ? ZOOM_MS + 40 : 60)
    return () => window.clearTimeout(t)
  }, [profile])

  return (
    <section className={profile ? 'ps-deck is-profile' : 'ps-deck'}>
      <div className="ps-deck__bay ps-deck__bay--strip">
        <span className="ps-cavity ps-cavity--wide" aria-hidden>
          <i />
        </span>
        <div className="ps-deck__out">
          <PhotoStrip cuts={cuts} sessionId={meta.id} />
        </div>
        <SlotHardware look={look} wide className="ps-deck__slot ps-deck__slot--wide" />
      </div>

      <div className="ps-deck__bay ps-deck__bay--receipt">
        <span className="ps-cavity" aria-hidden>
          <i />
        </span>
        <div className="ps-deck__out ps-deck__out--slow">
          <button
            ref={linkRef}
            className="ps-receipt-link"
            onClick={open}
            aria-label="View pup profile"
            tabIndex={profile ? -1 : 0}
          >
            <SessionReceipt meta={meta} />
            <ProfileTab />
          </button>
        </div>
        <SlotHardware look={look} className="ps-deck__slot" />
      </div>

      {profile && (
        <div className="ps-hero">
          <span className="ps-cavity" aria-hidden>
            <i />
          </span>
          <div className="ps-hero__out" ref={heroRef}>
            <ProfileReceipt meta={meta} revealed={revealed} />
          </div>
          <SlotHardware look={look} className="ps-deck__slot" />
        </div>
      )}

      <div className="ps-actions">
        {profile ? (
          <>
            {/* still the four cuts, never the blurred profile background */}
            <MachineButton label="SAVE PHOTO" onClick={onSave} />
            <MachineButton label="SAVE PROFILE" primary onClick={onSaveProfile} />
          </>
        ) : (
          <>
            <MachineButton label="SAVE PHOTO" primary onClick={onSave} />
            <MachineButton label="NEW SESSION" onClick={onRestart} />
          </>
        )}
      </div>
    </section>
  )
}

function MachineButton({
  label,
  primary,
  onClick,
}: {
  label: string
  primary?: boolean
  onClick: () => void
}) {
  return (
    <button className={primary ? 'ps-btn ps-btn--primary' : 'ps-btn'} onClick={onClick}>
      <span className="ps-btn__rivet" aria-hidden />
      <span className="t-caption">{label}</span>
      <span className="ps-btn__rivet" aria-hidden />
    </button>
  )
}
