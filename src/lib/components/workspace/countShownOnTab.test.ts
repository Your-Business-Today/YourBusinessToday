import { describe, expect, it } from 'vitest';
import { countShownOnTab } from './countShownOnTab';

describe('the count a tab shows', () => {
	it('shows how many items a tab holds and nothing on an empty or uncounted tab', () => {
		expect(countShownOnTab(3)).toBe(3);
		expect(countShownOnTab(0)).toBeNull();
		expect(countShownOnTab(null)).toBeNull();
		expect(countShownOnTab(undefined)).toBeNull();
	});
});
