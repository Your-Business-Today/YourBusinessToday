import { everyDomainPageKind } from '$lib/data/businessBrainDomain';
import type { BusinessBrainPageStanding } from './reviseBusinessBrainPage';
import type { SupabaseClient } from '@supabase/supabase-js';

/** A page of the part as it stands, with the context it sits in. */
export type DomainPageStanding = BusinessBrainPageStanding & { slug: string; parentPageId: string | null };

/** What a filing would make a page read: its words, its facts and the context it sits in. */
export type DomainPageValues = {
	kind: string;
	slug: string;
	title: string;
	summary: string;
	body: string;
	facts: Record<string, unknown>;
	parentPageId: string | null;
};

/** The page filed under the slug in the part, or null when the part has none. */
export async function readDomainPageStanding(supabase: SupabaseClient, partId: string, slug: string): Promise<DomainPageStanding | null> {
	const { data, error } = await supabase
		.from('business_brain_pages')
		.select('id, source_id, kind, slug, title, summary, body, facts, parent_page_id, updated_at')
		.eq('part_id', partId)
		.eq('slug', slug)
		.maybeSingle();
	if (error) throw error;
	if (data === null) return null;
	const { id, source_id: sourceId, parent_page_id: parentPageId, updated_at: updatedAt, ...words } = data;
	return { pageId: id, sourceId, parentPageId, updatedAt, ...words } as DomainPageStanding;
}

/** Whether the page already reads exactly as the filing would make it. */
export function readsAsFiled(standing: DomainPageStanding, values: DomainPageValues): boolean {
	const isSameWording = standing.title === values.title && standing.summary === values.summary && standing.body === values.body;
	const isSamePlace = standing.kind === values.kind && standing.parentPageId === values.parentPageId;
	return isSameWording && isSamePlace && canonicalJson(standing.facts) === canonicalJson(values.facts);
}

/** The value as JSON with every object's keys in order, so two values that hold the same read the same. */
export function canonicalJson(value: unknown): string {
	return JSON.stringify(value, (_key, inner) => {
		if (typeof inner !== 'object' || inner === null || Array.isArray(inner)) return inner;
		const entries = Object.entries(inner as Record<string, unknown>).sort(([left], [right]) => left.localeCompare(right));
		return Object.fromEntries(entries);
	});
}

/** Whether the page is part of the domain, and so a filing may revise or supersede it. */
export function isDomainPageStanding(standing: DomainPageStanding): boolean {
	return (everyDomainPageKind as string[]).includes(standing.kind);
}

/** The page's values as they stand, to change one and revise the page with the rest kept. */
export function valuesOfStanding(standing: DomainPageStanding): DomainPageValues {
	const { kind, slug, title, summary, body, facts, parentPageId } = standing;
	return { kind, slug, title, summary, body, facts, parentPageId };
}
