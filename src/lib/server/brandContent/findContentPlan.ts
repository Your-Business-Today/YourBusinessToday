import { contentPlanOf } from '$lib/brand/plan/contentPlanOf';
import { findPlannedPieces } from './findPlannedPieces';
import { loadBrandKit } from '$lib/server/brandKits/loadBrandKit';
import { monthBoundsOf, type PlanMonth } from '$lib/brand/plan/planMonth';
import { postingRhythmsOf } from '$lib/brand/rhythm/postingRhythm';
import type { ContentPlan } from '$lib/brand/plan/contentPlan';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * One month of the organisation's brand content, laid out on the day each piece goes out and held against the posting
 * rhythms in its kit. The plan page and the connector both read it.
 */
export async function findContentPlan(supabase: SupabaseClient, organisationId: string, month: PlanMonth): Promise<ContentPlan> {
	const [pieces, kit] = await Promise.all([
		findPlannedPieces(supabase, organisationId, monthBoundsOf(month)),
		loadBrandKit(supabase, organisationId)
	]);
	return contentPlanOf(month, pieces, postingRhythmsOf(kit.decisions, kit.catalogue));
}
