import { fail } from '@sveltejs/kit';
import { getPerson } from '../getPerson';
import { getCompaniesForPerson } from '../getCompaniesForPerson';
import { hasFoundPerson, readPersonForClaude } from '../readPersonForClaude';
import { readReviewedFindings, savePersonFindings } from './savePersonFindings';
import { requireStaff } from '$lib/server/auth/requireStaff';
import { researchPerson } from './researchPerson';
import type { StaffFormEvent } from '../personFormActions';

const researchFailedMessage = 'The web could not be searched just now — please try again.';

export const researchFormActions = {
	researchPerson: async (event: StaffFormEvent) => {
		await requireStaff(event.locals);
		const subject = await readPersonForClaude(event);
		if (!hasFoundPerson(subject)) return subject;
		const { person, companies } = subject;
		try {
			return { findings: await researchPerson(person, companies) };
		} catch (failure) {
			console.error('Person research failed', failure);
			return fail(502, { message: researchFailedMessage });
		}
	},
	saveFindings: async ({ locals, request }: StaffFormEvent) => {
		const user = await requireStaff(locals);
		const reviewed = readReviewedFindings(await request.formData());
		if (reviewed === null) return fail(400, { message: 'A person is required.' });
		const person = await getPerson(locals.supabase, reviewed.personId);
		if (person === null) return fail(400, { message: 'That person could not be found.' });
		const companies = await getCompaniesForPerson(locals.supabase, person.id);
		const linkCount = await savePersonFindings(locals.supabase, reviewed, person.name, companies, user.id);
		return { message: describeSave(linkCount, reviewed.summary !== '') };
	}
};

function describeSave(linkCount: number, hasSummary: boolean): string {
	const links = `${linkCount} new link${linkCount === 1 ? '' : 's'}`;
	if (!hasSummary) return `${links} kept.`;
	return `${links} kept and the summary saved to the notes.`;
}
