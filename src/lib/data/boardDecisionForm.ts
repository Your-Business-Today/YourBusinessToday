/** The names of the fields a director answers a decision with on the meeting page. */
export const decisionAnswerFields = { itemNumber: 'itemNumber', answer: 'answer', reason: 'reason' } as const;

/** The meeting page's answer form, as the input the one check reads: the item's number as a number. */
export function decisionAnswerInputOf(formData: FormData): Record<string, unknown> {
	const itemNumber = Number(formData.get(decisionAnswerFields.itemNumber));
	const answer = String(formData.get(decisionAnswerFields.answer) ?? '');
	const reason = String(formData.get(decisionAnswerFields.reason) ?? '');
	return { itemNumber, answer, reason };
}
