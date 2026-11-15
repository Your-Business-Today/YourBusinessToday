import { describe, expect, it } from 'vitest';
import { storyboardOfStored } from './storedStoryboard';

describe('a storyboard as its piece keeps it', () => {
	it('reads a shot kept before shots carried a clip as one with none, its words at the bottom', () => {
		const stored = [{ description: 'A roof', seconds: 3, onScreenText: 'Rain' }];
		expect(storyboardOfStored(stored)).toEqual([{ ...stored[0], overline: '', underline: '', wordsAt: 'bottom', clipItemId: null }]);
		expect(storyboardOfStored(null)).toEqual([]);
	});
});
