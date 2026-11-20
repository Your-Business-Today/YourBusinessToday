import { fail } from '@sveltejs/kit';
import { getCurrentAccount } from '$lib/server/accounts/getCurrentAccount';
import { getMembersOfOrganisation } from '$lib/server/organisations/getMembersOfOrganisation';
import { inviteToOrganisation } from '$lib/server/organisations/inviteToOrganisation';
import { organisationInviteOutcomeMessage } from '$lib/server/members/inviteOutcomeMessage';
import { removeOrganisationMember } from '$lib/server/organisations/removeOrganisationMember';
import { requireOrganisationManager } from '$lib/server/auth/requireOrganisationManager';
import { setOrganisationManager } from '$lib/server/organisations/setOrganisationManager';
import type { Actions } from './$types';

const memberRequired = 'A member is required.';

export const organisationMemberActions = {
	invitePerson: async ({ locals, params, request, url }) => {
		const { user, organisation } = await requireOrganisationManager(locals, params.organisationId);
		const formData = await request.formData();
		const email = String(formData.get('email') ?? '').trim();
		if (email === '') return fail(400, { message: 'An email address is required.' });
		const members = await getMembersOfOrganisation(locals.supabase, organisation.id);
		const outcome = await inviteToOrganisation(locals.supabase, {
			organisation,
			email,
			isManager: formData.get('isManager') === 'on',
			inviter: await getCurrentAccount(locals.supabase, user),
			origin: url.origin,
			memberIds: members.map((member) => member.id)
		});
		const { isRefusal, message } = organisationInviteOutcomeMessage(outcome, email);
		if (isRefusal) return fail(400, { message });
		return { message };
	},
	setManager: async ({ locals, params, request }) => {
		const { organisation } = await requireOrganisationManager(locals, params.organisationId);
		const formData = await request.formData();
		const accountId = String(formData.get('accountId') ?? '');
		if (accountId === '') return fail(400, { message: memberRequired });
		const isManager = formData.get('isManager') === 'true';
		await setOrganisationManager(locals.supabase, organisation.id, accountId, isManager);
		return {};
	},
	removeMember: async ({ locals, params, request }) => {
		const { organisation } = await requireOrganisationManager(locals, params.organisationId);
		const accountId = String((await request.formData()).get('accountId') ?? '');
		if (accountId === '') return fail(400, { message: memberRequired });
		await removeOrganisationMember(locals.supabase, organisation.id, accountId);
		return {};
	}
} satisfies Actions;
