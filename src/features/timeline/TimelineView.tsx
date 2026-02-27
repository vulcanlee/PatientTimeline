import type { TimelineItem, TimelineItemType } from '../../types/fhir'

interface Props {
  groupedByEncounter: Map<string, TimelineItem[]>
  patientLevel: TimelineItem[]
  selectedId?: string
  filters: Record<TimelineItemType, boolean>
  onSelect: (item: TimelineItem) => void
}

function matchesFilter(item: TimelineItem, filters: Record<TimelineItemType, boolean>) {
  return filters[item.type]
}

export function TimelineView({
  groupedByEncounter,
  patientLevel,
  selectedId,
  filters,
  onSelect,
}: Props) {
  return (
    <section className="timeline">
      <h2>Timeline</h2>
      {[...groupedByEncounter.entries()].map(([encounterId, items]) => (
        <div key={encounterId} className="encounter-group">
          <h3>Encounter {encounterId}</h3>
          <ul>
            {items.filter((item) => matchesFilter(item, filters)).map((item) => (
              <li key={item.id}>
                <button
                  className={selectedId === item.id ? 'selected' : ''}
                  onClick={() => onSelect(item)}
                  type="button"
                >
                  <span>{item.start}</span>
                  <strong>{item.type}</strong>
                  <span>{item.title}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}

      <div className="encounter-group">
        <h3>Patient-level events</h3>
        <ul>
          {patientLevel.filter((item) => matchesFilter(item, filters)).map((item) => (
            <li key={item.id}>
              <button
                className={selectedId === item.id ? 'selected' : ''}
                onClick={() => onSelect(item)}
                type="button"
              >
                <span>{item.start}</span>
                <strong>{item.type}</strong>
                <span>{item.title}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
