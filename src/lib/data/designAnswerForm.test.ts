import { describe, expect, it } from 'vitest';
import { designAnswerRefusals, readDesignAnswerFromForm } from './designAnswerForm';
import { designReviewLimits, designReviewStates } from './designReview';

function answerForm(answer: string, reason = ''): FormData {
	const formData = new FormData();
	formData.set('answer', answer);
	formData.set('reason', reason);
	return formData;
}

describe('answering a request from the Requested tab', () => {
	it('approves without a reason', () => {
		expect(readDesignAnswerFromForm(answerForm('approve'))).toEqual({ state: designReviewStates.approved, reason: '' });
	});

	it('rejects only with a reason', () => {
		expect(readDesignAnswerFromForm(answerForm('reject', '  '))).toEqual({ refusal: designAnswerRefusals.reasonRequired });
		expect(readDesignAnswerFromForm(answerForm('reject', 'Costs too much'))).toEqual({
			state: designReviewStates.rejected,
			reason: 'Costs too much'
		});
	});

	it('refuses an unknown answer and a reason longer than a task holds', () => {
		expect(readDesignAnswerFromForm(answerForm('awaiting'))).toEqual({ refusal: designAnswerRefusals.unknownAnswer });
		const longReason = 'x'.repeat(designReviewLimits.longestText + 1);
		expect(readDesignAnswerFromForm(answerForm('approve', longReason))).toEqual({ refusal: designAnswerRefusals.reasonTooLong });
	});
});
