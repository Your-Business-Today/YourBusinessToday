import { describe, expect, it } from 'vitest';
import { asPlaceCategory } from './placeCategory';

describe('a kind of business asked for in plain words, as Overture Maps writes a category', () => {
	it('joins the words with an underscore, so estate agent is found inside real_estate_agent', () => {
		expect(asPlaceCategory('estate agent')).toBe('estate_agent');
		expect('real_estate_agent').toContain(asPlaceCategory('Estate Agent'));
	});

	it('reads a hyphen and a run of spaces as one break', () => {
		expect(asPlaceCategory('IT  service - and computer repair')).toBe('it_service_and_computer_repair');
	});

	it('leaves a category already written that way as it is', () => {
		expect(asPlaceCategory('hair_salon')).toBe('hair_salon');
	});

	it('keeps nothing asked for as nothing', () => {
		expect(asPlaceCategory('   ')).toBe('');
	});
});
