import { fail } from '@sveltejs/kit';
import { noSuchPatchMessage, openPatchForm } from '$lib/server/patches/openPatchForm';
import { addPremisesAsLead } from './addPremisesAsLead';
import { getPremises } from './getPremises';
import { validatePremisesInPatch } from './validatePremisesInPatch';
import type { StaffFormEvent } from '$lib/server/people/personFormActions';

export const premisesFormActions = {
	addPremisesAsLead: async (event: StaffFormEvent) => {
		const { locals } = event;
		const { user, formData, patch } = await openPatchForm(event);
		if (patch === null) return fail(404, { message: noSuchPatchMessage });
		const premises = await getPremises(locals.supabase, String(formData.get('premisesId') ?? ''));
		const refusal = validatePremisesInPatch(premises, patch);
		if (refusal !== null || premises === null) return fail(404, { message: refusal ?? '' });
		const outcome = await addPremisesAsLead(locals.supabase, premises, patch.id, user.id);
		const verb = outcome.wasAlreadyListed ? 'is already on the register' : 'added as a lead';
		return { message: `${premises.businessName} ${verb}.`, clientId: outcome.clientId };
	}
};
