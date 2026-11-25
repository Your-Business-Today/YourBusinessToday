import { describe, expect, it } from 'vitest';
import {
	designReviewLine,
	designReviewStates,
	isAwaitingDesignApproval,
	isHeldForDesignReview,
	parseDesignReview
} from './designReview';

const awaitingRow = { design_review_state: designReviewStates.awaiting, design_change: 'Keeps prices in a sheet' };

describe('a task’s design review', () => {
	it('is absent from a task that only extends the design', () => {
		expect(parseDesignReview({ design_review_state: null })).toBeNull();
		expect(isHeldForDesignReview({ designReview: null })).toBe(false);
		expect(designReviewLine(null)).toBeNull();
	});

	it('holds a task waiting for YBT or turned down, and frees one YBT approved', () => {
		const awaiting = { designReview: parseDesignReview(awaitingRow) };
		const rejected = { designReview: parseDesignReview({ ...awaitingRow, design_review_state: designReviewStates.rejected }) };
		const approved = { designReview: parseDesignReview({ ...awaitingRow, design_review_state: designReviewStates.approved }) };
		expect(isHeldForDesignReview(awaiting)).toBe(true);
		expect(isAwaitingDesignApproval(awaiting)).toBe(true);
		expect(isHeldForDesignReview(rejected)).toBe(true);
		expect(isAwaitingDesignApproval(rejected)).toBe(false);
		expect(isHeldForDesignReview(approved)).toBe(false);
	});

	it('tells read_task where it stands and what it changes', () => {
		const line = designReviewLine(parseDesignReview(awaitingRow));
		expect(line).toContain('Requested, awaiting YBT approval');
		expect(line).toContain('Keeps prices in a sheet');
	});
});
