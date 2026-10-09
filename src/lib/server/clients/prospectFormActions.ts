import { fail } from '@sveltejs/kit';
import { addProspectAsLead, readProspectSeed } from './addProspectAsLead';
import { getClient } from './getClient';
import { importCompanyOfficers } from './importCompanyOfficers';
import { isCompaniesHouseConfigured } from '$lib/server/companiesHouse/companiesHouseRequest';
import { requireStaff } from '$lib/server/auth/requireStaff';
import type { StaffFormEvent } from '$lib/server/people/personFormActions';

const seedRequired = { message: 'A company name and number are required.' };
const officerImportFailedMessage =
	'The company is on the register, but its officers could not be read just now.';

/**
 * A Companies House result becomes a lead the same way from the prospect
 * table and from the map, so both routes spread these.
 */
export const prospectFormActions = {
	addLead: async ({ locals, request }: StaffFormEvent) => {
		const user = await requireStaff(locals);
		const prospect = readProspectSeed(await request.formData());
		if (prospect === null) return fail(400, seedRequired);
		const outcome = await addProspectAsLead(locals.supabase, prospect, user.id);
		if (outcome.wasAlreadyListed) {
			return { message: `${prospect.name} is already on the register.`, clientId: outcome.clientId };
		}
		return { message: `${prospect.name} added as a lead.`, clientId: outcome.clientId };
	},
	addLeadWithDirectors: async ({ locals, request }: StaffFormEvent) => {
		const user = await requireStaff(locals);
		const prospect = readProspectSeed(await request.formData());
		if (prospect === null) return fail(400, seedRequired);
		const outcome = await addProspectAsLead(locals.supabase, prospect, user.id);
		const client = await getClient(locals.supabase, outcome.clientId);
		if (client === null) return fail(404, { message: 'That client could not be found.' });
		if (!isCompaniesHouseConfigured()) {
			return { message: `${prospect.name} added, but Companies House is not configured.`, clientId: outcome.clientId };
		}
		try {
			const officers = await importCompanyOfficers(locals.supabase, client, user.id);
			return {
				message: `${prospect.name} on the register with ${officers.importedCount} officer(s) added.`,
				clientId: outcome.clientId
			};
		} catch (failure) {
			console.error('Officer import failed', failure);
			return { message: officerImportFailedMessage, clientId: outcome.clientId };
		}
	}
};
