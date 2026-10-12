import { fail } from '@sveltejs/kit';
import { addPremisesAsLead } from './addPremisesAsLead';
import { getPatch } from '$lib/server/patches/getPatch';
import { getPremises } from './getPremises';
import { requireStaff } from '$lib/server/auth/requireStaff';
import { validatePremisesInPatch } from './validatePremisesInPatch';
import type { StaffFormEvent } from '$lib/server/people/personFormActions';

export const premisesFormActions = {
	addPremisesAsLead: async ({ locals, request }: StaffFormEvent) => {
		const user = await requireStaff(locals);
		const formData = await request.formData();
		const patch = await getPatch(locals.supabase, String(formData.get('patchId') ?? ''));
		if (patch === null) return fail(404, { message: 'That patch could not be found.' });
		const premises = await getPremises(locals.supabase, String(formData.get('premisesId') ?? ''));
		const refusal = validatePremisesInPatch(premises, patch);
		if (refusal !== null || premises === null) return fail(404, { message: refusal ?? '' });
		const outcome = await addPremisesAsLead(locals.supabase, premises, patch.id, user.id);
		const verb = outcome.wasAlreadyListed ? 'is already on the register' : 'added as a lead';
		return { message: `${premises.businessName} ${verb}.`, clientId: outcome.clientId };
	}
};
