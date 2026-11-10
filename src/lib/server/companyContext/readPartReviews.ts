import { isSchemaNotYetMigrated } from '$lib/server/schema/schemaNotYetMigrated';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { ContextPart, ReviewState } from '$lib/data/companyContext/companyContext';

/** What a client last said of a part: right, or not right with what is wrong. */
export type PartReview = Pick<ContextPart, 'reviewState' | 'whatIsWrong'>;

/** The latest mark a client made on each of these parts from the portal; none before migration 0163. */
export async function readPartReviews(supabase: SupabaseClient, partIds: string[]): Promise<Map<string, PartReview>> {
	const reviews = new Map<string, PartReview>();
	if (partIds.length === 0) return reviews;
	const { data, error } = await supabase
		.from('company_context_part_reviews')
		.select('part_id, review_state, what_is_wrong')
		.in('part_id', partIds)
		.order('reviewed_at', { ascending: false });
	if (isSchemaNotYetMigrated(error)) return reviews;
	if (error) throw error;
	for (const row of data) {
		const partId = String(row.part_id);
		if (reviews.has(partId)) continue;
		const whatIsWrong = row.what_is_wrong === null ? null : String(row.what_is_wrong);
		reviews.set(partId, { reviewState: String(row.review_state) as ReviewState, whatIsWrong });
	}
	return reviews;
}
