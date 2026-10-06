import { fail } from '@sveltejs/kit';
import {
	addClientContact,
	addContactOutcomes,
	readNewContactSeed
} from '$lib/server/clients/addClientContact';
import { getClientContact } from '$lib/server/clients/getClientContacts';
import { assignProjectToClient, readProjectOwnership } from '$lib/server/projects/assignProjectToClient';
import { inviteClientContact, inviteOutcomes } from '$lib/server/clients/inviteClientContact';
import { requireStaff } from '$lib/server/auth/requireStaff';
import { tooManyInvitesMessage } from '$lib/server/email/inviteAllowance';
import type { Actions } from './$types';

export const registerActions: Actions = {
	addContact: async ({ locals, params, request }) => {
		const user = await requireStaff(locals);
		const seed = readNewContactSeed(await request.formData());
		if (seed === null) return fail(400, { message: 'A name is required.' });
		const outcome = await addClientContact(locals.supabase, params.clientId, seed, user.id);
		if (outcome === addContactOutcomes.alreadyKnown) return fail(400, { message: 'That email is already listed.' });
		return { message: `${seed.name} added.` };
	},
	assignProject: async ({ locals, params, request }) => {
		const user = await requireStaff(locals);
		const formData = await request.formData();
		const projectId = String(formData.get('projectId') ?? '');
		if (projectId === '') return fail(400, { message: 'A project is required.' });
		const ownership = { ...readProjectOwnership(formData), clientId: params.clientId };
		await assignProjectToClient(locals.supabase, projectId, ownership, user.id);
		return { message: 'Project assigned.' };
	},
	inviteContact: async ({ locals, request, url }) => {
		const user = await requireStaff(locals);
		const formData = await request.formData();
		const contactId = String(formData.get('contactId') ?? '');
		const contact = await getClientContact(locals.supabase, contactId);
		if (contact === null) return fail(400, { message: 'That contact could not be found.' });
		if (contact.email === '') return fail(400, { message: 'Add an email address before inviting.' });
		const outcome = await inviteClientContact(locals.supabase, contact, url.origin, user.id);
		if (outcome === inviteOutcomes.alreadyInvited) return { message: `${contact.name} already has an account.` };
		if (outcome === inviteOutcomes.tooManyInvites) return fail(429, { message: tooManyInvitesMessage });
		return { message: `Invitation sent to ${contact.email}.` };
	}
};
