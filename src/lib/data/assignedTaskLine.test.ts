import { describe, expect, it } from 'vitest';
import { assignedToYouLine } from './assignedTaskLine';

describe('assignedToYouLine', () => {
	it('says nothing when nothing is assigned', () => {
		expect(assignedToYouLine(0)).toBe('');
	});

	it('counts what is assigned', () => {
		expect(assignedToYouLine(1)).toBe('1 assigned to you');
		expect(assignedToYouLine(4)).toBe('4 assigned to you');
	});
});
