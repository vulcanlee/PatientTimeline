import type { TimelineItem } from '../../types/fhir'

interface Props {
  selected: TimelineItem | null
}

export function DetailsPanel({ selected }: Props) {
  if (!selected) {
    return <aside className="panel">Select an item to inspect details.</aside>
  }

  return (
    <aside className="panel">
      <h3>{selected.title}</h3>
      <p>
        <strong>Type:</strong> {selected.type}
      </p>
      <p>
        <strong>Start:</strong> {selected.start}
      </p>
      {selected.end ? (
        <p>
          <strong>End:</strong> {selected.end}
        </p>
      ) : null}
      {selected.summary ? (
        <p>
          <strong>Summary:</strong> {selected.summary}
        </p>
      ) : null}
      <details open>
        <summary>Raw JSON</summary>
        <pre>{JSON.stringify(selected.raw, null, 2)}</pre>
      </details>
    </aside>
  )
}
