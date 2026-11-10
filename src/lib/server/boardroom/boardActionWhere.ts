import type { SupabaseClient } from '@supabase/supabase-js';
import { getProjectsForOrganisation } from '$lib/server/organisations/getProjectsForOrganisation';
import { findOrganisationMember, getMembersOfOrganisation } from '$lib/server/organisations/getMembersOfOrganisation';
import { getPeopleOnProject } from '$lib/server/members/getPeopleOnProject';
import { findProjectPerson } from '$lib/server/members/findProjectPerson';
import { boardActionRefusals } from '$lib/data/boardroomActionRules';
import type { ActionProject } from '$lib/data/boardroomAction';
import type { BoardActionDraft } from '$lib/data/validateBoardAction';

/** Where an action goes, looked up: the project and department, or none, and its owner by account with their name. */
export type BoardActionWhere = { project: ActionProject | null; owner: { accountId: string; name: string } };

async function projectOfOrganisation(supabase: SupabaseClient, organisationId: string, projectId: string) {
	const projects = await getProjectsForOrganisation(supabase, organisationId);
	return projects.find((project) => project.id === projectId && project.organisationId === organisationId) ?? null;
}

async function onProject(supabase: SupabaseClient, organisationId: string, draft: BoardActionDraft): Promise<BoardActionWhere | string> {
	const { projectId, department } = draft;
	if (projectId === null || department === null) return boardActionRefusals.departmentWithoutProject;
	const project = await projectOfOrganisation(supabase, organisationId, projectId);
	if (project === null) return boardActionRefusals.projectNotOfOrganisation;
	const person = findProjectPerson(await getPeopleOnProject(supabase, project.id), draft.owner);
	if (person === null) return boardActionRefusals.ownerNotOnProject;
	const owner = { accountId: person.id, name: person.name };
	return { project: { projectId: project.id, projectName: project.name, department }, owner };
}

async function onOwnList(supabase: SupabaseClient, organisationId: string, draft: BoardActionDraft): Promise<BoardActionWhere | string> {
	const member = findOrganisationMember(await getMembersOfOrganisation(supabase, organisationId), draft.owner);
	if (member === null) return boardActionRefusals.ownerNotOnOrganisation;
	return { project: null, owner: { accountId: member.id, name: member.name } };
}

/**
 * Everything that could stop an action being raised, checked as it is recorded: the project is under the meeting's
 * own organisation and the owner is on it, or, with no project, the owner is on the organisation.
 */
export async function boardActionWhere(supabase: SupabaseClient, organisationId: string, draft: BoardActionDraft): Promise<BoardActionWhere | string> {
	if (draft.projectId === null) return onOwnList(supabase, organisationId, draft);
	return onProject(supabase, organisationId, draft);
}
