import { companyDetails } from '$lib/data/companyDetails';
import { getAccountsById } from '$lib/server/accounts/getAccountsById';
import { getPeopleOnProject } from '$lib/server/members/getPeopleOnProject';
import { inviteOutcomeMessage } from '$lib/server/members/inviteOutcomeMessage';
import { inviteToProject } from '$lib/server/members/inviteToProject';
import { noSuchProject } from './describeProject';
import { objectSchema, readText, textField } from '../actionTypes';
import { projectIdField } from './findMemberOn';
import { reachableProject } from '../projectAccess';
import type { Account } from '$lib/server/accounts/accountRecord';
import type { McpAction } from '../actionTypes';
import type { McpCaller } from '../resolveMcpCaller';
import type { ProjectPerson } from '$lib/server/members/projectPersonRecord';

export const projectPeopleActions: McpAction[] = [
	{
		name: 'list_project_people',
		area: 'projects',
		audience: 'everyone',
		isWrite: false,
		summary: 'who is on a project: its owner and every member, with the ids tasks are assigned by',
		inputSchema: objectSchema({ projectId: projectIdField }, ['projectId']),
		run: async (caller, input) => {
			const project = await reachableProject(caller, readText(input, 'projectId'));
			if (project === null) return noSuchProject;
			const people = await getPeopleOnProject(caller.supabase, project.id);
			return people.map(personLine).join('\n');
		}
	},
	{
		name: 'invite_to_project',
		area: 'projects',
		audience: 'everyone',
		isWrite: true,
		summary: 'bring someone on to a project you are on, by email — they join at once and are emailed',
		guidance:
			'Someone new here gets a link to set a password; someone with an account is told to ' +
			'sign in. Once on the project they work and manage it as you do, and reach nothing ' +
			'else of yours.',
		inputSchema: objectSchema(
			{ projectId: projectIdField, email: textField('Their email address') },
			['projectId', 'email']
		),
		run: async (caller, input) => {
			const project = await reachableProject(caller, readText(input, 'projectId'));
			if (project === null) return noSuchProject;
			const email = readText(input, 'email');
			const people = await getPeopleOnProject(caller.supabase, project.id);
			const outcome = await inviteToProject(caller.supabase, {
				project,
				email,
				inviter: await callerAccount(caller),
				origin: companyDetails.websiteUrl,
				memberIds: people.map((person) => person.id)
			});
			return inviteOutcomeMessage(outcome, email).message;
		}
	}
];

function personLine(person: ProjectPerson): string {
	const standing = person.isOwner ? 'owner' : 'member';
	return `${person.name} — ${standing}, ${person.email} (account id: ${person.id})`;
}

async function callerAccount(caller: McpCaller): Promise<Account> {
	const [account] = await getAccountsById(caller.supabase, [caller.accountId]);
	return account ?? { id: caller.accountId, name: caller.email, email: caller.email };
}
