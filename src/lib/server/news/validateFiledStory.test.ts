import { describe, expect, it } from 'vitest';
import { newsStoryLimits } from '$lib/data/news/newsStoryRules';
import { filedStoryRefusals, validateFiledStory } from './validateFiledStory';

const watchedThingId = '00000000-0000-4000-8000-000000000001';
const story = {
	headline: 'HSE publishes new fire door guidance',
	link: 'https://www.gov.uk/government/news/fire-doors',
	note: 'Touches every door we fit.'
};

describe('validateFiledStory', () => {
	it('takes a story with its headline, link and note, the optional fields left empty', () => {
		expect(validateFiledStory(story)).toEqual({
			...story,
			publishedOn: null,
			watchedThingId: null,
			matchReason: ''
		});
	});

	it('takes the published day and the watched thing it matched, with why', () => {
		const matched = {
			...story,
			publishedOn: '2026-11-16',
			watchedThingId,
			matchReason: 'Names fire doors.'
		};
		expect(validateFiledStory(matched)).toEqual(matched);
	});

	it('refuses a headline or note that is empty or longer than its column', () => {
		expect(validateFiledStory({ ...story, headline: ' ' })).toBe(filedStoryRefusals.headline);
		expect(
			validateFiledStory({
				...story,
				headline: 'h'.repeat(newsStoryLimits.longestHeadline + 1)
			})
		).toBe(filedStoryRefusals.headline);
		expect(validateFiledStory({ ...story, note: '' })).toBe(filedStoryRefusals.note);
		expect(
			validateFiledStory({
				...story,
				note: 'n'.repeat(newsStoryLimits.longestNote + 1)
			})
		).toBe(filedStoryRefusals.note);
	});

	it('refuses a link that is not a full web address', () => {
		expect(validateFiledStory({ ...story, link: 'gov.uk/fire-doors' })).toBe(filedStoryRefusals.link);
		expect(validateFiledStory({ ...story, link: 'ftp://example.com/story' })).toBe(filedStoryRefusals.link);
	});

	it('refuses a published day that is not a real day', () => {
		expect(validateFiledStory({ ...story, publishedOn: '16/11/2026' })).toBe(filedStoryRefusals.publishedOn);
		expect(validateFiledStory({ ...story, publishedOn: '2026-02-30' })).toBe(filedStoryRefusals.publishedOn);
	});

	it('refuses a watched thing that is not an id, or given without why it matched', () => {
		expect(
			validateFiledStory({
				...story,
				watchedThingId: 'fire door',
				matchReason: 'Names it.'
			})
		).toContain('watched thing must be an id');
		expect(validateFiledStory({ ...story, watchedThingId })).toBe(filedStoryRefusals.matchReasonWanted);
	});
});
