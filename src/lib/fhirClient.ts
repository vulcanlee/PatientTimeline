import type { FhirBundle, FhirResource } from '../types/fhir'

const BASE_URL = import.meta.env.VITE_FHIR_BASE_URL ?? 'https://server.fire.ly'

function buildQuery(params: Record<string, string | undefined>): string {
  const query = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value) {
      query.set(key, value)
    }
  }
  return query.toString()
}

export async function fetchFhirResource<T extends FhirResource>(path: string): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: {
      Accept: 'application/fhir+json',
    },
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`FHIR request failed (${response.status}): ${text}`)
  }

  return (await response.json()) as T
}

export async function searchFhirResources<T extends FhirResource>(
  resourceType: string,
  params: Record<string, string | undefined>,
): Promise<T[]> {
  const query = buildQuery(params)
  const bundle = await fetchFhirResource<FhirBundle<T>>(`/${resourceType}?${query}`)
  return (bundle.entry ?? []).flatMap((entry) => (entry.resource ? [entry.resource] : []))
}
