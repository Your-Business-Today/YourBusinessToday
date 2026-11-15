import { describe, expect, it } from 'vitest';
import { cutAt, filmCutsOf, filmLengthOf } from './filmCuts';
import { filmShapeOf } from './filmFrame';
import { headlineSizeFor, FilmType } from './fitHeadline';
import { filmLookStyleOf } from './storyboardFilm';

describe('a storyboard played as a film', () => {
	it('cuts straight from shot to shot, each for its own seconds, skipping a shot of none', () => {
		const cuts = filmCutsOf([3, 0, 2.5]);
		expect(cuts).toEqual([
			{ shotIndex: 0, startSeconds: 0, endSeconds: 3 },
			{ shotIndex: 2, startSeconds: 3, endSeconds: 5.5 }
		]);
		expect(filmLengthOf(cuts)).toBe(5.5);
		expect(cutAt(cuts, 2.99)?.shotIndex).toBe(0);
		expect(cutAt(cuts, 3)?.shotIndex).toBe(2);
		expect(cutAt(cuts, 5.5)?.shotIndex).toBe(2);
		expect(cutAt([], 1)).toBeNull();
	});

	it('takes the first clip’s shape: wide, square or tall', () => {
		expect(filmShapeOf(1920, 1080)).toBe('wide');
		expect(filmShapeOf(1080, 1080)).toBe('square');
		expect(filmShapeOf(1080, 1920)).toBe('tall');
		expect(filmShapeOf(0, 0)).toBe('wide');
	});

	it('makes a long headline smaller to fit its band, never past the smallest size', () => {
		const band = { x: 0, y: 0, width: 900, height: 300 };
		expect(headlineSizeFor('Shut it', band, 0)).toBe(FilmType.largestHeadline);
		const long = 'A fire door only works when it is shut behind you, every single time, in every block';
		const fitted = headlineSizeFor(long, band, 2);
		expect(fitted).toBeLessThan(FilmType.largestHeadline);
		expect(headlineSizeFor(long.repeat(20), band, 2)).toBe(FilmType.smallestHeadline);
	});

	it('carries only the brand’s own variables onto the stage', () => {
		const look = { '--brand-colour-accent': '#ff4d5e', '--brand-type-display-family': 'Inter', color: 'red', '--brand-x': 'a; b' };
		expect(filmLookStyleOf(look)).toBe('--brand-colour-accent: #ff4d5e; --brand-type-display-family: Inter');
	});
});
