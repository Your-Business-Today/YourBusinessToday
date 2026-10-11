import { describeOrganisationInFull, describeOrganisationList } from './describeOrganisation';
import { getOrganisation } from '$lib/server/organisations/getOrganisation';
import { getOrganisationFamily } from '$lib/server/organisations/getOrganisationFamily';
import { getMembersOfOrganisation } from '$lib/server/organisations/getMembersOfOrganisation';
import { getOrganisationsWithCounts } from '$lib/server/organisations/getOrganisationsWithCounts';
import { getProjectsForOrganisation } from '$lib/server/organisations/getProjectsForOrganisation';
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
			'the organisations you are on, each with its sub-organisations, project count and people — staff see every one',
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
			'one organisation in full: how it is invoiced, its people and their standing, its sub-organisations and its projects',
		inputSchema: objectSchema({ organisationId: organisationIdField }, ['organisationId']),
		run: async (caller, input) => {
			const organisation = await reachableOrganisation(caller, readText(input, 'organisationId'));
			if (organisation === null) return noSuchOrganisation;
			return describeInFull(caller, organisation);
		}
	}
];

async function describeInFull(caller: McpCaller, organisation: Organisation): Promise<string> {
	const [parent, family, members, projects] = await Promise.all([
		parentOf(caller, organisation),
		getOrganisationFamily(caller.supabase, organisation.id),
		getMembersOfOrganisation(caller.supabase, organisation.id),
		getProjectsForOrganisation(caller.supabase, organisation.id)
	]);
	const children = family.filter((candidate) => candidate.parentOrganisationId === organisation.id);
	return describeOrganisationInFull(organisation, parent, children, members, projects);
}

function parentOf(caller: McpCaller, organisation: Organisation): Promise<Organisation | null> {
	if (organisation.parentOrganisationId === null) return Promise.resolve(null);
	return getOrganisation(caller.supabase, organisation.parentOrganisationId);
}
