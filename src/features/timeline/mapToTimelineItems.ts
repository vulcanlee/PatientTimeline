import type { FhirEncounter, FhirResource, TimelineItem, TimelineItemType } from '../../types/fhir'

const RESOURCE_TYPES: TimelineItemType[] = [
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

function getReferenceId(reference?: string): string | undefined {
  if (!reference) return undefined
  const parts = reference.split('/')
  return parts[parts.length - 1]
}

function getEncounterFromResource(resource: FhirResource): string | undefined {
  const encounterRef = (resource.encounter as { reference?: string } | undefined)?.reference
  if (encounterRef) return getReferenceId(encounterRef)

  if (resource.resourceType === 'DocumentReference') {
    const context = resource.context as { encounter?: Array<{ reference?: string }> } | undefined
    return getReferenceId(context?.encounter?.[0]?.reference)
  }

  return undefined
}

function getResourceDate(resource: FhirResource): string | undefined {
  const candidates = [
    resource.recordedDate,
    resource.authoredOn,
    resource.issued,
    resource.date,
    resource.occurrenceDateTime,
    (resource.effectivePeriod as { start?: string } | undefined)?.start,
    resource.effectiveDateTime,
    (resource.performedPeriod as { start?: string } | undefined)?.start,
  ]

  return candidates.find((value): value is string => typeof value === 'string')
}

function getDisplay(resource: FhirResource): { title: string; summary?: string } {
  const code = resource.code as { text?: string; coding?: Array<{ display?: string }> } | undefined
  const display = code?.text ?? code?.coding?.[0]?.display
  return {
    title: display ?? resource.resourceType,
    summary: resource.status as string | undefined,
  }
}

export function buildTimelineItems(encounters: FhirEncounter[], related: FhirResource[]): TimelineItem[] {
  const encounterItems: TimelineItem[] = encounters.map((encounter) => {
    const start = encounter.period?.start ?? new Date(0).toISOString()
    const title =
      encounter.type?.[0]?.text ?? encounter.type?.[0]?.coding?.[0]?.display ?? 'Encounter'

    return {
      id: `Encounter/${encounter.id}`,
      type: 'Encounter',
      start,
      end: encounter.period?.end,
      title,
      raw: encounter,
    }
  })

  const clinicalItems: TimelineItem[] = related
    .filter((resource) => RESOURCE_TYPES.includes(resource.resourceType as TimelineItemType))
    .map((resource) => {
      const start = getResourceDate(resource) ?? new Date(0).toISOString()
      const info = getDisplay(resource)
      return {
        id: `${resource.resourceType}/${resource.id ?? crypto.randomUUID()}`,
        type: resource.resourceType as TimelineItemType,
        start,
        title: info.title,
        summary: info.summary,
        encounterId: getEncounterFromResource(resource),
        raw: resource,
      }
    })

  return [...encounterItems, ...clinicalItems].sort((a, b) => b.start.localeCompare(a.start))
}

export function groupByEncounter(items: TimelineItem[]): {
  byEncounter: Map<string, TimelineItem[]>
  patientLevel: TimelineItem[]
} {
  const byEncounter = new Map<string, TimelineItem[]>()
  const patientLevel: TimelineItem[] = []

  for (const item of items) {
    if (item.type === 'Encounter') {
      const encounterId = item.id.split('/')[1]
      byEncounter.set(encounterId, [item])
      continue
    }

    if (item.encounterId && byEncounter.has(item.encounterId)) {
      byEncounter.get(item.encounterId)!.push(item)
    } else {
      patientLevel.push(item)
    }
  }

  return { byEncounter, patientLevel }
}
