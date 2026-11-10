import { jeremysBrief, nigelsFirstBrief, nigelsSecondBrief } from '$lib/data/boardroomBrief.fixtures';
import type { BoardroomBrief } from '$lib/data/boardroomBrief';

function rowOf(brief: BoardroomBrief): Record<string, unknown> {
	return {
		id: brief.id,
		organisation_id: brief.organisationId,
		meeting_id: brief.meetingId,
		agenda_item_id: brief.agendaItemId,
		director_id: brief.directorId,
		version: brief.version,
		position: brief.position,
		may_share: brief.mayShare,
		must_not_share: brief.mustNotShare,
		must_come_back: brief.mustComeBack,
		created_at: brief.createdAt
	};
}

/**
 * boardroom_briefs as the service role sees it, every director's rows together, the way the connector reads
 * it: only the filters the code asks for stand between one director and another's brief.
 */
export function serviceRoleBriefTable() {
	const rows = [nigelsFirstBrief, nigelsSecondBrief, jeremysBrief].map(rowOf);
	const queriedTables: string[] = [];
	const filtered = (filters: [string, unknown][]) => rows.filter((row) => filters.every(([column, value]) => row[column] === value));
	const query = (filters: [string, unknown][]) => ({
		select: () => query(filters),
		eq: (column: string, value: unknown) => query([...filters, [column, value]]),
		order: async () => ({ data: filtered(filters), error: null })
	});
	const supabase = {
		from: (table: string) => queriedTables.push(table) && query([]),
		rpc: async () => ({ data: rows.map((row) => ({ agenda_item_id: row.agenda_item_id, director_id: row.director_id })), error: null })
	};
	return { supabase: supabase as never, queriedTables };
}
