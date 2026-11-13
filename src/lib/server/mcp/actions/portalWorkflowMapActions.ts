import { describeVisitorStanding, clientIdField, withPortalVisitor } from '../portalVisitorAccess';
import { confirmWorkflowMapAction } from './confirmWorkflowMapAction';
import { describeWorkflowMap } from './describeWorkflowMap';
import { isRefused } from '$lib/server/filing/filedText';
import { mapStageField } from './workflowMapFields';
import { mapStageNames } from '$lib/data/workflowMap/workflowMapWords';
import { mapStages } from '$lib/data/workflowMap/workflowMap';
import { markWorkflowMapStation } from '$lib/server/workflowMap/markWorkflowMapStation';
import { objectSchema, textField } from '../actionTypes';
import { readWorkflowMapOfClient, type ClientWorkflowMap } from '$lib/server/workflowMap/readWorkflowMapOfClient';
import { stationMarkStates } from '$lib/data/workflowMap/stationReview';
import { validateStationMark } from '$lib/server/workflowMap/validateStationMark';
import type { McpAction } from '../actionTypes';
import type { McpCaller } from '../resolveMcpCaller';
import type { PortalVisitor } from '$lib/portal/portalVisitor';

export const noWorkflowMapFiledYet =
	'Your workflow map has not been filed yet. It is filed by the Claude of whoever maps your business with you, and then it is yours to check here.';
const markGuidance =
	'The workflow map in your portal is where you mark each station right or not right, and this is the same mark. ' +
	'Mark a station only as the person says, in their words: a station marked not right carries what is wrong, for the ' +
	'next version to put right. A station left unchanged in the next version keeps its mark.';

export const portalWorkflowMapActions: McpAction[] = [
	{
		name: 'read_my_workflow_map',
		area: 'support',
		audience: 'everyone',
		isWrite: false,
		summary:
			"for a client contact: your company's workflow map as your portal draws it, with where each station stands " +
			'and whether you have confirmed it',
		guidance: 'Read it before marking a station: a mark names the map, its version and the station by the key shown beside its name.',
		inputSchema: objectSchema({ clientId: clientIdField }),
		run: async (caller, input) => withPortalVisitor(caller, input, readMap)
	},
	{
		name: 'mark_workflow_map_station',
		area: 'support',
		audience: 'everyone',
		isWrite: true,
		summary: 'for a client contact: mark one station of your workflow map right, or not right with what is wrong',
		guidance: markGuidance,
		inputSchema: objectSchema(
			{
				clientId: clientIdField,
				stage: mapStageField,
				versionNumber: textField('The version you are marking, as read_my_workflow_map gives it'),
				stationKey: textField('The station, by the key read_my_workflow_map shows beside its name'),
				reviewState: { type: 'string', enum: [...stationMarkStates], description: 'right, or not_right' },
				whatIsWrong: textField('With not_right: what is wrong, in their words')
			},
			['stage', 'versionNumber', 'stationKey', 'reviewState']
		),
		run: async (caller, input) => withPortalVisitor(caller, input, (visitor) => markStation(caller, visitor, input))
	},
	confirmWorkflowMapAction
];

async function readMap(visitor: PortalVisitor): Promise<string> {
	const standing = describeVisitorStanding(visitor);
	const reading = await readWorkflowMapOfClient(visitor.clientId);
	const sections = reading === null ? [] : filedSections(visitor.organisationName, reading);
	if (sections.length === 0) return `${standing} ${noWorkflowMapFiledYet}`;
	return [standing, ...sections].join('\n\n');
}

function filedSections(organisationName: string, { maps, standings, confirmations }: ClientWorkflowMap): string[] {
	const productNames = new Map(Object.entries(maps.productNames));
	return mapStages.flatMap((stage) => {
		const map = maps[stage];
		if (map === null) return [];
		const surroundings = { productNames, standings: standings[stage], confirmation: confirmations[stage] };
		return [describeWorkflowMap(organisationName, map, surroundings)];
	});
}

async function markStation(caller: McpCaller, visitor: PortalVisitor, input: Record<string, unknown>): Promise<string> {
	const mark = validateStationMark(input);
	if (isRefused(mark)) return mark.refusal;
	const refusal = await markWorkflowMapStation({ clientId: visitor.clientId, accountId: caller.accountId }, mark);
	if (refusal !== null) return refusal.refusal;
	const asMarked = mark.whatIsWrong === null ? 'right' : `not right: ${mark.whatIsWrong}`;
	const mapName = `${mapStageNames[mark.stage]} workflow map`;
	return `Marked ${mark.stationKey} ${asMarked} on version ${mark.versionNumber} of ${visitor.organisationName}'s ${mapName}.`;
}
