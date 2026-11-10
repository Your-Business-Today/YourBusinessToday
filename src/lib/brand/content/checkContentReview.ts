import { ContentLimits } from './contentLimits';
import { ReviewVerdicts, isReviewVerdict, reviewVerdicts, type ContentReviewCheck } from './contentReview';

const { reviewCharacters } = ContentLimits;

/** The review as given, its verdict and words checked against their columns, or the first reason it cannot be kept. */
export function checkContentReview(input: Record<string, unknown>): ContentReviewCheck {
	const verdict = typeof input.verdict === 'string' ? input.verdict.trim() : '';
	if (!isReviewVerdict(verdict)) return { problem: `verdict is one of ${reviewVerdicts.join(', ')}` };
	const given = input.body ?? '';
	if (typeof given !== 'string') return { problem: `body is words, not ${typeof given}` };
	const body = given.trim();
	if (body.length > reviewCharacters)
		return {
			problem: `body is ${body.length} characters; keep it to ${reviewCharacters}`
		};
	const isApproval = verdict === ReviewVerdicts.approved;
	if (!isApproval && body === '')
		return {
			problem: `body is empty: say what you think, or what should change`
		};
	return { review: { verdict, body } };
}
