import type { ReactNode } from 'react'
import type { Look } from '../look'
import { SlotHardware } from './SlotHardware'

export function PrinterModule({ look, children }: { look: Look; children: ReactNode }) {
  return (
    <aside className="ps-printer">
      {/* the dark inside of the machine, seen through the aperture */}
      <span className="ps-cavity ps-cavity--printer" aria-hidden>
        <i />
      </span>
      <div className="ps-printer__paper">{children}</div>
      <SlotHardware look={look} className="ps-printer__slot" />
    </aside>
  )
}
