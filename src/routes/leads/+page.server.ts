import { fail } from '@sveltejs/kit';
import { addLead, readLeadSeed } from '$lib/server/clients/addLead';
import { leadsRegister } from '$lib/data/salesRegisters';
import { loadSalesRegister } from '$lib/server/salesRegisters/loadSalesRegister';
import { moveStageAction } from '$lib/server/salesRegisters/moveStageAction';
import { requireStaff } from '$lib/server/auth/requireStaff';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => loadSalesRegister(locals, url, leadsRegister);

export const actions: Actions = {
	addLead: async ({ locals, request }) => {
		const user = await requireStaff(locals);
		const seed = readLeadSeed(await request.formData(), user.id);
		if (seed === null) return fail(400, { message: 'A company name is required.' });
		await addLead(locals.supabase, seed, user.id);
		return { message: `${seed.name} added as a lead.` };
	},
	moveStage: moveStageAction
};
