import { useMemo, useState } from 'react'
import { DetailsPanel } from '../details/DetailsPanel'
import { TimelineView } from '../timeline/TimelineView'
import { usePatientTimelineData } from './usePatientTimelineData'
import type { TimelineItem, TimelineItemType } from '../../types/fhir'

const defaultTypes: TimelineItemType[] = [
  'Encounter',
  'Condition',
  'Observation',
  'Procedure',
  'DiagnosticReport',
  'DocumentReference',
  'MedicationRequest',
  'AllergyIntolerance',
  'Immunization',
  'Device',
]

const initialFilters = defaultTypes.reduce(
  (acc, type) => ({ ...acc, [type]: true }),
  {} as Record<TimelineItemType, boolean>,
)

export function PatientTimelinePage() {
  const [patientId, setPatientId] = useState('129c6ac7-8d06-89de-ad63-0204a93e76c3')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [submitted, setSubmitted] = useState('')
  const [filters, setFilters] = useState(initialFilters)
  const [selected, setSelected] = useState<TimelineItem | null>(null)

  const query = usePatientTimelineData(submitted, startDate || undefined, endDate || undefined, !!submitted)

  const summaryName = useMemo(() => {
    const name = query.data?.patient.name?.[0]
    if (!name) return 'Unknown'
    return name.text ?? `${name.given?.join(' ') ?? ''} ${name.family ?? ''}`.trim()
  }, [query.data?.patient.name])

  return (
    <main className="layout">
      <section className="header">
        <h1>FHIR Patient Timeline</h1>
        <div className="controls">
          <input value={patientId} onChange={(e) => setPatientId(e.target.value)} placeholder="Patient ID" />
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          <button type="button" onClick={() => setSubmitted(patientId.trim())}>
            Load
          </button>
        </div>
      </section>

      <section className="summary">
        {query.isLoading ? <p>Loading patient data...</p> : null}
        {query.error ? <p className="error">{(query.error as Error).message}</p> : null}
        {query.data ? (
          <>
            <h2>{summaryName}</h2>
            <p>
              Gender: {query.data.patient.gender ?? 'unknown'} | Birth Date: {query.data.patient.birthDate ?? 'unknown'}
            </p>
            <p>Encounters: {query.data.encounters.length}</p>
          </>
        ) : (
          <p>Enter a patient ID and click Load.</p>
        )}
      </section>

      <section className="filters">
        {defaultTypes.map((type) => (
          <label key={type}>
            <input
              type="checkbox"
              checked={filters[type]}
              onChange={(e) => setFilters((prev) => ({ ...prev, [type]: e.target.checked }))}
            />
            {type}
          </label>
        ))}
      </section>

      {query.data ? (
        <div className="content">
          <TimelineView
            groupedByEncounter={query.data.byEncounter}
            patientLevel={query.data.patientLevel}
            selectedId={selected?.id}
            filters={filters}
            onSelect={setSelected}
          />
          <DetailsPanel selected={selected} />
        </div>
      ) : null}
    </main>
  )
}
