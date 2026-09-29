import type { SupabaseClient } from '@supabase/supabase-js';
import { rankChanges } from '$lib/server/ordering/rankChanges';
import type { BoardPlace } from '$lib/server/projects/boardPlace';
import type { RankedScope } from '$lib/server/ordering/rankedScope';

/** A member's team board: the projects they are on but do not own, ranked by the `priority` on their membership. */
export function teamBoard(supabase: SupabaseClient, memberId: string): RankedScope<BoardPlace> {
	return {
		load: () => loadTeamBoard(supabase, memberId),
		readRank: (place) => place.priority,
		save: (placesInOrder) => saveTeamBoard(supabase, memberId, placesInOrder)
	};
}

async function loadTeamBoard(supabase: SupabaseClient, memberId: string): Promise<BoardPlace[]> {
	const { data, error } = await supabase
		.from('project_members')
		.select('project_id, priority')
		.eq('account_id', memberId)
		.order('priority', { ascending: true })
		.order('created_at', { ascending: true });
	if (error) throw error;
	return data.map((row: Record<string, unknown>) => ({
		id: row.project_id as string,
		priority: row.priority as number
	}));
}

async function saveTeamBoard(
	supabase: SupabaseClient,
	memberId: string,
	placesInOrder: BoardPlace[]
): Promise<void> {
	const changes = rankChanges(placesInOrder, (place) => place.priority);
	await Promise.all(
		changes.map(async (change) => {
			const { error } = await supabase
				.from('project_members')
				.update({ priority: change.rank })
				.eq('account_id', memberId)
				.eq('project_id', change.id);
			if (error) throw error;
		})
	);
}
