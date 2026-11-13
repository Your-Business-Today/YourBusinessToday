import { siteMapRequest } from '$lib/data/personRequests';
import { shortCommit } from '$lib/data/journeyMap/journeyMapReading';
import { formatBritishDate } from '$lib/data/britishDate';
import { countOf } from '$lib/data/countOf';
import type { JourneyMap } from '$lib/data/journeyMap/journeyMap';
import type { UnreachedStep } from './journeyViewRows';

/** What the Site map tab says around the journeys. */
export const journeySiteMapMessages = {
	noJourneys: `No journeys have been filed for this product yet. Say "${siteMapRequest}" to your Claude to start.`,
	chooseView: 'Choose a view on the map or in the table to see what it is for, its wireframe and what a Claude can do there.',
	noViews: 'This version files no views.',
	onNoJourney: 'On no journey',
	nothingLinksHere: 'Nothing links here',
	noWireframe: "The repository's site definition draws no wireframe for this view."
} as const;

/** What the legend under the map says each mark means. */
export const journeyLegendWords = {
	roles: 'Journeys of',
	line: 'A line is one journey a person makes, from where they arrive',
	view: 'A view',
	shared: 'A view several journeys pass through'
} as const;

/** Where the header says the journeys were drawn from. */
export function journeysDrawnFrom(journeyMap: JourneyMap): string {
	const filedOn = formatBritishDate(journeyMap.filedAt);
	return `Journeys version ${journeyMap.versionNumber}, from ${shortCommit(journeyMap)}, filed ${filedOn}`;
}

/** A step of a journey nothing leads to, as the table marks it. */
export function unreachedStepWords(step: UnreachedStep): string {
	if (step.fromName === null) return `${step.journeyName} starts here, but nobody arrives here`;
	return `${step.journeyName}: nothing links here from ${step.fromName}`;
}

/** The line above the table: how many of each fault it marks. */
export function faultSummary(counts: { viewsOnNoJourney: number; unreachedSteps: number }): string {
	const { viewsOnNoJourney, unreachedSteps } = counts;
	const faults = [
		viewsOnNoJourney > 0 ? `${countOf(viewsOnNoJourney, 'view')} on no journey` : null,
		unreachedSteps > 0 ? `${countOf(unreachedSteps, 'journey step')} nothing leads to` : null
	].filter((fault) => fault !== null);
	if (faults.length === 0) return 'Every view is on a journey, and every step of every journey can be reached.';
	return `Marked below: ${faults.join('; ')}.`;
}

/** Where a journey passes through a view: which step it is, of how many. */
export function stepWords(stepNumber: number, stepCount: number): string {
	return `step ${stepNumber} of ${stepCount}`;
}
