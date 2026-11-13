import type { SupabaseClient } from '@supabase/supabase-js';
import { readBodiesByPageId } from './readBodiesByPageId';
import { readPageSources } from './readPageSources';
import { thingPageWordsOf, type ThingPageWords } from '$lib/data/thingPageWords';
import type { DomainSource } from './readDomainSources';

/** What a thing's page says beyond its facts, and every source it was filed from. */
export type ThingPage = ThingPageWords & { sources: DomainSource[] };

export async function readThingPage(supabase: SupabaseClient, organisationId: string, pageId: string): Promise<ThingPage> {
	const [bodies, sources] = await Promise.all([
		readBodiesByPageId(supabase, organisationId, [pageId]),
		readPageSources(supabase, organisationId, pageId)
	]);
	const body = bodies.get(pageId) ?? '';
	return { ...thingPageWordsOf(body), sources };
}
