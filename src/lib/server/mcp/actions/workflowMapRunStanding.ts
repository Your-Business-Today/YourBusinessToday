import { mapStage, type MapStage, type WorkflowMapVersion } from '$lib/data/workflowMap/workflowMap';
import { mapStageNames } from '$lib/data/workflowMap/workflowMapWords';
import { stationsMarkedNotRight } from './stationsMarkedNotRight';
import { workflowMapGaps } from '$lib/server/workflowMap/workflowMapGaps';
import { mapQuestionsSection, stationsStillAssumed } from './mapQuestionsSection';
import { workflowMapRunDomainSection } from './mapDomainJoinSteps';
import type { MapVocabulary } from '$lib/data/workflowMap/phraseInDomain';
import type { StationStandings } from '$lib/data/workflowMap/stationReview';
import type { Organisation } from '$lib/server/organisations/organisationRecord';

/** What Your Business Today holds that bears on an organisation's workflow map, as the run reads it first. */
export type WorkflowMapRunStanding = {
	organisation: Organisation;
	before: WorkflowMapVersion | null;
	after: WorkflowMapVersion | null;
	products: { id: string; name: string }[];
	standings: StationStandings;
	vocabulary: MapVocabulary;
};

/** The map this run builds on: today's After when there is one, else the Before, else none. */
export function latestMapOf({ before, after }: WorkflowMapRunStanding): WorkflowMapVersion | null {
	return after ?? before;
}

/** The stage this run files: the stage already filed, or for a first map, After where we already build for them. */
export function stageToFile(standing: WorkflowMapRunStanding): MapStage {
	const latest = latestMapOf(standing);
	if (latest !== null) return latest.stage;
	const { products } = standing;
	const isAlreadyOurClient = products.length > 0;
	return isAlreadyOurClient ? mapStage.after : mapStage.before;
}

/** Step 1 of the run: what is filed, what it still leaves open, and which stage to file. */
export function workflowMapRunStanding(standing: WorkflowMapRunStanding): string {
	const latest = latestMapOf(standing);
	const held = latest === null ? nothingFiled(standing) : mapFiled(standing, latest);
	return [held, ...workflowMapRunDomainSection(latest, standing.vocabulary), stageSentence(standing)].join('\n\n');
}

function nothingFiled({ organisation }: WorkflowMapRunStanding): string {
	return `1. **Say what Your Business Today holds.** No workflow map is filed for ${organisation.name} yet, so this is a first map: a broad conversation through every stage below.`;
}

function mapFiled({ organisation, standings, vocabulary }: WorkflowMapRunStanding, latest: WorkflowMapVersion): string {
	const { lines, handovers } = latest;
	const stations = lines.flatMap((line) => line.stations);
	const sizes = `${lines.length} lines, ${stations.length} stations and ${handovers.length} hand-overs`;
	const opening =
		`1. **Read what is filed.** Version ${latest.versionNumber} of ${organisation.name}'s ${mapStageNames[latest.stage]} map, ` +
		`filed ${latest.recordedAt.slice(0, 10)}: ${sizes}. Read it whole with read_workflow_map before anything else, and build on it.`;
	const questions = mapQuestionsSection(workflowMapGaps(latest, vocabulary));
	return [opening, stationsStillAssumed(latest, standings), stationsMarkedNotRight(latest, standings), questions].join('\n\n');
}

function stageSentence(standing: WorkflowMapRunStanding): string {
	const { organisation, products } = standing;
	const stage = stageToFile(standing);
	const isFirst = latestMapOf(standing) === null;
	if (stage === mapStage.before && isFirst)
		return `${organisation.name} has no product of ours yet, so this first map is the Before: the business as we find it, every station elsewhere. The After is filed as each product ships.`;
	if (stage === mapStage.before)
		return `File it as the next before version. Once one of our products is in use for some of its tasks, file today's map as after instead, with the same keys.`;
	const productList = products.map((product) => `${product.name} (${product.id})`).join(', ') || 'none yet';
	const firstAfter = isFirst ? ' Today\'s map only: there is no Before to compare it with, and none is filed now.' : '';
	return `File it as after, today's map.${firstAfter} A station done in one of our products is ours, with its productId; one a product is being built for is planned; any other is elsewhere. The products: ${productList}.`;
}
