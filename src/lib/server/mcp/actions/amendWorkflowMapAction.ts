import { amendWorkflowMap } from '$lib/data/workflowMap/amendWorkflowMap';
import { mapStageNames } from '$lib/data/workflowMap/workflowMapWords';
import { isRefused } from '$lib/server/filing/filedText';
import { readLatestWorkflowMap } from '$lib/server/workflowMap/readLatestWorkflowMap';
import { validateMapAmendment } from '$lib/server/workflowMap/validateMapAmendment';
import { validateWorkflowMap } from '$lib/server/workflowMap/validateWorkflowMap';
import { objectSchema } from '../actionTypes';
import { amendWorkflowMapActionName } from './amendWorkflowMapActionName';
import { amendWorkflowMapFields } from './amendWorkflowMapFields';
import { contextOrganisation } from './contextOrganisation';
import { fileCheckedWorkflowMap } from './fileCheckedWorkflowMap';
import { filedWorkflowMapAnswer } from './filedWorkflowMapAnswer';
import { mapChangesSaid } from './mapChangesSaid';
import { organisationIdField } from './organisationDetailsFields';
import type { MapStage } from '$lib/data/workflowMap/workflowMap';
import type { McpAction } from '../actionTypes';
import type { McpCaller } from '../resolveMcpCaller';

export const amendWorkflowMapAction: McpAction = {
	name: amendWorkflowMapActionName,
	area: 'organisations',
	audience: 'everyone',
	isWrite: true,
	summary:
		"change one part of an organisation's latest Before or After workflow map, a station, a line, a hand-over or an arrival, " +
		'and file the result as the next version without giving the whole map again',
	guidance:
		'Use it for a small change while a lead or a client is talking; file_workflow_map files a whole map. Read_workflow_map ' +
		'gives the keys. Name only what changes: a station is put whole, with its lineKey when it is new or moves; whatever is ' +
		'not named is carried forward exactly, so an untouched station keeps its mark with the client. Keys stay the same in ' +
		'Before and After, and amending one stage never touches the other. A station removed takes its hand-overs and arrivals ' +
		"with it; a line is removed only once it holds no stations. File it on the person's yes. Every value is checked against " +
		'its limit and refused, never cut.',
	inputSchema: objectSchema({ organisationId: organisationIdField, ...amendWorkflowMapFields }, ['organisationId', 'stage']),
	run: async (caller, input) => amendMap(caller, input)
};

const noMapToAmend = (organisationName: string, stage: MapStage) =>
	`${organisationName} has no ${mapStageNames[stage]} map filed yet, so there is nothing to amend: file one first with file_workflow_map.`;

async function amendMap(caller: McpCaller, input: Record<string, unknown>): Promise<string> {
	const organisation = await contextOrganisation(caller, input);
	if (typeof organisation === 'string') return organisation;
	const amendment = validateMapAmendment(input);
	if (isRefused(amendment)) return amendment.refusal;
	const latest = await readLatestWorkflowMap(caller.supabase, organisation.id, amendment.stage);
	if (latest === null) return noMapToAmend(organisation.name, amendment.stage);
	const amended = amendWorkflowMap(latest, amendment);
	if (isRefused(amended)) return amended.refusal;
	const draft = validateWorkflowMap(amended.draft);
	if (isRefused(draft)) return draft.refusal;
	const filed = await fileCheckedWorkflowMap(caller, organisation, draft);
	if (typeof filed === 'string') return filed;
	return filedWorkflowMapAnswer(organisation.name, filed.versionNumber, draft, filed.questions, mapChangesSaid(amended.changes));
}
