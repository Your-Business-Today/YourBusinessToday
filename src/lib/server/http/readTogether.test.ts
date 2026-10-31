import { describe, expect, it } from 'vitest';
import { readTogether } from './readTogether';

const slowReadMilliseconds = 30;

function answerAfter<Answer>(answer: Answer, milliseconds: number): Promise<Answer> {
	return new Promise((resolve) => setTimeout(() => resolve(answer), milliseconds));
}

describe('readTogether', () => {
	it('keeps each answer under the name it was asked for', async () => {
		const reads = await readTogether({ projects: answerAfter(['YBT'], 1), kitVersion: answerAfter('1.4.0', 1) });
		expect(reads).toEqual({ projects: ['YBT'], kitVersion: '1.4.0' });
	});

	it('runs the reads at the same time rather than one after another', async () => {
		const startedAt = Date.now();
		await readTogether({
			first: answerAfter(1, slowReadMilliseconds),
			second: answerAfter(2, slowReadMilliseconds),
			third: answerAfter(3, slowReadMilliseconds)
		});
		expect(Date.now() - startedAt).toBeLessThan(slowReadMilliseconds * 3);
	});
});
