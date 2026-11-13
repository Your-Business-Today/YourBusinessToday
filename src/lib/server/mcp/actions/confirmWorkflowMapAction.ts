import { clientIdField, withPortalVisitor } from '../portalVisitorAccess';
import { companyDetails } from '$lib/data/companyDetails';
import { confirmWorkflowMap } from '$lib/server/workflowMap/confirmWorkflowMap';
import { isRefused } from '$lib/server/companyContext/contextText';
import { mapStageField } from './workflowMapFields';
import { mapStageNames } from '$lib/data/workflowMap/workflowMapWords';
import { objectSchema, textField } from '../actionTypes';
import { validateMapConfirmation } from '$lib/server/workflowMap/validateMapConfirmation';
import type { McpAction } from '../actionTypes';
import type { McpCaller } from '../resolveMcpCaller';
import type { PortalVisitor } from '$lib/portal/portalVisitor';

export const confirmWorkflowMapAction: McpAction = {
	name: 'confirm_workflow_map',
	area: 'support',
	audience: 'everyone',
	isWrite: true,
	summary: 'for a client contact: confirm the version of your workflow map you have checked, once no station is marked not right',
	guidance:
		'Confirm only when the person says so: confirming tells Your Business Today this is how their business works, and ' +
		'the services we build for them are raised from it. A confirmed version takes no more marks, a confirmed Before is ' +
		'kept as the business as we found it, and a later After needs confirming again.',
	inputSchema: objectSchema(
		{
			clientId: clientIdField,
			stage: mapStageField,
			versionNumber: textField('The version you are confirming, as read_my_workflow_map gives it')
		},
		['stage', 'versionNumber']
	),
	run: async (caller, input) => withPortalVisitor(caller, input, (visitor) => confirmMap(caller, visitor, input))
};

async function confirmMap(caller: McpCaller, visitor: PortalVisitor, input: Record<string, unknown>): Promise<string> {
	const choice = validateMapConfirmation(input);
	if (isRefused(choice)) return choice.refusal;
	const confirmer = {
		clientId: visitor.clientId,
		accountId: caller.accountId,
		organisationName: visitor.organisationName,
		siteOrigin: companyDetails.websiteUrl
	};
	const refusal = await confirmWorkflowMap(confirmer, choice);
	if (refusal !== null) return refusal.refusal;
	const mapName = `${mapStageNames[choice.stage]} workflow map`;
	return `Version ${choice.versionNumber} of ${visitor.organisationName}'s ${mapName} is confirmed, and Your Business Today has been told.`;
}
