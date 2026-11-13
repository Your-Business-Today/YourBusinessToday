import { error } from '@sveltejs/kit';
import { getClient } from '$lib/server/clients/getClient';
import { companyNumberOf, hasCompanyNumber } from '$lib/server/clients/clientRecord';
import { getChildrenOfClient } from '$lib/server/clients/getChildrenOfClient';
import { getEventsForClient } from '$lib/server/clients/getEventsForClient';
import { getPeopleForClient } from '$lib/server/clients/getPeopleForClient';
import { getProjectsForClient } from '$lib/server/clients/getProjectsForClient';
import { getRegisterCompany } from '$lib/server/register/getRegisterCompany';
import { standingLine } from '$lib/data/standingLine';
import { listGroupParents } from '$lib/server/clients/listGroupParents';
import { getSupportTasksForClient } from '$lib/server/support/getOpenSupportTasks';
import { getUnassignedProjects } from '$lib/server/projects/getUnassignedProjects';
import { groupActions } from './groupActions';
import { isCompaniesHouseConfigured } from '$lib/server/companiesHouse/companiesHouseRequest';
import { listObservationsForCompany } from '$lib/server/observations/listObservations';
import { personFormActions } from '$lib/server/people/personFormActions';
import { profileActions } from './profileActions';
import { continuityCopyActions } from './continuityCopyActions';
import { registerActions } from './registerActions';
import { setUpActions } from './setUpActions';
import { getJobAdvertsForClient } from '$lib/server/jobAdverts/getJobAdvertsForClient';
import { requireStaff } from '$lib/server/auth/requireStaff';
import { getConversationsForClient } from '$lib/server/leadConversations/getConversationsForClient';
import { getStaffDirectory } from '$lib/server/projects/getStaffDirectory';
import { leadConversationActions } from './leadConversationActions';
import { broughtInByActions } from './broughtInByActions';
import { keepOnItsRegister } from '$lib/server/salesRegisters/keepOnItsRegister';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params, url }) => {
	const viewer = await requireStaff(locals);
	const client = await getClient(locals.supabase, params.clientId);
	if (client === null) error(404, 'That company could not be found');
	keepOnItsRegister(url, params.register, client.stage);
	const [people, projects, supportTasks, unassignedProjects, events, children, parents, parent, observations, registerCompany, jobAdverts, conversations, staffMembers] =
		await Promise.all([
			getPeopleForClient(locals.supabase, client.id),
			getProjectsForClient(locals.supabase, client.id),
			getSupportTasksForClient(locals.supabase, client.id),
			getUnassignedProjects(locals.supabase),
			getEventsForClient(locals.supabase, client.id),
			getChildrenOfClient(locals.supabase, client.id),
			listGroupParents(locals.supabase),
			client.parentClientId === null ? null : getClient(locals.supabase, client.parentClientId),
			listObservationsForCompany(locals.supabase, companyNumberOf(client)),
			getRegisterCompany(locals.supabase, companyNumberOf(client)),
			getJobAdvertsForClient(locals.supabase, client.id),
			getConversationsForClient(locals.supabase, client.id),
			getStaffDirectory(locals.supabase)
		]);
	const canImportOfficers = hasCompanyNumber(client) && isCompaniesHouseConfigured();
	const figures = registerCompany?.figures ?? null;
	const standing = registerCompany === null ? '' : standingLine(registerCompany);
	return { client, people, projects, supportTasks, unassignedProjects, events, children, parents, parent, observations, figures, standing, canImportOfficers, jobAdverts, conversations, staffMembers, viewerId: viewer.id };
};

export const actions: Actions = {
	...registerActions,
	...setUpActions,
	...profileActions,
	...continuityCopyActions,
	...personFormActions,
	...groupActions,
	...leadConversationActions,
	...broughtInByActions
};
