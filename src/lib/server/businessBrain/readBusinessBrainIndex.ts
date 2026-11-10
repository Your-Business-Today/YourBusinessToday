import type { SupabaseClient } from '@supabase/supabase-js';
import { businessBrainPartKinds, businessBrainReadLimits, type BusinessBrainPartKind } from '$lib/data/businessBrainRules';

/** One page as the index lists it: enough to choose which pages to read. */
export type BusinessBrainIndexEntry = {
	pageId: string;
	partKind: BusinessBrainPartKind;
	kind: string;
	title: string;
	summary: string;
	updatedAt: string;
};

/** The pages of an organisation's brain, by part and title, and how many it holds in all. */
export type BusinessBrainIndex = { entries: BusinessBrainIndexEntry[]; pageCount: number };

const { mostPagesListed } = businessBrainReadLimits;
const lastListedRow = mostPagesListed - 1;

/** The index of the organisation's brain, or of one part of it when a part is given. */
export async function readBusinessBrainIndex(
	supabase: SupabaseClient,
	organisationId: string,
	part: BusinessBrainPartKind | null
): Promise<BusinessBrainIndex> {
	const parts = part === null ? [...businessBrainPartKinds] : [part];
	return readBrainIndexOfParts(supabase, organisationId, parts);
}

/** The index of the parts named of the organisation's brain, as a chatbot that reads only those parts lists it. */
export async function readBrainIndexOfParts(
	supabase: SupabaseClient,
	organisationId: string,
	parts: BusinessBrainPartKind[]
): Promise<BusinessBrainIndex> {
	const partKinds = await readPartKinds(supabase, organisationId);
	const partIds = [...partKinds.keys()].filter((partId) => parts.includes(partKinds.get(partId) as BusinessBrainPartKind));
	if (partIds.length === 0) return { entries: [], pageCount: 0 };
	const { data, error, count } = await supabase
		.from('business_brain_pages')
		.select('id, part_id, kind, title, summary, updated_at', { count: 'exact' })
		.eq('organisation_id', organisationId)
		.in('part_id', partIds)
		.order('title')
		.range(0, lastListedRow);
	if (error) throw error;
	const entries = (data ?? []).map((row) => ({
		pageId: row.id as string,
		partKind: partKinds.get(row.part_id as string) as BusinessBrainPartKind,
		kind: row.kind as string,
		title: row.title as string,
		summary: row.summary as string,
		updatedAt: row.updated_at as string
	}));
	return { entries, pageCount: count ?? entries.length };
}

/** Each part of the organisation's brain by its id, with the kind of part it is. */
export async function readPartKinds(supabase: SupabaseClient, organisationId: string): Promise<Map<string, BusinessBrainPartKind>> {
	const { data, error } = await supabase
		.from('business_brain_parts')
		.select('id, kind')
		.eq('organisation_id', organisationId);
	if (error) throw error;
	return new Map((data ?? []).map((row) => [row.id as string, row.kind as BusinessBrainPartKind]));
}
