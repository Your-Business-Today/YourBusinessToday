import { stationReviewStates, type StationMarkState, type StationStanding } from './stationReview';

/** The marks as the portal offers them. */
export const stationMarkChoices: { state: StationMarkState; label: string }[] = [
	{ state: stationReviewStates.right, label: 'Right' },
	{ state: stationReviewStates.notRight, label: 'Not right' }
];

/** Whether the client has said a station is right, and what is wrong when it is not. */
export function standingSentence(standing: StationStanding): string {
	if (standing.reviewState === stationReviewStates.right) return 'You marked this right.';
	if (standing.reviewState === stationReviewStates.notRight) return `You marked this not right: ${standing.whatIsWrong ?? ''}`.trim();
	return 'Not checked yet.';
}

/** The same standing as a Claude reads it on the map, beside each station. */
export function standingNote(standing: StationStanding): string {
	if (standing.reviewState === stationReviewStates.right) return "Client's mark: right";
	if (standing.reviewState === stationReviewStates.notRight) return `Client's mark: not right: ${standing.whatIsWrong ?? ''}`.trim();
	return "Client's mark: not checked yet";
}
