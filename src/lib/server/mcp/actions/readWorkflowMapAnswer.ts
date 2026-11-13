import { confirmationOf } from '$lib/data/workflowMap/mapConfirmationsOf';
import { mapStages, type MapStage } from '$lib/data/workflowMap/workflowMap';
import { isRefused, readChoice } from '$lib/server/filing/filedText';
import { productIdsOf, readProductsOfOrganisation } from '$lib/server/workflowMap/mapProducts';
import { readConfirmedMapVersions } from '$lib/server/workflowMap/readConfirmedMapVersions';
import { readLatestWorkflowMap } from '$lib/server/workflowMap/readLatestWorkflowMap';
import { readMapVocabulary } from '$lib/server/businessBrain/readMapVocabulary';
import { readStationStandings } from '$lib/server/workflowMap/readStationStandings';
import { contextOrganisation } from './contextOrganisation';
import { describeWorkflowMap, noWorkflowMapYet } from './describeWorkflowMap';
import { phrasesNotWordsSection } from './mapDomainJoinSections';
import type { McpCaller } from '../resolveMcpCaller';

/** read_workflow_map: each stage asked for, its latest version described whole and closed with what the glossary does not hold. */
export async function readWorkflowMapAnswer(caller: McpCaller, input: Record<string, unknown>): Promise<string> {
	const organisation = await contextOrganisation(caller, input);
	if (typeof organisation === 'string') return organisation;
	const stages = stagesAskedFor(input.stage);
	if (isRefused(stages)) return stages.refusal;
	const readings = await Promise.all(stages.map((stage) => readLatestWorkflowMap(caller.supabase, organisation.id, stage)));
	const [confirmed, vocabulary] = await Promise.all([
		readConfirmedMapVersions(caller.supabase, organisation.id),
		readMapVocabulary(caller.supabase, organisation.id)
	]);
	const filedLines = readings.flatMap((map) => map?.lines ?? []);
	const productNames = await readProductsOfOrganisation(caller.supabase, organisation.id, productIdsOf(filedLines));
	const sections = readings.map(async (map, index) => {
		if (map === null) return noWorkflowMapYet(organisation.name, stages[index]);
		const standings = await readStationStandings(caller.supabase, organisation.id, map);
		const described = describeWorkflowMap(organisation.name, map, { productNames, standings, confirmation: confirmationOf(confirmed, map) });
		return [described, phrasesNotWordsSection(map, vocabulary)].join('\n\n');
	});
	return (await Promise.all(sections)).join('\n\n');
}

function stagesAskedFor(value: unknown): MapStage[] | { refusal: string } {
	if (value === undefined || value === null || value === '') return [...mapStages];
	const stage = readChoice(value, mapStages, 'stage');
	if (isRefused(stage)) return stage;
	return [stage];
}
