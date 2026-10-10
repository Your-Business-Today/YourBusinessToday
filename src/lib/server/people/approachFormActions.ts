import { fail } from '@sveltejs/kit';
import { addPersonNote } from './addPersonNote';
import { composeApproachNote, draftApproach } from './draftApproach';
import { hasFoundPerson, readPersonForClaude } from './readPersonForClaude';
import { requireStaff } from '$lib/server/auth/requireStaff';
import type { StaffFormEvent } from './personFormActions';

const draftFailedMessage = 'The approach could not be drafted just now — please try again.';

/**
 * An approach is drafted from every company a person holds, so it reads the
 * same whether it was asked for on their page or on one of those companies.
 */
export const approachFormActions = {
	draftApproach: async (event: StaffFormEvent) => {
		const { locals } = event;
		const user = await requireStaff(locals);
		const subject = await readPersonForClaude(event);
		if (!hasFoundPerson(subject)) return subject;
		const { person, companies } = subject;
		try {
			return { approachDraft: await draftApproach(locals.supabase, person, companies, user.id) };
		} catch (failure) {
			console.error('Approach draft failed', failure);
			return fail(502, { message: draftFailedMessage });
		}
	},
	saveApproach: async ({ locals, request }: StaffFormEvent) => {
		const user = await requireStaff(locals);
		const formData = await request.formData();
		const personId = String(formData.get('personId') ?? '');
		const openingMessage = String(formData.get('openingMessage') ?? '').trim();
		const callPlan = String(formData.get('callPlan') ?? '').trim();
		if (personId === '') return fail(400, { message: 'A person is required.' });
		if (openingMessage === '' && callPlan === '') return fail(400, { message: 'Nothing to save.' });
		await addPersonNote(
			locals.supabase,
			personId,
			'approach',
			composeApproachNote(openingMessage, callPlan),
			user.id
		);
		return { message: 'Approach saved to the notes.' };
	}
};
