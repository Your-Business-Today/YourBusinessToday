import type { ContentPiece, ContentStage } from '$lib/brand/content/contentPiece';

/** A piece as its row holds it; the columns added since 0168 read as empty in the moments before their migration runs. */
export function contentPieceOfRow(row: Record<string, unknown>): ContentPiece {
	return {
		id: row.id as string,
		mediumPath: row.medium_path as string,
		title: row.title as string,
		hook: row.hook as string,
		script: row.script as string,
		storyboard: row.storyboard as ContentPiece['storyboard'],
		caption: row.caption as string,
		invitedAction: row.invited_action as string,
		stage: row.stage as ContentStage,
		brandSnapshot: row.brand_snapshot as ContentPiece['brandSnapshot'],
		scheduledFor: row.scheduled_for as string | null,
		plannedFor: (row.planned_for as string | null | undefined) ?? null,
		kind: (row.kind as string | null | undefined) ?? null,
		publishedUrl: row.published_url as string,
		updatedAt: row.updated_at as string
	};
}
