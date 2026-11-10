import { contextOrganisation } from './contextOrganisation';
import { describeConfirmedContext, notConfirmedYet } from './describeConfirmedContext';
import { findLatestVersion } from '$lib/server/companyContext/findLatestVersion';
import { getGoalsRaisedFromContext } from '$lib/server/goals/getGoalsRaisedFromContext';
import { getProjectsOfOrganisation } from '$lib/server/projects/getProjectsOfOrganisation';
import { objectSchema } from '../actionTypes';
import { organisationIdField } from './organisationDetailsFields';
import { readConfirmedCompanyContext } from '$lib/server/companyContext/readConfirmedCompanyContext';
import type { McpAction } from '../actionTypes';
import type { McpCaller } from '../resolveMcpCaller';

export const servicesGuidance =
	"Propose the services in the offer's order, as one list for the staff member: first the data harness, " +
	'taking the sources in the order given, then one service per process, each saying which parts of the map it ' +
	'serves. Change the order or the grouping where the context shows a better one, and say why. Raise nothing ' +
	'until the staff member agrees, as raising a goal always works: then raise each service they agreed as a goal ' +
	"on the client's project with create_goal_with_tasks, with a measure the client can check, its first tasks " +
	'and contextVersionId, so the goal links back to the confirmed context and the client sees it on their portal. ' +
	'A service already raised from their confirmed context is not raised again.';

export const confirmedContextActions: McpAction[] = [
	{
		name: 'read_confirmed_company_context',
		area: 'organisations',
		audience: 'staff',
		isWrite: false,
		summary:
			'read the company context a client confirmed, with every source, record, process and role, the services ' +
			"it suggests in the offer's order, the client's projects and the goals already raised from it",
		guidance: servicesGuidance,
		inputSchema: objectSchema({ organisationId: organisationIdField }, ['organisationId']),
		run: async (caller, input) => readConfirmedContext(caller, input)
	}
];

async function readConfirmedContext(caller: McpCaller, input: Record<string, unknown>): Promise<string> {
	const organisation = await contextOrganisation(caller, input);
	if (typeof organisation === 'string') return organisation;
	const confirmed = await readConfirmedCompanyContext(caller.supabase, organisation.id);
	if (confirmed === null) return notConfirmedYet(organisation.name);
	const { confirmation } = confirmed;
	const latest = await findLatestVersion(caller.supabase, organisation.id);
	const projects = await getProjectsOfOrganisation(caller.supabase, organisation.id);
	const projectIds = projects.map((project) => project.id);
	const goalsRaised = await getGoalsRaisedFromContext(caller.supabase, projectIds);
	return describeConfirmedContext({
		organisationName: organisation.name,
		confirmed,
		latestVersionNumber: latest?.versionNumber ?? confirmation.versionNumber,
		projects,
		goalsRaised
	});
}
