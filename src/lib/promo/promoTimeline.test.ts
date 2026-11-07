import { describe, expect, it } from 'vitest';
import { beatsInto, chapterAt, chapterBeat, promoChapters, promoDurationSeconds, secondsPerBeat } from './promoTimeline';

const filmSeconds = 46;
const halfSecond = 0.5;

describe('the promo timeline', () => {
	it('runs its chapters back to back for forty-six seconds', () => {
		promoChapters.slice(1).forEach((chapter, index) => {
			const previous = promoChapters[index];
			expect(chapter.startSeconds).toBe(previous.endSeconds);
		});
		expect(promoDurationSeconds).toBe(filmSeconds);
	});

	it('beats at 120 to the minute, half a second a beat', () => {
		expect(secondsPerBeat).toBe(halfSecond);
	});

	it('turns a chapter beat into seconds into the film and back again', () => {
		const seconds = chapterBeat('board', 7);
		expect(seconds).toBe(19.5);
		expect(beatsInto('board', seconds)).toBe(7);
	});

	it('finds the chapter a moment falls in, holding the last one at the end', () => {
		const opening = chapterAt(0);
		const middle = chapterAt(20);
		const ending = chapterAt(promoDurationSeconds);
		expect([opening.id, middle.id, ending.id]).toEqual(['signal', 'board', 'brand']);
	});
});
