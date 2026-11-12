import { describeOrganisationInFull, describeOrganisationList } from './describeOrganisation';
import { getMembersOfOrganisation } from '$lib/server/organisations/getMembersOfOrganisation';
import { getOrganisationsWithCounts } from '$lib/server/organisations/getOrganisationsWithCounts';
import { getProjectsForOrganisation } from '$lib/server/organisations/getProjectsForOrganisation';
import { getSwitchedOnModules } from '$lib/server/organisations/getSwitchedOnModules';
import { getDirectorsOfOrganisation } from '$lib/server/boardroom/getDirectorsOfOrganisation';
import { directorListSentence } from '$lib/data/boardroomDirector';
import { moduleListSentence } from '$lib/data/organisationModules';
import { usableModules } from '$lib/data/organisationModuleAccess';
import { canReachOrganisation, noSuchOrganisation, reachableOrganisation } from '../organisationAccess';
import { objectSchema, readText } from '../actionTypes';
import { organisationIdField } from './organisationDetailsFields';
import type { McpAction } from '../actionTypes';
import type { McpCaller } from '../resolveMcpCaller';
import type { Organisation } from '$lib/server/organisations/organisationRecord';

export const organisationReadActions: McpAction[] = [
	{
		name: 'list_organisations',
		area: 'organisations',
		audience: 'everyone',
		isWrite: false,
		summary:
			'the organisations you are on, each with its project count and people — staff see every one',
		inputSchema: objectSchema({}),
		run: async (caller) => {
			const register = await getOrganisationsWithCounts(caller.supabase);
			return describeOrganisationList(register.filter((organisation) => canReachOrganisation(caller, organisation)));
		}
	},
	{
		name: 'read_organisation',
		area: 'organisations',
		audience: 'everyone',
		isWrite: false,
		summary:
			'one organisation in full: the details we hold about it (company, invoicing, contract and data protection), ' +
			'which modules are switched on, its directors when Boardroom is on, its people and their standing, and its projects',
		inputSchema: objectSchema({ organisationId: organisationIdField }, ['organisationId']),
		run: async (caller, input) => {
			const organisation = await reachableOrganisation(caller, readText(input, 'organisationId'));
			if (organisation === null) return noSuchOrganisation;
			return describeInFull(caller, organisation);
		}
	}
];

async function describeInFull(caller: McpCaller, organisation: Organisation): Promise<string> {
	const [members, projects, switchedOn, directors] = await Promise.all([
		getMembersOfOrganisation(caller.supabase, organisation.id),
		getProjectsForOrganisation(caller.supabase, organisation.id),
		getSwitchedOnModules(caller.supabase, organisation.id),
		getDirectorsOfOrganisation(caller.supabase, organisation.id)
	]);
	const modules = usableModules(caller, { organisation, switchedOn });
	const modulesLine = `Modules switched on: ${moduleListSentence(modules)}`;
	const directorsLines = modules.includes('boardroom') ? [`Directors: ${directorListSentence(directors)}`] : [];
	const description = describeOrganisationInFull(organisation, members, projects);
	return [description, '', modulesLine, ...directorsLines].join('\n');
}
