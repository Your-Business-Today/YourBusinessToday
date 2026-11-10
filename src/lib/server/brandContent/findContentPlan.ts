import { contentPlanOf } from '$lib/brand/plan/contentPlanOf';
import { findPlannedPieces } from './findPlannedPieces';
import { findPostPictures } from './findPostPictures';
import { loadBrandKit } from '$lib/server/brandKits/loadBrandKit';
import { monthBoundsOf, type PlanMonth } from '$lib/brand/plan/planMonth';
import { postingRhythmsOf } from '$lib/brand/rhythm/postingRhythm';
import type { ContentPlan } from '$lib/brand/plan/contentPlan';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * One month of the organisation's brand content, laid out on the day each piece goes out, held against the posting
 * rhythms in its kit, with what each post says of its picture. The plan page and the connector both read it.
 */
export async function findContentPlan(supabase: SupabaseClient, organisationId: string, month: PlanMonth): Promise<ContentPlan> {
	const [pieces, kit] = await Promise.all([
		findPlannedPieces(supabase, organisationId, monthBoundsOf(month)),
		loadBrandKit(supabase, organisationId)
	]);
	const postIds = [...new Set(pieces.map((piece) => piece.postId))];
	const pictures = await findPostPictures(supabase, organisationId, postIds);
	return contentPlanOf(month, pieces, postingRhythmsOf(kit.decisions, kit.catalogue), pictures);
}
