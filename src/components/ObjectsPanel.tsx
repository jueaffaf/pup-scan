import type { IgnoredObject } from '../types'
import { PROFILE_ROWS } from '../dogProfile'

interface Row {
  field: string
  value: string
}

/** SEARCHING: everything the model saw, all of it ignored. */
export function IgnoredPanel({ objects }: { objects: IgnoredObject[] }) {
  const rows: Row[] = objects.length
    ? objects.map((o) => ({ field: `${o.label} ${o.count}`, value: 'IGNORED' }))
    : [{ field: 'NOTHING YET', value: 'SCANNING' }]
  return <Panel title="OBJECTS" rows={rows} />
}

/** DETECTED onward: the dog is the only thing worth describing. */
export function AnalysisPanel({ score }: { score: number }) {
  return (
    <Panel
      title="ANALYSIS"
      rows={[
        { field: 'OBJECT', value: 'DOG' },
        { field: 'CONFIDENCE', value: `${(score * 100).toFixed(1)}%` },
        ...PROFILE_ROWS.map(([field, value]) => ({ field, value })),
      ]}
    />
  )
}

function Panel({ title, rows }: { title: string; rows: Row[] }) {
  return (
    <aside className="ps-panel">
      <span className="t-panel ps-panel__title">{title}</span>
      <span className="ps-panel__rule" />
      {rows.map((r) => (
        <div className="ps-panel__row" key={r.field}>
          <span className="t-field">{r.field}</span>
          <span className="t-value ps-panel__value">{r.value}</span>
        </div>
      ))}
    </aside>
  )
}
