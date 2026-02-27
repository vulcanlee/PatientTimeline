import { useQuery } from '@tanstack/react-query'
import { fetchFhirResource, searchFhirResources } from '../../lib/fhirClient'
import { buildTimelineItems, groupByEncounter } from '../timeline/mapToTimelineItems'
import type { FhirEncounter, FhirPatient, FhirResource, TimelineItemType } from '../../types/fhir'

const RESOURCE_TYPES: Exclude<TimelineItemType, 'Encounter'>[] = [
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

export function usePatientTimelineData(
  patientId: string,
  startDate?: string,
  endDate?: string,
  enabled = true,
) {
  return useQuery({
    queryKey: ['patient-timeline', patientId, startDate, endDate],
    enabled: enabled && !!patientId,
    queryFn: async () => {
      const patient = await fetchFhirResource<FhirPatient>(`/Patient/${patientId}`)
      const encounterDate =
        startDate && endDate ? `ge${startDate},le${endDate}` : startDate ? `ge${startDate}` : undefined

      const encounters = await searchFhirResources<FhirEncounter>('Encounter', {
        patient: patientId,
        _sort: '-date',
        _count: '200',
        date: encounterDate,
      })

      const relatedBatches = await Promise.all(
        RESOURCE_TYPES.map((type) =>
          searchFhirResources<FhirResource>(type, {
            patient: patientId,
            _count: '200',
          }),
        ),
      )

      const relatedResources = relatedBatches.flat()
      const timelineItems = buildTimelineItems(encounters, relatedResources)
      const grouped = groupByEncounter(timelineItems)

      return {
        patient,
        encounters,
        timelineItems,
        relatedResources,
        ...grouped,
      }
    },
  })
}
