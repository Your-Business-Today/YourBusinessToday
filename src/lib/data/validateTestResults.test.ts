import { describe, expect, it } from 'vitest';
import { resultsRefusal, validateTestResults } from './validateTestResults';
import { testResultLimits } from './testResult';

const confirmed = { taskId: 't1', outcome: 'confirmed', proof: 'Opened My work and saw the list.' };
const failed = { taskId: 't2', outcome: 'failed', proof: 'The button did nothing.', fault: 'export button does nothing' };

describe('validateTestResults', () => {
	it('reads confirmed and failed results', () => {
		expect(validateTestResults([confirmed, failed])).toEqual([
			{ ...confirmed, fault: null },
			{ ...failed }
		]);
	});

	it('refuses anything but a list of results', () => {
		expect(validateTestResults([])).toBe(resultsRefusal);
		expect(validateTestResults('t1')).toBe(resultsRefusal);
	});

	it('names the result and the field that does not fit', () => {
		expect(validateTestResults([confirmed, { ...confirmed, outcome: 'maybe' }])).toContain('Result 2');
		expect(validateTestResults([{ ...confirmed, taskId: '' }])).toContain('taskId');
		expect(validateTestResults([{ ...confirmed, proof: '' }])).toContain('proof');
	});

	it('refuses a failure with no fault or one too long for a task title', () => {
		expect(validateTestResults([{ ...failed, fault: '' }])).toContain('fault');
		const longFault = 'x'.repeat(testResultLimits.longestFault + 1);
		expect(validateTestResults([{ ...failed, fault: longFault }])).toContain('fault');
	});
});
