import { fail } from '@sveltejs/kit';
import { createOrganisation } from '$lib/server/organisations/createOrganisation';
import { getOrganisationsWithCounts } from '$lib/server/organisations/getOrganisationsWithCounts';
import { isStaffMember } from '$lib/server/auth/requireOrganisationAccess';
import { readOrganisationDetails } from '$lib/server/organisations/organisationDetailsForm';
import { requireStaff } from '$lib/server/auth/requireStaff';
import { requireUser } from '$lib/server/auth/requireUser';
import { validateOrganisationDetails } from '$lib/data/organisationRules';
import type { Actions, PageServerLoad } from './$types';

const nameTaken = 'An organisation of that name already exists.';

export const load: PageServerLoad = async ({ locals }) => {
	await requireUser(locals);
	return {
		organisations: await getOrganisationsWithCounts(locals.supabase),
		canCreate: await isStaffMember(locals)
	};
};

export const actions: Actions = {
	createOrganisation: async ({ locals, request }) => {
		const user = await requireStaff(locals);
		const details = readOrganisationDetails(await request.formData());
		const refusal = validateOrganisationDetails(details);
		if (refusal !== null) return fail(400, { message: refusal });
		const organisationId = await createOrganisation(locals.supabase, {
			details,
			parentOrganisationId: null,
			createdBy: user.id
		});
		if (organisationId === null) return fail(400, { message: nameTaken });
		return { message: `${details.name} created.` };
	}
};
