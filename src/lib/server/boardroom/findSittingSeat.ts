import type { SupabaseClient } from '@supabase/supabase-js';
import { findOrganisationMember, getMembersOfOrganisation } from '$lib/server/organisations/getMembersOfOrganisation';
import { sittingDirectors, type BoardroomDirector } from '$lib/data/boardroomDirector';

function findSittingDirector(directors: BoardroomDirector[], named: string): BoardroomDirector | null {
	const wanted = named.toLowerCase();
	const matches = (director: BoardroomDirector) =>
		director.accountId === named || director.name.toLowerCase() === wanted;
	return sittingDirectors(directors).find(matches) ?? null;
}

/** The sitting director someone names by account id, email or name, or null when nobody of that name sits. */
export async function findSittingSeat(
	supabase: SupabaseClient,
	organisationId: string,
	directors: BoardroomDirector[],
	named: string
): Promise<BoardroomDirector | null> {
	const members = await getMembersOfOrganisation(supabase, organisationId);
	const member = findOrganisationMember(members, named);
	return findSittingDirector(directors, member?.id ?? named);
}
