import { mapConceptsNotSpecimens, mapShapeSentence } from '$lib/data/workflowMap/workflowMapWords';
import { frozenBeforeRefusal } from '$lib/server/workflowMap/frozenBeforeRefusal';
import { isRefused } from '$lib/server/filing/filedText';
import { fileWorkflowMap } from '$lib/server/workflowMap/fileWorkflowMap';
import { refuseStrayProducts } from '$lib/server/workflowMap/mapProducts';
import { validateWorkflowMap } from '$lib/server/workflowMap/validateWorkflowMap';
import { workflowMapGaps } from '$lib/server/workflowMap/workflowMapGaps';
import { readMapVocabulary } from '$lib/server/businessBrain/readMapVocabulary';
import { objectSchema } from '../actionTypes';
import { contextOrganisation } from './contextOrganisation';
import { filedWorkflowMapAnswer } from './filedWorkflowMapAnswer';
import { readWorkflowMapAnswer } from './readWorkflowMapAnswer';
import { organisationIdField } from './organisationDetailsFields';
import { mapStageField, workflowMapFields } from './workflowMapFields';
import type { McpAction } from '../actionTypes';
import type { McpCaller } from '../resolveMcpCaller';

export const workflowMapActions: McpAction[] = [
	{
		name: 'file_workflow_map',
		area: 'organisations',
		audience: 'everyone',
		isWrite: true,
		summary:
			"file a whole new version of an organisation's workflow map, Before or After: its roles, outside parties and " +
			'systems as lines, their tasks as stations, the hand-overs between them and what arrives from outside',
		guidance:
			'Each call files the next numbered version of that stage and never changes one already filed, so give the ' +
			'whole map, not only what changed: read_workflow_map first and carry every line and station forward with its ' +
			'key, the same in Before and After, so each keeps its place on the map. An organisation we already work with ' +
			`files today's map as after only. Once the client confirms a Before it is frozen and no further Before is filed; ` +
			`the After is filed again as each product ships. ${mapShapeSentence} ${mapConceptsNotSpecimens} File it on the person's yes. ` +
			'Every value is checked against its limit and refused, never cut.',
		inputSchema: objectSchema({ organisationId: organisationIdField, ...workflowMapFields }, ['organisationId', 'stage', 'lines']),
		run: async (caller, input) => fileMap(caller, input)
	},
	{
		name: 'read_workflow_map',
		area: 'organisations',
		audience: 'everyone',
		isWrite: false,
		summary:
			"read an organisation's latest Before and After workflow maps, or one of them, with every line and its kind, station, hand-over and arrival " +
			"and their keys, and where each station stands with the client: right, not right with what is wrong, or not checked",
		guidance:
			'An organisation starts with no map: its first filing is version 1 of that stage. Leave stage out for both. ' +
			'A station the client marked not right is put right in the next version filed; a station left unchanged keeps its mark. ' +
			'Each map ends with the phrases and lines that are not words of the glossary: the map and the domain join through the words.',
		inputSchema: objectSchema({ organisationId: organisationIdField, stage: mapStageField }, ['organisationId']),
		run: async (caller, input) => readWorkflowMapAnswer(caller, input)
	}
];

async function fileMap(caller: McpCaller, input: Record<string, unknown>): Promise<string> {
	const organisation = await contextOrganisation(caller, input);
	if (typeof organisation === 'string') return organisation;
	const draft = validateWorkflowMap(input);
	if (isRefused(draft)) return draft.refusal;
	const frozen = await frozenBeforeRefusal(caller.supabase, organisation, draft);
	if (frozen !== null) return frozen;
	const strayProduct = await refuseStrayProducts(caller.supabase, organisation.id, draft);
	if (strayProduct !== null) return strayProduct.refusal;
	const filing = { organisationId: organisation.id, recordedBy: caller.accountId, draft };
	const versionNumber = await fileWorkflowMap(caller.supabase, filing);
	const vocabulary = await readMapVocabulary(caller.supabase, organisation.id);
	return filedWorkflowMapAnswer(organisation.name, versionNumber, draft, workflowMapGaps(draft, vocabulary));
}
