import { error } from '@sveltejs/kit';
import { getGroupParents } from '$lib/server/clients/getGroupParents';
import { getPerson } from '$lib/server/people/getPerson';
import { getCompaniesForPerson } from '$lib/server/people/getCompaniesForPerson';
import { getPersonEventsForClients } from '$lib/server/people/getPersonEventsForClients';
import { approachFormActions } from '$lib/server/people/approachFormActions';
import { importActions, pendingAppointmentsFor } from './importActions';
import { personFormActions } from '$lib/server/people/personFormActions';
import { requireStaff } from '$lib/server/auth/requireStaff';
import { researchFormActions } from '$lib/server/people/research/researchFormActions';
import type { Actions, PageServerLoad } from './$types';

const importCompaniesRequest = 'companies';

export const load: PageServerLoad = async ({ locals, params, url }) => {
	await requireStaff(locals);
	const person = await getPerson(locals.supabase, params.personId);
	if (person === null) error(404, 'That person could not be found');
	const companies = await getCompaniesForPerson(locals.supabase, person.id);
	const isImportRequested = url.searchParams.get('import') === importCompaniesRequest;
	const [parents, events, pendingAppointments] = await Promise.all([
		getGroupParents(locals.supabase),
		getPersonEventsForClients(locals.supabase, companies.map((company) => company.id)),
		isImportRequested ? pendingAppointmentsFor(person, companies) : null
	]);
	return { person, companies, parents, events, pendingAppointments };
};

export const actions: Actions = {
	...personFormActions,
	...importActions,
	...approachFormActions,
	...researchFormActions
};
