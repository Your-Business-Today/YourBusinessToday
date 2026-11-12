import { domainBrainPart, everyDomainPageKind } from '$lib/data/businessBrainDomain';
import { readPartKinds } from './readBusinessBrainIndex';
import type { SupabaseClient } from '@supabase/supabase-js';

/** A source the domain was filed from, and when. */
export type DomainSource = { sourceId: string; title: string; origin: string; filedAt: string };

const mostSourcesListed = 50;

/** The sources the organisation's domain pages were last filed from, newest first. */
export async function readDomainSources(supabase: SupabaseClient, organisationId: string): Promise<DomainSource[]> {
	const sourceIds = await readSourcesFiledFrom(supabase, organisationId);
	if (sourceIds.length === 0) return [];
	const { data, error } = await supabase
		.from('business_brain_sources')
		.select('id, title, origin, filed_at')
		.eq('organisation_id', organisationId)
		.in('id', sourceIds)
		.order('filed_at', { ascending: false })
		.limit(mostSourcesListed);
	if (error) throw error;
	return (data ?? []).map((row) => ({ sourceId: row.id as string, title: row.title as string, origin: row.origin as string, filedAt: row.filed_at as string }));
}

async function readSourcesFiledFrom(supabase: SupabaseClient, organisationId: string): Promise<string[]> {
	const partKinds = await readPartKinds(supabase, organisationId);
	const partId = [...partKinds.keys()].find((candidate) => partKinds.get(candidate) === domainBrainPart);
	if (partId === undefined) return [];
	const { data, error } = await supabase
		.from('business_brain_pages')
		.select('source_id')
		.eq('organisation_id', organisationId)
		.eq('part_id', partId)
		.in('kind', everyDomainPageKind)
		.not('source_id', 'is', null);
	if (error) throw error;
	return [...new Set((data ?? []).map((row) => row.source_id as string))];
}
