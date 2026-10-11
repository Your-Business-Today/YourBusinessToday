import { accountIdField, findMemberOn, projectIdField } from './findMemberOn';
import { noSuchProject } from './describeProject';
import { notTheOwner, ownedProject, reachableProject } from '../projectAccess';
import { objectSchema, readText } from '../actionTypes';
import { removalRefusalFor } from '$lib/data/projectMemberStanding';
import { removeProjectMember } from '$lib/server/members/removeProjectMember';
import { transferProjectOwnership } from '$lib/server/members/transferProjectOwnership';
import type { McpAction } from '../actionTypes';

const memberFields = objectSchema({ projectId: projectIdField, accountId: accountIdField }, [
	'projectId',
	'accountId'
]);

export const projectMembershipActions: McpAction[] = [
	{
		name: 'remove_project_member',
		area: 'projects',
		audience: 'everyone',
		isWrite: true,
		summary: 'take a member off a project you are on — they lose access at once; someone an organisation brought is taken off the organisation instead',
		inputSchema: memberFields,
		run: async (caller, input) => {
			const project = await reachableProject(caller, readText(input, 'projectId'));
			if (project === null) return noSuchProject;
			const member = await findMemberOn(caller, project.id, readText(input, 'accountId'));
			if (member === null) return 'Nobody with that id is a member of the project.';
			const refusal = removalRefusalFor(member);
			if (refusal !== null) return refusal;
			await removeProjectMember(caller.supabase, project.id, member.id);
			return `${member.name} is no longer on ${project.name}.`;
		}
	},
	{
		name: 'transfer_project_ownership',
		area: 'projects',
		audience: 'everyone',
		isWrite: true,
		summary: 'hand a project you own to one of its members — you stay on it as a member',
		guidance:
			'Confirm with the person first: afterwards only the new owner can manage the project.',
		inputSchema: memberFields,
		run: async (caller, input) => {
			const project = await ownedProject(caller, readText(input, 'projectId'));
			if (project === null) return notTheOwner;
			const member = await findMemberOn(caller, project.id, readText(input, 'accountId'));
			if (member === null) return 'The new owner must already be a member of the project.';
			await transferProjectOwnership(caller.supabase, project.id, member.id);
			return `${member.name} now owns ${project.name}. You are on it as a member.`;
		}
	}
];
