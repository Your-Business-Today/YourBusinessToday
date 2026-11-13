import { standingOf, stationReviewStates, type StationStandings } from './stationReview';
import type { WorkflowMapVersion } from './workflowMap';

/** How many of a map's stations the client has marked right, not right, and still has to check. */
export type StationReviewTally = { right: number; notRight: number; notChecked: number };

export function stationReviewTallyOf(map: WorkflowMapVersion, standings: StationStandings): StationReviewTally {
	const states = map.lines.flatMap((line) => line.stations.map((station) => standingOf(standings, station.key).reviewState));
	const countOf = (state: string) => states.filter((candidate) => candidate === state).length;
	return {
		right: countOf(stationReviewStates.right),
		notRight: countOf(stationReviewStates.notRight),
		notChecked: countOf(stationReviewStates.notChecked)
	};
}

/** The tally as one sentence under the map. */
export function tallySentence({ right, notRight, notChecked }: StationReviewTally): string {
	const marked = `You have marked ${right} right and ${notRight} not right`;
	if (notChecked === 0) return `${marked}: every station on this map is checked.`;
	return `${marked}; ${notChecked} still to check. Choose a station to check it.`;
}
