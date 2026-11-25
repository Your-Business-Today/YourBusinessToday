import { describe, expect, it } from 'vitest';
import { termsOfService } from '$lib/data/termsOfService';
import { termsChangedHeadings, termsChangedSections } from './termsChangedSections';

describe('the sections the acceptance page shows as changed', () => {
	it('finds every changed heading in the full terms', () => {
		const shownHeadings = termsChangedSections.map((section) => section.heading);
		expect(shownHeadings).toHaveLength(termsChangedHeadings.length);
	});

	it('names each section of the full terms once', () => {
		const headings = termsOfService.sections.map((section) => section.heading);
		expect(new Set(headings).size).toBe(headings.length);
	});
});
