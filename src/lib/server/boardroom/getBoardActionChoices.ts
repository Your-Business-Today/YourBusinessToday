import type { SupabaseClient } from '@supabase/supabase-js';
import { getMembersOfOrganisation } from '$lib/server/organisations/getMembersOfOrganisation';
import { getProjectsForOrganisation } from '$lib/server/organisations/getProjectsForOrganisation';
import { noBoardActionChoices, type BoardActionChoices } from '$lib/data/boardActionForm';
import type { BoardMeetingView } from '$lib/data/boardMeetingView';

/** Who and where an action can go to, read only when the reader may record one on some item now. */
export async function getBoardActionChoices(supabase: SupabaseClient, organisationId: string, meeting: BoardMeetingView): Promise<BoardActionChoices> {
	const canRecordAny = meeting.agenda.some(({ actions }) => actions.canRecord);
	if (!canRecordAny) return noBoardActionChoices;
	const [members, projects] = await Promise.all([
		getMembersOfOrganisation(supabase, organisationId),
		getProjectsForOrganisation(supabase, organisationId)
	]);
	const ownProjects = projects.filter((project) => project.organisationId === organisationId);
	return {
		people: members.map((member) => ({ id: member.id, name: member.name })),
		projects: ownProjects.map((project) => ({ id: project.id, name: project.name }))
	};
}
