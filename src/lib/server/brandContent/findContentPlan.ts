import { contentPlanOf } from '$lib/brand/plan/contentPlanOf';
import { findPlannedPieces } from './findPlannedPieces';
import { monthBoundsOf, type PlanMonth } from '$lib/brand/plan/planMonth';
import type { ContentPlan } from '$lib/brand/plan/contentPlan';
import type { SupabaseClient } from '@supabase/supabase-js';

/** One month of the organisation's brand content, laid out on the day each piece goes out. The plan page and the connector both read it. */
export async function findContentPlan(supabase: SupabaseClient, organisationId: string, month: PlanMonth): Promise<ContentPlan> {
	const pieces = await findPlannedPieces(supabase, organisationId, monthBoundsOf(month));
	return contentPlanOf(month, pieces);
}
