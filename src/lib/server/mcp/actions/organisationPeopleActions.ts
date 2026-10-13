import { findOrganisationMember, getMembersOfOrganisation } from '$lib/server/organisations/getMembersOfOrganisation';
import { manageableOrganisation, notAnOrganisationManager } from '../organisationAccess';
import { objectSchema, readText, textField } from '../actionTypes';
import { organisationIdField } from './organisationDetailsFields';
import { removeOrganisationMember } from '$lib/server/organisations/removeOrganisationMember';
import { setOrganisationManager } from '$lib/server/organisations/setOrganisationManager';
import type { McpAction } from '../actionTypes';
import type { McpCaller } from '../resolveMcpCaller';

const memberField = textField('Their account id or email, as read_organisation gives it');
const nobodyOfThatName = 'Nobody of that name is on the organisation. Call read_organisation for its people.';

export const organisationPeopleActions: McpAction[] = [
	{
		name: 'set_organisation_manager',
		area: 'organisations',
		audience: 'everyone',
		isWrite: true,
		summary: 'make someone on an organisation you manage one of its project managers (it can have several), or stop them being one',
		inputSchema: objectSchema(
			{
				organisationId: organisationIdField,
				member: memberField,
				isManager: { type: 'boolean', description: 'true to make them a project manager, false to make them a member' }
			},
			['organisationId', 'member', 'isManager']
		),
		run: async (caller, input) => changeStanding(caller, input)
	},
	{
		name: 'remove_organisation_member',
		area: 'organisations',
		audience: 'everyone',
		isWrite: true,
		summary: 'take someone off an organisation you manage — the projects it gave them go with it, at once',
		inputSchema: objectSchema({ organisationId: organisationIdField, member: memberField }, ['organisationId', 'member']),
		run: async (caller, input) => {
			const organisation = await manageableOrganisation(caller, readText(input, 'organisationId'));
			if (organisation === null) return notAnOrganisationManager;
			const members = await getMembersOfOrganisation(caller.supabase, organisation.id);
			const member = findOrganisationMember(members, readText(input, 'member'));
			if (member === null) return nobodyOfThatName;
			await removeOrganisationMember(caller.supabase, organisation.id, member.id);
			return `${member.name} is no longer on ${organisation.name}.`;
		}
	}
];

async function changeStanding(caller: McpCaller, input: Record<string, unknown>): Promise<string> {
	const organisation = await manageableOrganisation(caller, readText(input, 'organisationId'));
	if (organisation === null) return notAnOrganisationManager;
	const members = await getMembersOfOrganisation(caller.supabase, organisation.id);
	const member = findOrganisationMember(members, readText(input, 'member'));
	if (member === null) return nobodyOfThatName;
	const isManager = input.isManager === true;
	await setOrganisationManager(caller.supabase, organisation.id, member.id, isManager);
	const standing = isManager ? 'a project manager of' : 'a member of';
	return `${member.name} is now ${standing} ${organisation.name}.`;
}
