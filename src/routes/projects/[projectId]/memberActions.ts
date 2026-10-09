import { fail } from '@sveltejs/kit';
import { getCurrentAccount } from '$lib/server/accounts/getCurrentAccount';
import { getPeopleOnProject } from '$lib/server/members/getPeopleOnProject';
import { inviteOutcomeMessage } from '$lib/server/members/inviteOutcomeMessage';
import { inviteToProject } from '$lib/server/members/inviteToProject';
import { removeProjectMember } from '$lib/server/members/removeProjectMember';
import { requireProjectAccess } from '$lib/server/auth/requireProjectAccess';
import { requireProjectOwner } from '$lib/server/auth/requireProjectOwner';
import { transferProjectOwnership } from '$lib/server/members/transferProjectOwnership';
import type { Actions } from './$types';

export const memberActions = {
	invitePerson: async ({ locals, params, request, url }) => {
		const { user, project } = await requireProjectAccess(locals, params.projectId);
		const email = String((await request.formData()).get('email') ?? '').trim();
		if (email === '') return fail(400, { message: 'An email address is required.' });
		const people = await getPeopleOnProject(locals.supabase, project.id);
		const outcome = await inviteToProject(locals.supabase, {
			project,
			email,
			inviter: await getCurrentAccount(locals.supabase, user),
			origin: url.origin,
			memberIds: people.map((person) => person.id)
		});
		const { isRefusal, message } = inviteOutcomeMessage(outcome, email);
		if (isRefusal) return fail(400, { message });
		return { message };
	},
	removeMember: async ({ locals, params, request }) => {
		await requireProjectAccess(locals, params.projectId);
		const accountId = String((await request.formData()).get('accountId') ?? '');
		if (accountId === '') return fail(400, { message: 'A member is required.' });
		await removeProjectMember(locals.supabase, params.projectId, accountId);
		return {};
	},
	transferOwnership: async ({ locals, params, request }) => {
		await requireProjectOwner(locals, params.projectId);
		const newOwnerId = String((await request.formData()).get('accountId') ?? '');
		if (newOwnerId === '') return fail(400, { message: 'Choose who takes the project on.' });
		await transferProjectOwnership(locals.supabase, params.projectId, newOwnerId);
		return { message: 'The project has a new owner. You are still on it as a member.' };
	}
} satisfies Actions;
