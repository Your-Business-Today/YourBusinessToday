import type { SupabaseClient } from '@supabase/supabase-js';
import { parseProjectRecord, type Project } from '$lib/server/projects/projectRecord';
import { rankChanges } from '$lib/server/ordering/rankChanges';
import { teamBoard } from '$lib/server/members/teamBoard';
import type { BoardPlace } from '$lib/server/projects/boardPlace';
import type { RankedScope } from '$lib/server/ordering/rankedScope';

/** An owner's board: their projects, ranked by `priority`. */
export function projectBoard(supabase: SupabaseClient, ownerId: string): RankedScope<BoardPlace> {
	return {
		load: () => loadBoard(supabase, ownerId),
		readRank: (place) => place.priority,
		save: (placesInOrder) => saveBoard(supabase, placesInOrder)
	};
}

/** The board a project sits on for one person: their own board when they own it, their team board otherwise. */
export function boardOf(
	supabase: SupabaseClient,
	project: Project,
	viewerId: string
): RankedScope<BoardPlace> {
	if (project.ownerId === viewerId) return projectBoard(supabase, viewerId);
	return teamBoard(supabase, viewerId);
}

export async function findProject(
	supabase: SupabaseClient,
	projectId: string
): Promise<Project | null> {
	const { data, error } = await supabase
		.from('projects')
		.select('*')
		.eq('id', projectId)
		.maybeSingle();
	if (error) throw error;
	if (data === null) return null;
	return parseProjectRecord(data);
}

async function loadBoard(supabase: SupabaseClient, ownerId: string): Promise<BoardPlace[]> {
	const { data, error } = await supabase
		.from('projects')
		.select('*')
		.eq('owner_id', ownerId)
		.order('priority', { ascending: true })
		.order('created_at', { ascending: true });
	if (error) throw error;
	return data.map(parseProjectRecord).map((project) => ({ id: project.id, priority: project.priority }));
}

async function saveBoard(supabase: SupabaseClient, placesInOrder: BoardPlace[]): Promise<void> {
	const changes = rankChanges(placesInOrder, (place) => place.priority);
	await Promise.all(
		changes.map(async (change) => {
			const { error } = await supabase
				.from('projects')
				.update({ priority: change.rank })
				.eq('id', change.id);
			if (error) throw error;
		})
	);
}
