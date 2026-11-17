import { describe, expect, it } from 'vitest';
import { describeFiledStory, describeNewStories, describeNewsStory } from './describeNewsStory';
import type { NewsStory } from '$lib/data/news/newsStoryRules';

const story: NewsStory = {
	id: 'story-1',
	source: 'filed_by_claude',
	headline: 'HSE publishes new fire door guidance',
	link: 'https://www.gov.uk/government/news/fire-doors',
	publishedOn: '2026-11-16',
	watchedThingId: 'watched-1',
	matchReason: 'Names fire doors.',
	note: 'Touches every door we fit.',
	filedAt: '2026-11-17T09:00:00Z'
};

describe('describeNewsStory', () => {
	it('gives the headline, link, source, day, id, match and note', () => {
		expect(describeNewsStory(story)).toBe(
			[
				'- HSE publishes new fire door guidance',
				'  https://www.gov.uk/government/news/fire-doors',
				'  Filed by Claude, published 2026-11-16, id story-1',
				'  Matched: Names fire doors.',
				'  Why it matters: Touches every door we fit.'
			].join('\n')
		);
	});

	it('leaves out what the story does not have', () => {
		const bare = { ...story, publishedOn: null, matchReason: '', note: '' };
		expect(describeNewsStory(bare)).toBe(
			['- HSE publishes new fire door guidance', '  https://www.gov.uk/government/news/fire-doors', '  Filed by Claude, id story-1'].join('\n')
		);
	});
});

describe('describeNewStories', () => {
	it('says when nothing is new, and when more stories wait for the next reading', () => {
		expect(describeNewStories('Jewel', { stories: [], isMoreWaiting: false })).toBe("Jewel's Business News: Nothing new since you last looked.");
		const answer = describeNewStories('Jewel', {
			stories: [story],
			isMoreWaiting: true
		});
		expect(answer).toContain('now marked seen by you');
		expect(answer).toContain('call catch_up_on_news again');
	});
});

describe('describeFiledStory', () => {
	it('says a story was filed, or was already there under its link, or passes on why nothing was filed', () => {
		expect(describeFiledStory('Jewel', story)).toContain("Filed in Jewel's Business News:");
		expect(describeFiledStory('Jewel', { alreadyFiled: story })).toContain('so it was not filed again');
		expect(describeFiledStory('Jewel', 'The headline is 1 to 300 characters.')).toBe('The headline is 1 to 300 characters.');
	});
});
