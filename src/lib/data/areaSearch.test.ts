import { describe, expect, it } from 'vitest';
import { describeAreaSearchQuery, narrowedSearchQuery, readAreaSearch } from './areaSearch';

describe('the area search a page address carries', () => {
	it('turns the chosen types of business into their SIC codes', () => {
		const search = readAreaSearch(new URLSearchParams('postcode=KT6 5PZ&radiusMiles=5&businessType=electricians&businessType=plumbers'));
		expect(search?.businessTypeKeys).toEqual(['electricians', 'plumbers']);
		expect(search?.sicCodes).toEqual(['43210', '43220']);
	});

	it('keeps the chosen types when the search is written back into an address', () => {
		const search = readAreaSearch(new URLSearchParams('postcode=KT6 5PZ&radiusMiles=5&businessType=electricians'));
		if (search === null) throw new Error('the search should read');
		const again = readAreaSearch(new URLSearchParams(describeAreaSearchQuery(search)));
		expect(again).toEqual(search);
	});

	it('narrows a crowded search to one type, keeping the postcode and radius', () => {
		const search = readAreaSearch(new URLSearchParams('postcode=KT6 5PZ&radiusMiles=5'));
		if (search === null) throw new Error('the search should read');
		const narrowed = readAreaSearch(new URLSearchParams(narrowedSearchQuery(search, 'accountants')));
		expect(narrowed).toEqual({ postcode: 'KT6 5PZ', radiusMiles: 5, businessTypeKeys: ['accountants'], sicCodes: ['69201', '69202', '69203'] });
	});
});
