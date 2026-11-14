import { mapQuestionsShown, type MapQuestion } from '$lib/data/workflowMap/mapQuestions';
import { stationReviewTallyOf } from '$lib/data/workflowMap/stationReviewTally';
import type { StationStandings } from '$lib/data/workflowMap/stationReview';
import type { WorkflowMapVersion } from '$lib/data/workflowMap/workflowMap';

/** The ranked questions the site found, the first twelve listed to be asked in order, with how many more wait. */
export function mapQuestionsSection(questions: MapQuestion[]): string {
	if (questions.length === 0) return 'The map passes every test of a complete map: ask only what has changed since it was filed.';
	const shown = questions.slice(0, mapQuestionsShown.inTheWalk);
	const heading =
		`**The map fails ${questions.length} tests of a complete map.** Ask these in this order, one at a time, most important first; ` +
		'each answer filed closes its question:';
	const lines = shown.map((question, index) => `   ${index + 1}. ${question.question}`);
	return [heading, ...lines, ...moreQuestions(questions.length - shown.length)].join('\n');
}

function moreQuestions(moreCount: number): string[] {
	if (moreCount === 0) return [];
	return [`   And ${moreCount} more, which the next run lists once these are filed.`];
}

/** Where the client stands on the stations, in one line: what is not yet marked right is still assumed, so it is asked, never filed. */
export function stationsStillAssumed(latest: WorkflowMapVersion, standings: StationStandings): string {
	const { right, notRight, notChecked } = stationReviewTallyOf(latest, standings);
	const stationCount = right + notRight + notChecked;
	return (
		`Of its ${stationCount} stations the client has marked ${right} right and ${notRight} not right; ` +
		`${notRight + notChecked} are not yet marked right, so whatever you assumed about them is still to be asked, never filed as fact.`
	);
}
