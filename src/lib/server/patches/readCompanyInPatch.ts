import type { SupabaseClient } from '@supabase/supabase-js';
import { findRegisterStanding } from '$lib/server/clients/area/findRegisterStanding';
import { geocodePostcodes } from '$lib/server/postcodes/geocodePostcodes';
import { getRegisterCompany } from '$lib/server/register/getRegisterCompany';
import { listEventsForCompany } from '$lib/server/areaEvents/listEventsForCompany';
import { listFilingsForCompany } from '$lib/server/register/listFilingsForCompany';
import { listObservationsForCompany } from '$lib/server/observations/listObservations';
import { listPremisesBeside } from '$lib/server/premises/listPremisesBeside';
import { listSightingsForCompany } from '$lib/server/sightings/listSightingsForCompany';
import type { AreaEvent } from '$lib/data/areaEvent';
import type { ClassifiedFiling } from '$lib/server/companiesHouse/filingHistoryRecord';
import type { Observation } from '$lib/server/observations/observationRecord';
import type { Patch } from './patchRecord';
import type { Premises } from '$lib/server/premises/premisesRecord';
import type { RegisterCompany } from '$lib/server/register/registerCompanyRecord';
import type { RegisterStanding } from '$lib/server/clients/area/areaPin';
import type { Sighting } from '$lib/server/sightings/sightingRecord';

/** Everything known about one company in a patch, gathered once so a Claude can brief its person in one call. */
export type PatchCompanyReading = {
	company: RegisterCompany;
	standing: RegisterStanding | null;
	sightings: Sighting[];
	premisesBeside: Premises[];
	observations: Observation[];
	events: AreaEvent[];
	filings: ClassifiedFiling[];
};

export async function readCompanyInPatch(supabase: SupabaseClient, patch: Patch, companyNumber: string): Promise<PatchCompanyReading | null> {
	const company = await getRegisterCompany(supabase, companyNumber);
	if (company === null || !patch.outcodes.includes(company.outcode)) return null;
	const [standings, sightings, observations, events, filings] = await Promise.all([
		findRegisterStanding(supabase, [companyNumber]),
		listSightingsForCompany(supabase, companyNumber),
		listObservationsForCompany(supabase, companyNumber),
		listEventsForCompany(supabase, companyNumber),
		listFilingsForCompany(supabase, companyNumber)
	]);
	const premisesBeside = await premisesBesideSightings(supabase, patch, sightings);
	return { company, standing: standings.get(companyNumber) ?? null, sightings, premisesBeside, observations, events, filings };
}

/** Where a sighting with a postcode places the company, the premises within thirty metres of that postcode's point, each once. */
async function premisesBesideSightings(supabase: SupabaseClient, patch: Patch, sightings: Sighting[]): Promise<Premises[]> {
	const located = await geocodePostcodes(supabase, sightings.map((sighting) => sighting.postcode));
	const points = [...located.values()];
	const besideEachPoint = await Promise.all(points.map((point) => listPremisesBeside(supabase, patch.outcodes, point)));
	const premisesById = new Map(besideEachPoint.flat().map((one) => [one.id, one]));
	return [...premisesById.values()];
}
