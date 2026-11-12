import { fail } from '@sveltejs/kit';
import { addLead, readLeadSeed } from '$lib/server/clients/addLead';
import { leadsRegister } from '$lib/data/salesRegisters';
import { loadSalesRegister } from '$lib/server/salesRegisters/loadSalesRegister';
import { moveStageAction } from '$lib/server/salesRegisters/moveStageAction';
import { readPickedOrganisationId } from '$lib/server/frame/pickedOrganisation';
import { requireStaff } from '$lib/server/auth/requireStaff';
import type { Actions, PageServerLoad } from './$types';

const noOrganisationPicked = 'Pick an organisation in the side bar to add a lead to its register.';

export const load: PageServerLoad = async ({ locals, url, parent }) => {
	const { framePicks } = await parent();
	return loadSalesRegister(locals, url, leadsRegister, framePicks);
};

export const actions: Actions = {
	addLead: async ({ locals, request }) => {
		const user = await requireStaff(locals);
		const organisationId = await readPickedOrganisationId(locals, user.id);
		if (organisationId === null) return fail(400, { message: noOrganisationPicked });
		const seed = readLeadSeed(await request.formData(), user.id, organisationId);
		if (seed === null) return fail(400, { message: 'A company name is required.' });
		await addLead(locals.supabase, seed, user.id);
		return { message: `${seed.name} added as a lead.` };
	},
	moveStage: moveStageAction
};
