import { fail } from '@sveltejs/kit';
import { getClient } from '$lib/server/clients/getClient';
import { hasCompanyNumber } from '$lib/server/clients/clientRecord';
import { groupClientsUnder, readGroupChoice } from '$lib/server/clients/groupClientsUnder';
import { importCompanyOfficers } from '$lib/server/clients/importCompanyOfficers';
import { isCompaniesHouseConfigured } from '$lib/server/companiesHouse/companiesHouseRequest';
import { requireStaff } from '$lib/server/auth/requireStaff';
import type { Actions } from './$types';

const importFailedMessage = 'Companies House could not be read just now — please try again.';

export const groupActions: Actions = {
	groupUnder: async ({ locals, params, request }) => {
		const user = await requireStaff(locals);
		const choice = readGroupChoice(await request.formData());
		if (choice === null) return fail(400, { message: 'Choose a group or name a new one.' });
		await groupClientsUnder(locals.supabase, [params.clientId], choice, user.id);
		return { message: 'Grouped.' };
	},
	importOfficers: async ({ locals, params }) => {
		const user = await requireStaff(locals);
		if (!isCompaniesHouseConfigured()) return fail(503, { message: 'Companies House is not configured.' });
		const client = await getClient(locals.supabase, params.clientId);
		if (client === null) return fail(404, { message: 'That client could not be found.' });
		if (!hasCompanyNumber(client)) return fail(400, { message: 'Record the company number first.' });
		try {
			const outcome = await importCompanyOfficers(locals.supabase, client, user.id);
			return { message: `${outcome.importedCount} officer(s) added, ${outcome.alreadyListedCount} already listed.` };
		} catch (failure) {
			console.error('Officer import failed', failure);
			return fail(502, { message: importFailedMessage });
		}
	}
};
