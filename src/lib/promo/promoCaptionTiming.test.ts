import { describe, expect, it } from 'vitest';
import { captionsAt, type ShownLine } from './promoCaptionTiming';
import { chapterBeat, promoDurationSeconds } from './promoTimeline';

const framesPerSecond = 30;
const lastFrame = promoDurationSeconds - 1 / framesPerSecond;
const fullyShown = 1;

function isFullyShown(line: ShownLine): boolean {
	return line.presence === fullyShown;
}

describe('the words on screen', () => {
	it('shows nothing before the first line comes in', () => {
		expect(captionsAt(0)).toEqual([]);
	});

	it('shows a chapter line in full in the middle of its time', () => {
		const [caption] = captionsAt(chapterBeat('map', 6));
		const [line] = caption.headlines;
		expect(caption.chapterId).toBe('map');
		expect(line.text).toBe('We map how information travels through your company.');
		expect(line.words.every((word) => word.presence === fullyShown)).toBe(true);
	});

	it('brings the words of a line in one after another', () => {
		const [caption] = captionsAt(chapterBeat('map', 1));
		const [line] = caption.headlines;
		const { words } = line;
		const firstWord = words[0];
		const lastWord = words[words.length - 1];
		expect(firstWord.presence).toBeGreaterThan(lastWord.presence);
	});

	it('quotes the real count of tasks done on the board', () => {
		const [caption] = captionsAt(chapterBeat('board', 15));
		const [aside] = caption.asides;
		expect(aside.text).toBe('376 tasks built and merged on our own board so far.');
	});

	it('keeps the closing words on screen in the last frame', () => {
		const [caption] = captionsAt(lastFrame);
		expect(caption.chapterId).toBe('brand');
		expect(caption.headlines.every(isFullyShown)).toBe(true);
		expect(caption.asides.every(isFullyShown)).toBe(true);
	});
});
