import type { Look } from '../look'

/**
 * Head-on vector slot for look B. Proportions match the photographic asset
 * (1200x437) so the layout maths that positions the paper still holds, and
 * `preserveAspectRatio="none"` lets one drawing serve both the narrow receipt
 * slot and the wide photo slot.
 */
function FlatSlot({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 600 220" preserveAspectRatio="none" aria-hidden>
      <defs>
        <linearGradient id="ps-flat-bezel" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f2eeea" />
          <stop offset="0.18" stopColor="#d6d0cb" />
          <stop offset="0.5" stopColor="#bdb7b2" />
          <stop offset="0.82" stopColor="#cbc5c0" />
          <stop offset="1" stopColor="#9c9691" />
        </linearGradient>
        <linearGradient id="ps-flat-recess" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8e8883" />
          <stop offset="0.4" stopColor="#b2aca7" />
          <stop offset="1" stopColor="#e2ddd8" />
        </linearGradient>
        <linearGradient id="ps-flat-mouth" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#000" />
          <stop offset="0.35" stopColor="#0d0d0f" />
          <stop offset="1" stopColor="#262426" />
        </linearGradient>
      </defs>

      {/* proportions traced from the photographic asset: bezel 0.17-0.83 of
          height, aperture 0.41-0.56. The bezel is drawn with the aperture cut
          out of it so the paper behind shows through the hole. */}
      <path
        fillRule="evenodd"
        d="M12 38h576a11 11 0 0 1 11 11v122a11 11 0 0 1-11 11H12a11 11 0 0 1-11-11V49a11 11 0 0 1 11-11ZM36 91h528v31H36z"
        fill="url(#ps-flat-bezel)"
      />
      <path
        fillRule="evenodd"
        d="M12 38h576a11 11 0 0 1 11 11v122a11 11 0 0 1-11 11H12a11 11 0 0 1-11-11V49a11 11 0 0 1 11-11ZM36 91h528v31H36z"
        fill="none"
        stroke="rgba(40,34,30,0.32)"
        strokeWidth="1.4"
      />
      <rect x="8" y="42" width="584" height="2.5" rx="1.25" fill="rgba(255,255,255,0.5)" />

      {/* the lip the paper passes over */}
      <rect x="36" y="87" width="528" height="4.5" fill="rgba(0,0,0,0.42)" />
      <rect x="36" y="122" width="528" height="4" fill="rgba(255,255,255,0.55)" />
      <rect x="36" y="126" width="528" height="2" fill="rgba(0,0,0,0.14)" />
    </svg>
  )
}

export function SlotHardware({ look, wide, className }: { look: Look; wide?: boolean; className?: string }) {
  if (look === 'b') return <FlatSlot className={className} />
  // looks a/b use the variant with the aperture punched out, so paper can sit
  // inside the hole rather than below it
  // a runtime string, so it carries the deploy base itself
  const file =
    look === 'now'
      ? wide ? 'slot-wide.png' : 'slot.png'
      : wide ? 'slot-wide-open.png' : 'slot-open.png'
  const src = `${import.meta.env.BASE_URL}assets/${file}`
  return <img className={className} src={src} alt="" />
}
