import { describe, expect, it } from 'vitest';
import { easeInOutCubic, easeOutBack, easeOutCubic, presenceIn, progressBetween, smoothStep } from './promoMotion';

const fadeSeconds = 1;
const onScreen = { start: 2, end: 8 };
const halfShown = 0.5;

describe('promo motion', () => {
	it('holds progress at nothing before a stretch and at all of it after', () => {
		expect(progressBetween(0, 2, 4)).toBe(0);
		expect(progressBetween(3, 2, 4)).toBe(halfShown);
		expect(progressBetween(9, 2, 4)).toBe(1);
	});

	it('eases every move from rest to rest', () => {
		[smoothStep, easeOutCubic, easeInOutCubic, easeOutBack].forEach((ease) => {
			expect(ease(0)).toBeCloseTo(0);
			expect(ease(1)).toBeCloseTo(1);
		});
	});

	it('overshoots a little on the way in when a thing pops', () => {
		const nearlyThere = 0.8;
		expect(easeOutBack(nearlyThere)).toBeGreaterThan(1);
	});

	it('brings a thing in over its first fade and takes it away over its last', () => {
		expect(presenceIn(1, onScreen, fadeSeconds)).toBe(0);
		expect(presenceIn(2.5, onScreen, fadeSeconds)).toBe(halfShown);
		expect(presenceIn(5, onScreen, fadeSeconds)).toBe(1);
		expect(presenceIn(7.5, onScreen, fadeSeconds)).toBe(halfShown);
		expect(presenceIn(8, onScreen, fadeSeconds)).toBe(0);
	});
});
