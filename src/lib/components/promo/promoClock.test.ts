import { describe, expect, it } from 'vitest';
import { clockFace, PromoClock } from './promoClock.svelte';

const filmSeconds = 10;
const frameMilliseconds = 50;
const framesToTheEnd = 200;

function playFrames(clock: PromoClock, frames: number): void {
	Array.from({ length: frames + 1 }, (_, frame) => frame * frameMilliseconds).forEach((time) => clock.advance(time));
}

describe('the film clock', () => {
	it('shows a time as minutes and two-digit seconds', () => {
		expect(clockFace(7)).toBe('0:07');
		expect(clockFace(46)).toBe('0:46');
		expect(clockFace(75.9)).toBe('1:15');
	});

	it('moves on with the frames while playing and stops at the end', () => {
		const clock = new PromoClock(filmSeconds);
		clock.play();
		playFrames(clock, framesToTheEnd * 2);
		expect(clock.seconds).toBe(filmSeconds);
		expect(clock.isPlaying).toBe(false);
		expect(clock.hasEnded).toBe(true);
	});

	it('stands still while paused', () => {
		const clock = new PromoClock(filmSeconds);
		playFrames(clock, framesToTheEnd);
		expect(clock.seconds).toBe(0);
	});

	it('takes a long gap between frames as one short frame, so the film never leaps', () => {
		const clock = new PromoClock(filmSeconds);
		clock.play();
		clock.advance(0);
		clock.advance(5000);
		expect(clock.seconds).toBeCloseTo(0.1);
	});

	it('seeks only within the film, and plays from the top once it has ended', () => {
		const clock = new PromoClock(filmSeconds);
		clock.seek(-5);
		expect(clock.seconds).toBe(0);
		clock.seek(filmSeconds * 2);
		expect(clock.hasEnded).toBe(true);
		clock.play();
		expect(clock.seconds).toBe(0);
	});
});
