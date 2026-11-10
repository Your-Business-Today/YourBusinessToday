import { describe, expect, it } from 'vitest';
import { monthApprovalPageAnswerFor } from './monthApprovalPageAnswers';

describe('the plan page’s approval of a month', () => {
	it('fails with why nothing was approved, and otherwise says what was', () => {
		const refusal = monthApprovalPageAnswerFor({ kind: 'refused', problem: 'pieces is empty' });
		expect(refusal).toMatchObject({ status: 400, data: { message: 'Nothing was approved: pieces is empty.' } });
		const given = { kind: 'given' as const, monthLabel: 'November 2026', approvedCount: 1, postCount: 1, awaitingPictureCount: 0, left: [] };
		expect(monthApprovalPageAnswerFor(given)).toEqual({ message: 'Approved 1 piece on 1 post for November 2026.' });
	});
});
