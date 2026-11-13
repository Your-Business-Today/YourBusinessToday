import { domainThingHref } from './domainTabs';
import type { BusinessBrainAddresses } from '$lib/data/businessBrainAddresses';
import type { DomainQuestion } from '$lib/data/domainQuestions';

/** What the Questions tab says of the domain's open questions. */
export const domainQuestionWords = {
	label: 'What the domain still leaves open, most important first',
	question: 'Question',
	about: 'About',
	area: 'Area',
	kind: 'Kind',
	onTheMap: 'The workflow map',
	noQuestions: 'The domain passes every test of a complete model: nothing is left to ask.'
} as const;

/** Where a question's subject opens: a thing on the Things tab, another page in the brain, or nowhere for a phrase the domain does not hold. */
export function domainQuestionHref({ thingSlug, pageId }: DomainQuestion, addresses: BusinessBrainAddresses): string | undefined {
	if (thingSlug !== null) return domainThingHref(thingSlug);
	if (pageId !== null) return addresses.page(pageId);
	return undefined;
}
