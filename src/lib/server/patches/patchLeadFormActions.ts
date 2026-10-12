import { fail } from '@sveltejs/kit';
import { addPatchCompanyAsLead } from './addPatchCompanyAsLead';
import { getPatch } from './getPatch';
import { readProspectSeed } from '$lib/server/clients/addProspectAsLead';
import { requireStaff } from '$lib/server/auth/requireStaff';
import { validateProspect } from '$lib/data/prospectRules';
import type { StaffFormEvent } from '$lib/server/people/personFormActions';

/** Add as lead from the patch map: the same lead the area map adds, with the patch's feed told. */
export const patchLeadFormActions = {
	addLead: async ({ locals, request }: StaffFormEvent) => {
		const user = await requireStaff(locals);
		const formData = await request.formData();
		const patch = await getPatch(locals.supabase, String(formData.get('patchId') ?? ''));
		if (patch === null) return fail(404, { message: 'That patch could not be found.' });
		const prospect = readProspectSeed(formData);
		const refusal = validateProspect(prospect);
		if (refusal !== null) return fail(400, { message: refusal });
		const outcome = await addPatchCompanyAsLead(locals.supabase, patch, prospect, user.id);
		const verb = outcome.wasAlreadyListed ? 'is already on the register' : 'added as a lead';
		return { message: `${prospect.name} ${verb}.`, clientId: outcome.clientId };
	}
};
