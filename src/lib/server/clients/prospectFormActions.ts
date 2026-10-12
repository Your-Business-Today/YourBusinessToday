import { fail, isActionFailure, type ActionFailure } from '@sveltejs/kit';
import { addProspectAsLead, readProspectSeed } from './addProspectAsLead';
import { getClient } from './getClient';
import { importCompanyOfficers } from './importCompanyOfficers';
import { isCompaniesHouseConfigured } from '$lib/server/companiesHouse/companiesHouseRequest';
import { requireStaff } from '$lib/server/auth/requireStaff';
import { validateProspect } from '$lib/data/prospectRules';
import type { StaffFormEvent } from '$lib/server/people/personFormActions';

const officerImportFailedMessage =
	'The company is on the register, but its officers could not be read just now.';

type ProspectRefusal = ActionFailure<{ message: string }>;

function isRefusal(added: unknown): added is ProspectRefusal {
	return isActionFailure(added);
}

async function addSubmittedProspect({ locals, request }: StaffFormEvent) {
	const user = await requireStaff(locals);
	const prospect = readProspectSeed(await request.formData());
	const refusal = validateProspect(prospect);
	if (refusal !== null) return fail(400, { message: refusal });
	const outcome = await addProspectAsLead(locals.supabase, prospect, user.id);
	return { user, prospect, outcome };
}

/**
 * A Companies House result becomes a lead the same way from the prospect
 * table and from the map, so both routes spread these.
 */
export const prospectFormActions = {
	addLead: async (event: StaffFormEvent) => {
		const added = await addSubmittedProspect(event);
		if (isRefusal(added)) return added;
		const { prospect, outcome } = added;
		if (outcome.wasAlreadyListed) {
			return { message: `${prospect.name} is already on the register.`, clientId: outcome.clientId };
		}
		return { message: `${prospect.name} added as a lead.`, clientId: outcome.clientId };
	},
	addLeadWithDirectors: async (event: StaffFormEvent) => {
		const added = await addSubmittedProspect(event);
		if (isRefusal(added)) return added;
		const { user, prospect, outcome } = added;
		const { locals } = event;
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
