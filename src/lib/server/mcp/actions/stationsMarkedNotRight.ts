import { standingOf, stationReviewStates, type StationStandings } from '$lib/data/workflowMap/stationReview';
import type { WorkflowMapVersion } from '$lib/data/workflowMap/workflowMap';

/** What the run asks about first: every station of the latest map the client marked not right, with what they said. */
export function stationsMarkedNotRight(latest: WorkflowMapVersion, standings: StationStandings): string {
	const sentences = latest.lines.flatMap((line) =>
		line.stations.flatMap((station) => {
			const standing = standingOf(standings, station.key);
			if (standing.reviewState !== stationReviewStates.notRight) return [];
			return [`   - **${station.name}** \`${station.key}\` (${line.name}): "${standing.whatIsWrong ?? ''}"`];
		})
	);
	if (sentences.length === 0) return 'The client has marked no station not right.';
	const heading =
		'**Ask first about what the client marked not right,** one station at a time, in their words, and put each right ' +
		'in the version you file:';
	return [heading, ...sentences].join('\n');
}
