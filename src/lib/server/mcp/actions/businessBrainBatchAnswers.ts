import { brainOf } from './businessBrainAnswers';
import type { BusinessBrainPageSettled } from './businessBrainFilingRuns';
import type { Organisation } from '$lib/server/organisations/organisationRecord';

/** What became of one page of a list, by the title it was given. */
export type BusinessBrainPageInList = BusinessBrainPageSettled & { title: string };

export function sharedSourceRefused(refusal: string): string {
	return `The source named beside pages does not fit, so nothing was filed. ${refusal}`;
}

function sharedSourceLine(sharedSourceId: string | null): string[] {
	if (sharedSourceId === null) return [];
	return [`The source named beside pages is kept as source id ${sharedSourceId}: give it as sourceId when you file more pages from it.`];
}

function pageSection(page: BusinessBrainPageInList, index: number): string[] {
	const outcome = page.isFiled ? 'filed' : 'not filed';
	return ['', `### ${index + 1}. "${page.title}": ${outcome}`, page.answer];
}

/** Every page of the list in the order given, each with what became of it, under a count of those filed. */
export function pagesSettled(organisation: Organisation, pages: BusinessBrainPageInList[], sharedSourceId: string | null): string {
	const filedCount = pages.filter((page) => page.isFiled).length;
	const heading = `Filed ${filedCount} of ${pages.length} pages into ${brainOf(organisation)}. Each page says below what became of it; a page not filed can be filed again on its own.`;
	return [heading, ...sharedSourceLine(sharedSourceId), ...pages.flatMap(pageSection)].join('\n');
}
