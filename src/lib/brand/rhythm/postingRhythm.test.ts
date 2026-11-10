import { describe, expect, it } from 'vitest';
import { adoptedDecision } from '../testing/decisionFixture';
import { builtInTraits } from '../traits/traitCatalogue';
import { checkCustomTrait } from '../decisions/checkCustomTrait';
import { checkDecision } from '../decisions/checkDecision';
import { postingRhythmsOf, rhythmFor } from './postingRhythm';

const check = (traitKey: string, value: unknown) => checkDecision({ traitKey, mediumPath: 'all', value }, builtInTraits);

const jewelsRhythm = [
	adoptedDecision('behaviour.postingDays', 'all', ['Monday', 'Wednesday', 'Thursday']),
	adoptedDecision('behaviour.postingTime', 'all', '19:30'),
	adoptedDecision('behaviour.postsAWeek', 'all', 3),
	adoptedDecision('behaviour.postsAWeek', 'text.post.linkedin', 1)
];

describe('a brand’s posting rhythm in its kit', () => {
	it('keeps the posting days in week order, named in full, and refuses any other day by name', () => {
		expect(check('behaviour.postingDays', ['thursday', 'Monday'])).toMatchObject({ decision: { value: ['Monday', 'Thursday'] } });
		expect(check('behaviour.postingDays', ['Mon'])).toEqual({ problem: expect.stringContaining('“Mon” is not a day of the week') });
		expect(check('behaviour.postingDays', ['Monday', 'monday'])).toEqual({ problem: 'Posting days: Monday is given twice' });
		expect(check('behaviour.postingDays', [])).toHaveProperty('problem');
	});

	it('keeps the time as HH:MM and the posts a week as a whole number, refusing anything else', () => {
		expect(check('behaviour.postingTime', '19:30')).toMatchObject({ decision: { value: '19:30' } });
		expect(check('behaviour.postingTime', '7.30pm')).toEqual({ problem: expect.stringContaining('HH:MM') });
		expect(check('behaviour.postsAWeek', 3)).toMatchObject({ decision: { value: 3 } });
		expect(check('behaviour.postsAWeek', '2.5')).toEqual({ problem: expect.stringContaining('whole number') });
		expect(check('behaviour.postsAWeek', -1)).toHaveProperty('problem');
		expect(check('behaviour.postsAWeek', 1000)).toHaveProperty('problem');
	});

	it('is not a kind a brand’s own trait can take', () => {
		const draft = { facet: 'behaviour', name: 'quietDays', label: 'Quiet days', purpose: '', choices: [] };
		expect(checkCustomTrait({ ...draft, kind: 'weekdays' })).toEqual({ problem: 'weekdays is not a kind a custom trait can take' });
	});

	it('makes one rhythm of each medium the posts a week is decided on, the days and time following the cascade', () => {
		const rhythms = postingRhythmsOf(jewelsRhythm, builtInTraits);
		expect(rhythms).toEqual([
			{ mediumPath: 'all', medium: 'Everywhere', days: ['Monday', 'Wednesday', 'Thursday'], time: '19:30', postsAWeek: 3 },
			{ mediumPath: 'text.post.linkedin', medium: 'LinkedIn post', days: ['Monday', 'Wednesday', 'Thursday'], time: '19:30', postsAWeek: 1 }
		]);
		expect(rhythmFor(rhythms, 'text.post.linkedin')?.postsAWeek).toBe(1);
		expect(rhythmFor(rhythms, 'image.post.instagram')?.mediumPath).toBe('all');
	});

	it('has no rhythm until the posts a week is decided somewhere', () => {
		const [days, time] = jewelsRhythm;
		expect(postingRhythmsOf([days, time], builtInTraits)).toEqual([]);
		expect(rhythmFor([], 'image.post.instagram')).toBeNull();
	});
});
