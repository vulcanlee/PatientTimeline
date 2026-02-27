export interface FhirResource {
  resourceType: string
  id?: string
  [key: string]: unknown
}

export interface FhirBundle<T extends FhirResource = FhirResource> extends FhirResource {
  resourceType: 'Bundle'
  entry?: Array<{ resource?: T }>
}

export interface FhirPatient extends FhirResource {
  resourceType: 'Patient'
  birthDate?: string
  gender?: string
  identifier?: Array<{ value?: string }>
  name?: Array<{ given?: string[]; family?: string; text?: string }>
}

export interface FhirEncounter extends FhirResource {
  resourceType: 'Encounter'
  period?: { start?: string; end?: string }
  type?: Array<{ text?: string; coding?: Array<{ display?: string }> }>
  serviceProvider?: { reference?: string }
}

export type TimelineItemType =
  | 'Encounter'
  | 'Condition'
  | 'Observation'
  | 'Procedure'
  | 'DiagnosticReport'
  | 'DocumentReference'
  | 'MedicationRequest'
  | 'AllergyIntolerance'
  | 'Immunization'
  | 'Device'

export interface TimelineItem {
  id: string
  type: TimelineItemType
  start: string
  end?: string
  title: string
  summary?: string
  encounterId?: string
  raw: FhirResource
}
