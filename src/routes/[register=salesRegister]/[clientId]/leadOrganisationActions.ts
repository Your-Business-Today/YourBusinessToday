import { fail } from '@sveltejs/kit';
import { isRefusal } from '$lib/server/portal/portalFormReading';
import { openLeadOrganisation } from '$lib/server/onboarding/openLeadOrganisation';
import { requireStaff } from '$lib/server/auth/requireStaff';
import type { Actions } from './$types';

const badRequest = 400;

export const leadOrganisationActions: Actions = {
	openOrganisation: async ({ locals, params }) => {
		const user = await requireStaff(locals);
		const request = { clientId: params.clientId, organisationId: null, actorAccountId: user.id };
		const opened = await openLeadOrganisation(request);
		if (isRefusal(opened)) return fail(badRequest, { message: opened.refusal });
		return { message: `${opened.companyName}'s organisation, ${opened.organisation.name}, is open. Its domain and workflow map can be built now.` };
	}
};
