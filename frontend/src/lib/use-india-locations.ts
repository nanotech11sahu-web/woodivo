import statesData from '@/data/india-states-cities.json';

// Sourced from the Government of India tehsil/district reference list
// (state -> district), used here as our State -> City dataset since the
// enquiry form only needs city-level granularity, not full tehsil detail.
const STATE_CITY_MAP = statesData as Record<string, string[]>;

export const INDIAN_STATES = Object.keys(STATE_CITY_MAP).sort();

export function getCitiesForState(state: string | undefined | null): string[] {
  if (!state) return [];
  return STATE_CITY_MAP[state] ?? [];
}
