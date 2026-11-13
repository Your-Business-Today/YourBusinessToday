import { mapStageNames } from '$lib/data/workflowMap/workflowMapWords';
import { stationStates } from '$lib/data/workflowMap/workflowMap';
import { describeMapStation } from './describeMapStation';
import type { MapHandover, MapLine, MapStage, WorkflowMapVersion } from '$lib/data/workflowMap/workflowMap';

const stateTallyWords = { ours: 'in our products', planned: 'planned', elsewhere: 'done elsewhere' } as const;

export function noWorkflowMapYet(organisationName: string, stage: MapStage): string {
	return `No ${mapStageNames[stage]} map has been filed for ${organisationName} yet.`;
}

/** One filed version as Markdown a Claude can work from: every line with its stations in order, then the hand-overs. */
export function describeWorkflowMap(organisationName: string, map: WorkflowMapVersion, productNames: Map<string, string>): string {
	const recordedDay = map.recordedAt.slice(0, 10);
	const header = `## ${mapStageNames[map.stage]}: workflow map of ${organisationName}, version ${map.versionNumber}, filed ${recordedDay}`;
	const lineSections = map.lines.map((line) => describeLine(line, productNames));
	return [header, tallySentence(map), ...lineSections, handoverSection(map)].join('\n\n');
}

function tallySentence({ lines, handovers }: WorkflowMapVersion): string {
	const stations = lines.flatMap((line) => line.stations);
	const states = stationStates.map((state) => {
		const count = stations.filter((station) => station.state === state).length;
		return `${count} ${stateTallyWords[state]}`;
	});
	const sizes = `${lines.length} lines, ${stations.length} stations and ${handovers.length} hand-overs`;
	return `${sizes}. Stations: ${states.join(', ')}.`;
}

function describeLine(line: MapLine, productNames: Map<string, string>): string {
	const stations = line.stations.map((station, index) => describeMapStation(station, index + 1, productNames));
	return [`### ${line.name} \`${line.key}\``, ...stations].join('\n');
}

function handoverSection(map: WorkflowMapVersion): string {
	if (map.handovers.length === 0) return '### Hand-overs\n\nNone filed.';
	const placeOf = stationPlaces(map.lines);
	const handovers = map.handovers.map((handover) => `- ${describeHandover(handover, placeOf)}`);
	return ['### Hand-overs', ...handovers].join('\n');
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
