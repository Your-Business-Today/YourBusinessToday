import { describe, expect, it } from 'vitest';
import { eachBatchInTurn, inBatches } from './inBatches';

describe('working through items a batch at a time', () => {
	it('cuts the items into batches of the size asked, the last one short', () => {
		expect(inBatches([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
	});

	it('finishes one batch before starting the next and keeps every answer in order', async () => {
		const started: number[][] = [];
		const answers = await eachBatchInTurn([1, 2, 3, 4, 5], 2, async (batch) => {
			started.push(batch);
			return batch.map((item) => item * 10);
		});
		expect(started).toEqual([[1, 2], [3, 4], [5]]);
		expect(answers).toEqual([10, 20, 30, 40, 50]);
	});

	it('does no work for no items', async () => {
		let calls = 0;
		const answers = await eachBatchInTurn([], 2, async () => {
			calls += 1;
			return [];
		});
		expect(answers).toEqual([]);
		expect(calls).toBe(0);
	});
});
