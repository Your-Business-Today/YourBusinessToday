import { describe, expect, it } from 'vitest';
import { storyPointsForComplexity } from './taskComplexity';
import { validateTaskComplexity } from './validateTaskComplexity';

const copiedForm = { viewsChanged: 1, newViews: 0, changesDataStructure: false, domainObjects: 0 };

describe('storyPointsForComplexity', () => {
	it('sizes one changed view as a point', () => {
		expect(storyPointsForComplexity(copiedForm)).toBe(1);
	});

	it('weighs a data structure change and its domain objects', () => {
		expect(storyPointsForComplexity({ ...copiedForm, changesDataStructure: true, domainObjects: 2 })).toBe(5);
	});

	it('gives 21, to be split, to work past thirteen', () => {
		expect(storyPointsForComplexity({ ...copiedForm, newViews: 9 })).toBe(21);
	});
});

describe('validateTaskComplexity', () => {
	it('refuses a count that is not whole', () => {
		expect(validateTaskComplexity({ ...copiedForm, newViews: 1.5 })).toContain('new views');
	});

	it('refuses a count above its column', () => {
		expect(validateTaskComplexity({ ...copiedForm, domainObjects: 100 })).toContain('0 to 99');
	});
});
