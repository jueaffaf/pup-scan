/**
 * The pull tab bolted to the right edge of the session receipt, traced from
 * the Figma control at 141:245. Its left edge is pinned to the paper — on
 * hover the strip does not slide away, it *stretches* outward, which is what
 * a tab being drawn out of a slot actually does.
 */
export function ProfileTab() {
  return (
    <span className="ps-tab" aria-hidden>
      <span className="ps-tab__rivet" />
      <span className="ps-tab__label">VIEW PROFILE&nbsp;&nbsp;&rarr;</span>
    </span>
  )
}
