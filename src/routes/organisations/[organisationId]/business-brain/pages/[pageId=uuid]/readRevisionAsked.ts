import { error } from '@sveltejs/kit';
import { isRevisionId, revisionQueryKey } from '$lib/data/businessBrainAddresses';
import { readBusinessBrainRevision, type BusinessBrainRevisionRead } from '$lib/server/businessBrain/readBusinessBrainPageHistory';
import type { SupabaseClient } from '@supabase/supabase-js';

const noSuchRevision = 'No earlier version of this page by that number';

/** The earlier version the address asks for, or null when it asks for the page as it now reads. */
export async function readRevisionAsked(
	supabase: SupabaseClient,
	place: { organisationId: string; pageId: string },
	url: URL
): Promise<BusinessBrainRevisionRead | null> {
	const asked = url.searchParams.get(revisionQueryKey);
	if (asked === null) return null;
	if (!isRevisionId(asked)) error(404, noSuchRevision);
	const revision = await readBusinessBrainRevision(supabase, place, Number(asked));
	if (revision === null) error(404, noSuchRevision);
	return revision;
}
