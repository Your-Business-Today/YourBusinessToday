import { fail } from '@sveltejs/kit';
import { noSuchPatchMessage, openPatchForm } from './openPatchForm';
import { addPatchCompanyAsLead } from './addPatchCompanyAsLead';
import { readProspectSeed } from '$lib/server/clients/addProspectAsLead';
import { validateProspect } from '$lib/data/prospectRules';
import type { StaffFormEvent } from '$lib/server/people/personFormActions';

/** Add as lead from the patch map: the same lead the area map adds, with the patch's feed told. */
export const patchLeadFormActions = {
	addLead: async (event: StaffFormEvent) => {
		const { locals } = event;
		const { user, formData, patch } = await openPatchForm(event);
		if (patch === null) return fail(404, { message: noSuchPatchMessage });
		const prospect = readProspectSeed(formData);
		const refusal = validateProspect(prospect);
		if (refusal !== null) return fail(400, { message: refusal });
		const outcome = await addPatchCompanyAsLead(locals.supabase, patch, prospect, user.id);
		const verb = outcome.wasAlreadyListed ? 'is already on the register' : 'added as a lead';
		return { message: `${prospect.name} ${verb}.`, clientId: outcome.clientId };
	}
};
