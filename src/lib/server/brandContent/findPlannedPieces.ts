import { findPostIdsOfPieces } from './findPostIdsOfPieces';
import type { ContentStage, PlannedPiece } from '$lib/brand/content/contentPiece';
import type { MonthBounds } from '$lib/brand/plan/planMonth';
import type { SupabaseClient } from '@supabase/supabase-js';

export const PlanListing = { mostPieces: 500 } as const;

const everyColumn = '*';

/**
 * The organisation's pieces planned or scheduled to go out between the month's bounds, earliest first, each with the post
 * it is a channel of.
 * Every column is read, so the plan still reads in the moments before a new column's migration has run.
 */
export async function findPlannedPieces(
	supabase: SupabaseClient,
	organisationId: string,
	{ startsAt, endsAt }: MonthBounds
): Promise<PlannedPiece[]> {
	const isPlannedInMonth = `and(planned_for.gte.${startsAt},planned_for.lt.${endsAt})`;
	const isScheduledInMonth = `and(scheduled_for.gte.${startsAt},scheduled_for.lt.${endsAt})`;
	const { data, error } = await supabase
		.from('brand_content_pieces')
		.select(everyColumn)
		.eq('organisation_id', organisationId)
		.or(`${isPlannedInMonth},${isScheduledInMonth}`)
		.order('planned_for', { ascending: true, nullsFirst: false })
		.limit(PlanListing.mostPieces);
	if (error) throw error;
	const rows = (data ?? []) as Record<string, unknown>[];
	const postIds = await findPostIdsOfPieces(supabase, organisationId, rows.map((row) => row.id as string));
	return rows.map((row) => plannedPieceOf(row, postIds));
}

/** A piece on no post yet is a post of its own, under its own id. */
function plannedPieceOf(row: Record<string, unknown>, postIds: Map<string, string>): PlannedPiece {
	const id = row.id as string;
	return {
		id,
		postId: postIds.get(id) ?? id,
		mediumPath: row.medium_path as string,
		title: row.title as string,
		hook: row.hook as string,
		stage: row.stage as ContentStage,
		plannedFor: row.planned_for as string | null,
		scheduledFor: row.scheduled_for as string | null,
		kind: (row.kind as string | null | undefined) ?? null,
		updatedAt: row.updated_at as string
	};
}
