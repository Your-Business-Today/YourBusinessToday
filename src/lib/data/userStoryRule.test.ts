import { describe, expect, it } from 'vitest';
import { needsUserStory } from './userStoryRule';

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
