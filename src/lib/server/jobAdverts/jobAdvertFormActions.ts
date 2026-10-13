import { fail } from '@sveltejs/kit';
import { findJobAdverts } from './findJobAdverts';
import { requireStaff } from '$lib/server/auth/requireStaff';
import { validateJobAdvertSubject } from './jobAdvertSubject';
import type { StaffFormEvent } from '$lib/server/people/personFormActions';

const searchFailedMessage = 'The job boards could not be searched just now — please try again.';

/** Shared by every page that shows a company, so its adverts can be asked for wherever staff are looking at it. */
export const jobAdvertFormActions = {
	findJobAdverts: async ({ locals, request }: StaffFormEvent) => {
		await requireStaff(locals);
		const formData = await request.formData();
		const subject = {
			companyName: String(formData.get('companyName') ?? '').trim(),
			place: String(formData.get('place') ?? '').trim()
		};
		const problem = validateJobAdvertSubject(subject);
		if (problem !== null) return fail(400, { message: problem });
		try {
			return { jobAdverts: await findJobAdverts(subject) };
		} catch (failure) {
			console.error('Job advert search failed', failure);
			return fail(502, { message: searchFailedMessage });
		}
	}
};
