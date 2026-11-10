import { describe, expect, it } from 'vitest';
import { readBesidePlacement, readMoveDirection, readShouldJoinTargetGoal } from './orderingFields';

describe('readMoveDirection', () => {
	it('accepts up and down and nothing else', () => {
		expect(readMoveDirection({ direction: 'up' })).toBe('up');
		expect(readMoveDirection({ direction: ' down ' })).toBe('down');
		expect(readMoveDirection({ direction: 'sideways' })).toBeNull();
		expect(readMoveDirection({})).toBeNull();
	});
});

describe('readBesidePlacement', () => {
	it('accepts before and after, and refuses inside — nesting is set_task_parent', () => {
		expect(readBesidePlacement({ placement: 'before' })).toBe('before');
		expect(readBesidePlacement({ placement: 'after' })).toBe('after');
		expect(readBesidePlacement({ placement: 'inside' })).toBeNull();
		expect(readBesidePlacement({})).toBeNull();
	});
});

describe('readShouldJoinTargetGoal', () => {
	it('keeps the goal when left out, and takes only true or false', () => {
		expect(readShouldJoinTargetGoal({})).toBe(false);
		expect(readShouldJoinTargetGoal({ shouldJoinTargetGoal: true })).toBe(true);
		expect(readShouldJoinTargetGoal({ shouldJoinTargetGoal: false })).toBe(false);
		expect(readShouldJoinTargetGoal({ shouldJoinTargetGoal: 'yes' })).toBeNull();
	});
});
