import { fail } from '@sveltejs/kit';
import { createOrganisation } from '$lib/server/organisations/createOrganisation';
import { isSubOrganisation } from '$lib/server/organisations/organisationRecord';
import { readOrganisationDetails } from '$lib/server/organisations/organisationDetailsForm';
import { requireOrganisationManager } from '$lib/server/auth/requireOrganisationManager';
import { validateOrganisationDetails } from '$lib/data/organisationRules';
import type { Actions } from './$types';

const nameTaken = 'A business of that name is already under this organisation.';
const noNesting = 'A sub-organisation cannot have sub-organisations of its own.';

export const subOrganisationActions = {
	createSubOrganisation: async ({ locals, params, request }) => {
		const { user, organisation } = await requireOrganisationManager(locals, params.organisationId);
		if (isSubOrganisation(organisation)) return fail(400, { message: noNesting });
		const details = readOrganisationDetails(await request.formData());
		const refusal = validateOrganisationDetails(details);
		if (refusal !== null) return fail(400, { message: refusal });
		const organisationId = await createOrganisation(locals.supabase, {
			details,
			parentOrganisationId: organisation.id,
			createdBy: user.id
		});
		if (organisationId === null) return fail(400, { message: nameTaken });
		return { message: `${details.name} added under ${organisation.name}.` };
	}
} satisfies Actions;
