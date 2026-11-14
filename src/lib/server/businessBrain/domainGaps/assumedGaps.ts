import { domainQuestionKind, type DomainQuestion } from '$lib/data/domainQuestions';
import { withoutStop } from './questionWording';
import { askedAbout, type DomainHeld } from './domainHeld';

/** Statement 10: nothing is left assumed. Each sentence assumed on a page is put back to the person until the page is filed without it. */
export function assumedGaps({ domain }: DomainHeld): DomainQuestion[] {
	return domain.assumptions.map((assumption) => {
		const { sentence, pageTitle, thingSlug, pageId } = assumption;
		const question = `I assumed ${withoutStop(sentence)}. Is that right?`;
		return askedAbout(domainQuestionKind.assumed, question, { about: pageTitle, thingSlug, pageId }, assumption);
	});
}
