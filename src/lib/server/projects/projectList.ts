import type { SupabaseClient } from '@supabase/supabase-js';
import { asOneList } from '$lib/server/projects/asOneList';
import { getMemberProjectIds } from '$lib/server/members/getMemberProjectIds';
import { getOwnedProjects } from '$lib/server/projects/getOwnedProjects';
import { saveRanks } from '$lib/server/ordering/saveRanks';
import { topRank } from '$lib/server/ordering/rankedSet';
import type { RankedScope } from '$lib/server/ordering/rankedScope';

/** One project's place in a person's projects list: the project id and its number there. */
export type ListPlace = { id: string; place: number };

/**
 * A person's projects list: the projects they own and the ones they are on,
 * in one order of their own. A new order is saved by naming the projects in
 * it; the database works out each board's ranks and how the two are woven
 * (migration 0206), so the list saves whole or not at all.
 */
export function projectList(supabase: SupabaseClient, personId: string): RankedScope<ListPlace> {
	return {
		load: () => loadList(supabase, personId),
		readRank: (listPlace) => listPlace.place,
		save: (placesInOrder) => saveList(supabase, personId, placesInOrder)
	};
}

async function loadList(supabase: SupabaseClient, personId: string): Promise<ListPlace[]> {
	const [ownProjects, teamProjectIds] = await Promise.all([
		getOwnedProjects(supabase, personId),
		getMemberProjectIds(supabase, personId)
	]);
	const teamProjects = teamProjectIds.map((id) => ({ id }));
	return asOneList(ownProjects, teamProjects).map((project, index) => ({ id: project.id, place: index + topRank }));
}

async function saveList(supabase: SupabaseClient, personId: string, placesInOrder: ListPlace[]): Promise<void> {
	await saveRanks(supabase, 'save_project_list_order', {
		list_owner: personId,
		project_ids: placesInOrder.map((listPlace) => listPlace.id)
	});
}
