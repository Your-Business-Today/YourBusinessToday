import { fail } from '@sveltejs/kit';
import { addPersonLink, readNewPersonLink } from './addPersonLink';
import { addPersonNote } from './addPersonNote';
import { removePersonLink } from './removePersonLink';
import { requireStaff } from '$lib/server/auth/requireStaff';
import { updateContactRole } from '$lib/server/clients/updateContactRole';
import {
	personProfileSaves,
	readPersonProfileEdit,
	updatePersonProfile
} from './updatePersonProfile';

export type StaffFormEvent = { locals: App.Locals; request: Request };

const personRequired = { message: 'A person is required.' };

/**
 * A person is edited the same way from their own page and from a company
 * they are affiliated with, so both routes spread these.
 */
export const personFormActions = {
	updatePerson: async ({ locals, request }: StaffFormEvent) => {
		await requireStaff(locals);
		const formData = await request.formData();
		const personId = String(formData.get('personId') ?? '');
		const edit = readPersonProfileEdit(formData);
		if (personId === '') return fail(400, personRequired);
		if (edit === null) return fail(400, { message: 'A name is required.' });
		const outcome = await updatePersonProfile(locals.supabase, personId, edit);
		if (outcome === personProfileSaves.emailTaken) {
			return fail(409, { message: 'That email address already belongs to someone else.' });
		}
		await updateAffiliationRole(locals, formData);
		return { message: `${edit.name} saved.` };
	},
	addLink: async ({ locals, request }: StaffFormEvent) => {
		await requireStaff(locals);
		const formData = await request.formData();
		const personId = String(formData.get('personId') ?? '');
		const link = readNewPersonLink(formData);
		if (personId === '') return fail(400, personRequired);
		if (link === null) return fail(400, { message: 'A label and a full web address are required.' });
		await addPersonLink(locals.supabase, personId, link);
		return { message: 'Link added.' };
	},
	removeLink: async ({ locals, request }: StaffFormEvent) => {
		await requireStaff(locals);
		const formData = await request.formData();
		const linkId = String(formData.get('linkId') ?? '');
		if (linkId === '') return fail(400, { message: 'A link is required.' });
		await removePersonLink(locals.supabase, linkId);
		return { message: 'Link removed.' };
	},
	addNote: async ({ locals, request }: StaffFormEvent) => {
		const user = await requireStaff(locals);
		const formData = await request.formData();
		const personId = String(formData.get('personId') ?? '');
		const body = String(formData.get('body') ?? '').trim();
		if (personId === '') return fail(400, personRequired);
		if (body === '') return fail(400, { message: 'A note needs some words.' });
		await addPersonNote(locals.supabase, personId, 'note', body, user.id);
		return { message: 'Note added.' };
	}
};

/**
 * The role is what a person does at one company, so it is saved with the
 * affiliation rather than the person, and only when the form names one.
 */
async function updateAffiliationRole(
	locals: App.Locals,
	formData: FormData
): Promise<void> {
	const contactId = String(formData.get('contactId') ?? '');
	if (contactId === '') return;
	await updateContactRole(locals.supabase, contactId, String(formData.get('role') ?? '').trim());
}
