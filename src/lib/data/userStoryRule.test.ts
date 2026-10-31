import { describe, expect, it } from 'vitest';
import { needsUserStory, titleWithoutExemptPrefix } from './userStoryRule';

const topLevelWork = { kind: 'work' as const, parentTaskId: null };

describe('which tasks must be user stories', () => {
	it('asks it of a top level work task', () => {
		expect(needsUserStory({ ...topLevelWork, title: 'Weekly cashflow grid' })).toBe(true);
	});

	it('spares a bug fix and a refactor round, however they are cased', () => {
		expect(needsUserStory({ ...topLevelWork, title: 'FIX: total rounds up' })).toBe(false);
		expect(needsUserStory({ ...topLevelWork, title: ' fix: total rounds up' })).toBe(false);
		expect(needsUserStory({ ...topLevelWork, title: 'REFACTOR: round 3' })).toBe(false);
	});

	it('spares a support question and a subtask', () => {
		expect(needsUserStory({ ...topLevelWork, kind: 'support', title: 'Why?' })).toBe(false);
		expect(needsUserStory({ ...topLevelWork, parentTaskId: 'parent', title: 'Step' })).toBe(false);
	});
});

describe('titleWithoutExemptPrefix', () => {
	it('takes the bug fix or refactor prefix off, however it is cased', () => {
		expect(titleWithoutExemptPrefix('FIX: total rounds up')).toBe('total rounds up');
		expect(titleWithoutExemptPrefix(' fix:total rounds up ')).toBe('total rounds up');
		expect(titleWithoutExemptPrefix('REFACTOR: round 3')).toBe('round 3');
	});

	it('leaves a story title as it is', () => {
		expect(titleWithoutExemptPrefix('Weekly cashflow grid')).toBe('Weekly cashflow grid');
	});
});

describe('a business department’s task', () => {
	it('needs no user story', () => {
		const insurance = { kind: 'work', title: 'Put insurance in place', parentTaskId: null } as const;
		expect(needsUserStory({ ...insurance, department: 'administration' })).toBe(false);
		expect(needsUserStory({ ...insurance, department: 'development' })).toBe(true);
	});
});
