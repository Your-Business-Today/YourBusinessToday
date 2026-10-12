import { describe, expect, it } from 'vitest';
import { searchUrlFor } from './searchUrl';

describe('searchUrlFor', () => {
	it('asks for active companies by code and place by default', () => {
		const url = searchUrlFor({ sicCodes: ['41202', '43320'], location: 'KT1' }, 50);
		expect(url.pathname).toBe('/advanced-search/companies');
		expect(url.searchParams.getAll('sic_codes')).toEqual(['41202', '43320']);
		expect(url.searchParams.get('location')).toBe('KT1');
		expect(url.searchParams.getAll('company_status')).toEqual(['active']);
		expect(url.searchParams.get('size')).toBe('50');
		expect(url.searchParams.has('incorporated_from')).toBe(false);
	});

	it('carries the dates, the statuses and the page a watcher names', () => {
		const url = searchUrlFor(
			{ sicCodes: [], location: 'M4', incorporatedFrom: '2026-10-11', incorporatedTo: '2026-10-11', dissolvedFrom: '2026-10-11', companyStatuses: ['liquidation', 'administration'], startIndex: 100 },
			100
		);
		expect(url.searchParams.get('incorporated_from')).toBe('2026-10-11');
		expect(url.searchParams.get('incorporated_to')).toBe('2026-10-11');
		expect(url.searchParams.get('dissolved_from')).toBe('2026-10-11');
		expect(url.searchParams.getAll('company_status')).toEqual(['liquidation', 'administration']);
		expect(url.searchParams.get('start_index')).toBe('100');
		expect(url.searchParams.has('sic_codes')).toBe(false);
	});
});
