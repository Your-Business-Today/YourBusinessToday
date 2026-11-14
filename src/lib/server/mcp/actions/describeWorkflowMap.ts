import { mapConfirmedSentence, type MapConfirmation } from '$lib/data/workflowMap/mapConfirmed';
import { lineKindPhrases, mapStageNames } from '$lib/data/workflowMap/workflowMapWords';
import { arrivalSection } from './describeMapArrivals';
import { stationStates } from '$lib/data/workflowMap/workflowMap';
import { describeMapStation } from './describeMapStation';
import { stationReviewTallyOf } from '$lib/data/workflowMap/stationReviewTally';
import type { MapHandover, MapLine, MapStage, WorkflowMapVersion } from '$lib/data/workflowMap/workflowMap';
import type { StationStandings } from '$lib/data/workflowMap/stationReview';

const stateTallyWords = { ours: 'in our products', planned: 'planned', elsewhere: 'done elsewhere' } as const;

export function noWorkflowMapYet(organisationName: string, stage: MapStage): string {
	return `No ${mapStageNames[stage]} map has been filed for ${organisationName} yet.`;
}

/** What the description names beside the map: the products' names, where each station stands, and the confirmation. */
export type MapSurroundings = {
	productNames: Map<string, string>;
	standings: StationStandings;
	confirmation: MapConfirmation | null;
};

const notConfirmedYet = 'The client has not confirmed this version yet.';

/** One filed version as Markdown a Claude can work from: every line and its kind with its stations in order, then the hand-overs and arrivals. */
export function describeWorkflowMap(organisationName: string, map: WorkflowMapVersion, surroundings: MapSurroundings): string {
	const recordedDay = map.recordedAt.slice(0, 10);
	const header = `## ${mapStageNames[map.stage]}: workflow map of ${organisationName}, version ${map.versionNumber}, filed ${recordedDay}`;
	const lineSections = map.lines.map((line) => describeLine(line, surroundings));
	const marks = marksSentence(map, surroundings.standings);
	const confirmed = confirmedSentence(surroundings.confirmation);
	const placeOf = stationPlaces(map.lines);
	const passing = [handoverSection(map, placeOf), arrivalSection(map, placeOf)];
	return [header, `${tallySentence(map)} ${marks} ${confirmed}`, ...lineSections, ...passing].join('\n\n');
}

function confirmedSentence(confirmation: MapConfirmation | null): string {
	if (confirmation === null) return notConfirmedYet;
	return mapConfirmedSentence(confirmation, false);
}

function marksSentence(map: WorkflowMapVersion, standings: StationStandings): string {
	const { right, notRight, notChecked } = stationReviewTallyOf(map, standings);
	return `The client's marks: ${right} right, ${notRight} not right, ${notChecked} not checked yet.`;
}

function tallySentence({ lines, handovers, arrivals }: WorkflowMapVersion): string {
	const stations = lines.flatMap((line) => line.stations);
	const states = stationStates.map((state) => {
		const count = stations.filter((station) => station.state === state).length;
		return `${count} ${stateTallyWords[state]}`;
	});
	const sizes = `${lines.length} lines, ${stations.length} stations, ${handovers.length} hand-overs and ${arrivals.length} arrivals`;
	return `${sizes}. Stations: ${states.join(', ')}.`;
}

function describeLine(line: MapLine, surroundings: MapSurroundings): string {
	const stations = line.stations.map((station, index) => describeMapStation(station, index + 1, surroundings));
	return [`### ${line.name} \`${line.key}\`, ${lineKindPhrases[line.kind]}`, ...stations].join('\n');
}

function handoverSection({ handovers }: WorkflowMapVersion, placeOf: Map<string, string>): string {
	if (handovers.length === 0) return '### Hand-overs\n\nNone filed.';
	const sentences = handovers.map((handover) => `- ${describeHandover(handover, placeOf)}`);
	return ['### Hand-overs', ...sentences].join('\n');
}

function describeHandover(handover: MapHandover, placeOf: Map<string, string>): string {
	const giver = placeOf.get(handover.fromKey) ?? handover.fromKey;
	const receiver = placeOf.get(handover.toKey) ?? handover.toKey;
	const passes = `${giver} hands **${handover.handedOver}** to ${receiver}.`;
	if (handover.goesWrong === null) return passes;
	return `${passes} Goes wrong today: ${handover.goesWrong}`;
}

function stationPlaces(lines: MapLine[]): Map<string, string> {
	const places = lines.flatMap((line) =>
		line.stations.map((station) => [station.key, `${station.name} \`${station.key}\` (${line.name})`] as const)
	);
	return new Map(places);
}
