import { readLatestCompanyContext } from '$lib/server/companyContext/readLatestCompanyContext';
import { objectSchema } from '../actionTypes';
import { contextOrganisation } from './contextOrganisation';
import { describeContextRun } from './describeContextRun';
import { organisationIdField } from './organisationDetailsFields';
import type { McpAction } from '../actionTypes';
import type { McpCaller } from '../resolveMcpCaller';

export const contextRunActionName = 'start_context_run';

export const contextRunActions: McpAction[] = [
	{
		name: contextRunActionName,
		area: 'organisations',
		audience: 'everyone',
		isWrite: false,
		summary:
			"start a run of an organisation's company context: the steps to follow, fitted to what Your Business Today already holds",
		guidance:
			'The one prompt on the portal starts here. It changes nothing: it answers with the walk, which reads the ' +
			'client\'s connectors read only, asks them only for what is still missing, and writes with ' +
			'record_company_context once they say yes.',
		inputSchema: objectSchema({ organisationId: organisationIdField }, ['organisationId']),
		run: async (caller, input) => startContextRun(caller, input)
	}
];

async function startContextRun(caller: McpCaller, input: Record<string, unknown>): Promise<string> {
	const organisation = await contextOrganisation(caller, input);
	if (typeof organisation === 'string') return organisation;
	const context = await readLatestCompanyContext(caller.supabase, organisation.id);
	return describeContextRun(organisation, context);
}
