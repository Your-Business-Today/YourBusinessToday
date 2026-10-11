import { fail, redirect } from '@sveltejs/kit';
import { deleteOrganisation } from '$lib/server/organisations/deleteOrganisation';
import { readOrganisationDetails } from '$lib/server/organisations/organisationDetailsForm';
import { requireOrganisationManager } from '$lib/server/auth/requireOrganisationManager';
import { requireStaff } from '$lib/server/auth/requireStaff';
import { updateOrganisationDetails } from '$lib/server/organisations/updateOrganisationDetails';
import { validateOrganisationDetails } from '$lib/data/organisationRules';
import type { Actions } from './$types';

export const organisationDetailsActions = {
	updateDetails: async ({ locals, params, request }) => {
		const { organisation } = await requireOrganisationManager(locals, params.organisationId);
		const details = readOrganisationDetails(await request.formData());
		const refusal = validateOrganisationDetails(details);
		if (refusal !== null) return fail(400, { message: refusal });
		await updateOrganisationDetails(locals.supabase, organisation.id, details);
		return { message: `${details.name} saved.` };
	},
	deleteOrganisation: async ({ locals, params }) => {
		await requireStaff(locals);
		await deleteOrganisation(locals.supabase, params.organisationId);
		redirect(303, '/organisations');
	}
} satisfies Actions;
