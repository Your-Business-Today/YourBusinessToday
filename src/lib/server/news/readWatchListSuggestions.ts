import { organisationDomainOf } from '$lib/server/businessBrain/organisationDomainOf';
import { readDomainPages } from '$lib/server/businessBrain/readDomainPages';
import { readDomainWords } from '$lib/server/businessBrain/readDomainWords';
import { validateWatchedThing } from './validateWatchedThing';
import { watchedThingKey } from '$lib/data/news/watchedThingKey';
import type { WatchedThingGiven } from '$lib/data/news/watchListRules';
import type { SupabaseClient } from '@supabase/supabase-js';

type RegisterCompanyRow = { name: string; company_number: string | null };

/**
 * What the organisation might watch and does not yet: the words of its Domain and the companies on its clients
 * register that have a Companies House number. They are offered to tick, never added by themselves.
 */
export async function readWatchListSuggestions(
	supabase: SupabaseClient,
	organisationId: string,
	watched: WatchedThingGiven[]
): Promise<WatchedThingGiven[]> {
	const [words, companies] = await Promise.all([domainWordSuggestions(supabase, organisationId), registerCompanySuggestions(supabase, organisationId)]);
	const watchedKeys = new Set(watched.map(watchedThingKey));
	const unwatched = [...words, ...companies].filter((suggestion) => !watchedKeys.has(watchedThingKey(suggestion)));
	return uniqueByKey(unwatched);
}

async function domainWordSuggestions(supabase: SupabaseClient, organisationId: string): Promise<WatchedThingGiven[]> {
	const domain = organisationDomainOf(await readDomainPages(supabase, { organisationId, projectId: null }));
	if (domain === null) return [];
	const words = await readDomainWords(supabase, organisationId, domain.glossaries);
	return fittingSuggestions(words.map(({ word }) => ({ kind: 'word', value: word, label: '' })));
}

async function registerCompanySuggestions(supabase: SupabaseClient, organisationId: string): Promise<WatchedThingGiven[]> {
	const { data, error } = await supabase
		.from('clients')
		.select('name, company_number')
		.eq('kept_by_organisation_id', organisationId)
		.eq('is_archived', false)
		.not('company_number', 'is', null)
		.order('name');
	if (error !== null) throw error;
	const rows = data as unknown as RegisterCompanyRow[];
	return fittingSuggestions(rows.map(({ name, company_number }) => ({ kind: 'company', value: company_number ?? '', label: name })));
}

/** Only the suggestions the watch list's columns would hold, so ticking one is never refused. */
function fittingSuggestions(candidates: Record<string, unknown>[]): WatchedThingGiven[] {
	return candidates.map(validateWatchedThing).filter((checked): checked is WatchedThingGiven => typeof checked !== 'string');
}

function uniqueByKey(suggestions: WatchedThingGiven[]): WatchedThingGiven[] {
	const byKey = new Map(suggestions.map((suggestion) => [watchedThingKey(suggestion), suggestion]));
	return [...byKey.values()];
}
