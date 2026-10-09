import { fail } from '@sveltejs/kit';
import { addLead, readLeadSeed } from '$lib/server/clients/addLead';
import { listClients } from '$lib/server/clients/listClients';
import { moveClientStage } from '$lib/server/clients/moveClientStage';
import { parseClientStage } from '$lib/data/clientLifecycle';
import { requireStaff } from '$lib/server/auth/requireStaff';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	await requireStaff(locals);
	const requestedStage = url.searchParams.get('stage');
	const stage = requestedStage === null ? null : parseClientStage(requestedStage);
	return {
		clients: await listClients(locals.supabase, stage),
		stage
	};
};

export const actions: Actions = {
	addLead: async ({ locals, request }) => {
		const user = await requireStaff(locals);
		const seed = readLeadSeed(await request.formData(), user.id);
		if (seed === null) return fail(400, { message: 'A company name is required.' });
		await addLead(locals.supabase, seed, user.id);
		return { message: `${seed.name} added as a lead.` };
	},
	moveStage: async ({ locals, request }) => {
		const user = await requireStaff(locals);
		const formData = await request.formData();
		const clientId = String(formData.get('clientId') ?? '');
		if (clientId === '') return fail(400, { message: 'A client is required.' });
		await moveClientStage(
			locals.supabase,
			clientId,
			parseClientStage(formData.get('stage')),
			user.id
		);
		return { message: 'Stage updated.' };
	}
};
