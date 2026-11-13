import { mapConceptsNotSpecimens, mapShapeSentence, mapStageNames } from '$lib/data/workflowMap/workflowMapWords';
import { mapStages } from '$lib/data/workflowMap/workflowMap';
import { isRefused, readChoice } from '$lib/server/companyContext/contextText';
import { fileWorkflowMap } from '$lib/server/workflowMap/fileWorkflowMap';
import { productIdsOf, readOrganisationProducts, refuseStrayProducts } from '$lib/server/workflowMap/mapProducts';
import { readLatestWorkflowMap } from '$lib/server/workflowMap/readLatestWorkflowMap';
import { validateWorkflowMap } from '$lib/server/workflowMap/validateWorkflowMap';
import { objectSchema } from '../actionTypes';
import { contextOrganisation } from './contextOrganisation';
import { describeWorkflowMap, noWorkflowMapYet } from './describeWorkflowMap';
import { organisationIdField } from './organisationDetailsFields';
import { mapStageField, workflowMapFields } from './workflowMapFields';
import type { MapStage } from '$lib/data/workflowMap/workflowMap';
import type { McpAction } from '../actionTypes';
import type { McpCaller } from '../resolveMcpCaller';

export const workflowMapActions: McpAction[] = [
	{
		name: 'file_workflow_map',
		area: 'organisations',
		audience: 'everyone',
		isWrite: true,
		summary: "file a whole new version of an organisation's workflow map, Before or After: its roles as lines, their tasks as stations and the hand-overs between them",
		guidance:
			'Each call files the next numbered version of that stage and never changes one already filed, so give the ' +
			'whole map, not only what changed: read_workflow_map first and carry every line and station forward with its ' +
			'key, the same in Before and After, so each keeps its place on the map. An organisation we already work with ' +
			`files today's map as after only. ${mapShapeSentence} ${mapConceptsNotSpecimens} File it on the person's yes. ` +
			'Every value is checked against its limit and refused, never cut.',
		inputSchema: objectSchema({ organisationId: organisationIdField, ...workflowMapFields }, ['organisationId', 'stage', 'lines']),
		run: async (caller, input) => fileMap(caller, input)
	},
	{
		name: 'read_workflow_map',
		area: 'organisations',
		audience: 'everyone',
		isWrite: false,
		summary: "read an organisation's latest Before and After workflow maps, or one of them, with every line, station and hand-over and their keys",
		guidance: 'An organisation starts with no map: its first filing is version 1 of that stage. Leave stage out for both.',
		inputSchema: objectSchema({ organisationId: organisationIdField, stage: mapStageField }, ['organisationId']),
		run: async (caller, input) => readMap(caller, input)
	}
];

async function fileMap(caller: McpCaller, input: Record<string, unknown>): Promise<string> {
	const organisation = await contextOrganisation(caller, input);
	if (typeof organisation === 'string') return organisation;
	const draft = validateWorkflowMap(input);
	if (isRefused(draft)) return draft.refusal;
	const strayProduct = await refuseStrayProducts(caller.supabase, organisation.id, draft);
	if (strayProduct !== null) return strayProduct.refusal;
	const filing = { organisationId: organisation.id, recordedBy: caller.accountId, draft };
	const versionNumber = await fileWorkflowMap(caller.supabase, filing);
	const stationCount = draft.lines.flatMap((line) => line.stations).length;
	const sizes = `${draft.lines.length} lines, ${stationCount} stations and ${draft.handovers.length} hand-overs`;
	return `Filed version ${versionNumber} of ${organisation.name}'s ${mapStageNames[draft.stage]} map: ${sizes}.`;
}

async function readMap(caller: McpCaller, input: Record<string, unknown>): Promise<string> {
	const organisation = await contextOrganisation(caller, input);
	if (typeof organisation === 'string') return organisation;
	const stages = stagesAskedFor(input.stage);
	if (isRefused(stages)) return stages.refusal;
	const readings = await Promise.all(stages.map((stage) => readLatestWorkflowMap(caller.supabase, organisation.id, stage)));
	const filedLines = readings.flatMap((map) => map?.lines ?? []);
	const productNames = await readOrganisationProducts(caller.supabase, organisation.id, productIdsOf(filedLines));
	const sections = readings.map((map, index) => {
		if (map === null) return noWorkflowMapYet(organisation.name, stages[index]);
		return describeWorkflowMap(organisation.name, map, productNames);
	});
	return sections.join('\n\n');
}

function stagesAskedFor(value: unknown): MapStage[] | { refusal: string } {
	if (value === undefined || value === null || value === '') return [...mapStages];
	const stage = readChoice(value, mapStages, 'stage');
	if (isRefused(stage)) return stage;
	return [stage];
}
