import { describe, expect, it } from 'vitest';
import { countByStatusFilter } from './projectStatusCounts';

const projects = [
	{ name: 'Carp Mania', status: 'building' as const, openTaskCount: 3 },
	{ name: 'Cod Mania', status: 'on_hold' as const, openTaskCount: 1 },
	{ name: 'Portal Template', status: 'maintenance' as const, openTaskCount: 0 }
];

describe('counting projects for each status tab', () => {
	it('counts each tab with the search and the finished choice as they stand', () => {
		const counts = countByStatusFilter(projects, { status: 'building', searchText: 'mania', isShowingFinished: false });
		expect(counts.get('all')).toBe(2);
		expect(counts.get('building')).toBe(1);
		expect(counts.get('on_hold')).toBe(1);
		expect(counts.get('maintenance')).toBe(0);
	});

	it('leaves finished projects out of every count until they are shown', () => {
		const hidden = countByStatusFilter(projects, { status: 'all', searchText: '', isShowingFinished: false });
		const shown = countByStatusFilter(projects, { status: 'all', searchText: '', isShowingFinished: true });
		expect(hidden.get('maintenance')).toBe(0);
		expect(shown.get('maintenance')).toBe(1);
	});
});
