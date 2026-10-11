import { companyDetails } from '$lib/data/companyDetails';
import { getAccountsById } from '$lib/server/accounts/getAccountsById';
import { getMembersOfOrganisation } from '$lib/server/organisations/getMembersOfOrganisation';
import { inviteToOrganisation } from '$lib/server/organisations/inviteToOrganisation';
import { manageableOrganisation, notAnOrganisationManager } from '../organisationAccess';
import { objectSchema, readText, textField } from '../actionTypes';
import { organisationIdField } from './organisationDetailsFields';
import { organisationInviteOutcomeMessage } from '$lib/server/members/inviteOutcomeMessage';
import type { Account } from '$lib/server/accounts/accountRecord';
import type { McpAction } from '../actionTypes';
import type { McpCaller } from '../resolveMcpCaller';

export const organisationInviteActions: McpAction[] = [
	{
		name: 'invite_to_organisation',
		area: 'organisations',
		audience: 'everyone',
		isWrite: true,
		summary:
			'bring someone on to an organisation you manage, by email — they are on every project under it at once, and are emailed',
		guidance:
			'Someone new here gets a link to set a password; someone with an account is told to sign in. ' +
			'On a parent they reach every sub-organisation’s projects as well; on a sub-organisation only ' +
			'its own. Make them a project manager only if they are to bring people on themselves. ' +
			'For one project alone, call invite_to_project instead.',
		inputSchema: objectSchema(
			{
				organisationId: organisationIdField,
				email: textField('Their email address'),
				isManager: { type: 'boolean', description: 'true to make them a project manager of it' }
			},
			['organisationId', 'email']
		),
		run: async (caller, input) => invitePerson(caller, input)
	}
];

async function invitePerson(caller: McpCaller, input: Record<string, unknown>): Promise<string> {
	const organisation = await manageableOrganisation(caller, readText(input, 'organisationId'));
	if (organisation === null) return notAnOrganisationManager;
	const email = readText(input, 'email');
	const members = await getMembersOfOrganisation(caller.supabase, organisation.id);
	const outcome = await inviteToOrganisation(caller.supabase, {
		organisation,
		email,
		isManager: input.isManager === true,
		inviter: await callerAccount(caller),
		origin: companyDetails.websiteUrl,
		memberIds: members.map((member) => member.id)
	});
	return organisationInviteOutcomeMessage(outcome, email).message;
}

async function callerAccount(caller: McpCaller): Promise<Account> {
	const [account] = await getAccountsById(caller.supabase, [caller.accountId]);
	return account ?? { id: caller.accountId, name: caller.email, email: caller.email };
}
