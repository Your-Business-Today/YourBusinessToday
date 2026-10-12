export const longestFilingSentence = 300;
export const longestStatusDetail = 60;

/** Why a filing cannot be stored as read, or null when it fits its columns. */
export function validateFilingSentence(sentence: string): string | null {
	if (sentence === '') return 'A filing needs its sentence.';
	if (sentence.length > longestFilingSentence) return `A filing's sentence is at most ${longestFilingSentence} characters.`;
	return null;
}

/** How far back the first sweep of a company tells the feed; older filings are stored but not announced. */
export const firstSweepEventDays = 30;

/** Companies checked in one run: two calls each, well inside the window with the pacing. */
export const companiesCheckedPerRun = 200;
