import { getPeopleOnProject } from '$lib/server/members/getPeopleOnProject';
import { textField } from '../actionTypes';
import type { McpCaller } from '../resolveMcpCaller';
import type { ProjectPerson } from '$lib/server/members/projectPersonRecord';

export const projectIdField = textField('The project id');
export const accountIdField = textField('Their account id, as list_project_people gives it');

export async function findMemberOn(
	caller: McpCaller,
	projectId: string,
	accountId: string
): Promise<ProjectPerson | null> {
	const people = await getPeopleOnProject(caller.supabase, projectId);
	return people.find((person) => person.id === accountId && !person.isOwner) ?? null;
}
