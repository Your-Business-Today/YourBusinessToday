import { describe, expect, it } from 'vitest';
import { contractStackMap } from './tests/contractStackMap';
import { mapPhrasesOf } from './mapPhrases';

describe('the phrases of a workflow map', () => {
	it('takes every phrase a station takes in or produces and a hand-over passes, once in its first wording', () => {
		expect(mapPhrasesOf(contractStackMap)).toEqual(['rate card', 'Signed contract stack', 'client record']);
	});
});
