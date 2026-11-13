import { organisationDomainOf } from './organisationDomainOf';
import { readDomainPages } from './readDomainPages';
import type { StationDomain } from '$lib/data/domainReading';
import type { SupabaseClient } from '@supabase/supabase-js';

/** The organisation's things and rules as a station of its workflow map names them; none before a domain is filed. */
export async function readStationDomain(supabase: SupabaseClient, organisationId: string): Promise<StationDomain> {
	const domain = organisationDomainOf(await readDomainPages(supabase, { organisationId, projectId: null }));
	if (domain === null) return { thingTitles: {}, rules: [] };
	const thingTitles = Object.fromEntries(domain.things.map((thing) => [thing.slug, thing.title]));
	return { thingTitles, rules: domain.rules };
}
