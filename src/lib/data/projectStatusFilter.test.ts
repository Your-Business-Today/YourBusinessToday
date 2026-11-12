import { describe, expect, it } from 'vitest';
import {
	matchesProjectStatusFilter,
	projectStatusFilterLabel,
	projectStatusFilterOrder
} from './projectStatusFilter';

describe('the project status filter', () => {
	it('keeps every project under all', () => {
		expect(matchesProjectStatusFilter('complete', 'all')).toBe(true);
		expect(matchesProjectStatusFilter('on_hold', 'all')).toBe(true);
	});

	it('keeps only its own status under a status tab', () => {
		expect(matchesProjectStatusFilter('on_hold', 'on_hold')).toBe(true);
		expect(matchesProjectStatusFilter('building', 'on_hold')).toBe(false);
		expect(matchesProjectStatusFilter('on_hold', 'building')).toBe(false);
	});

	it('offers scoping first, building second and all of them last', () => {
		expect(projectStatusFilterOrder).toEqual([
			'scoping',
			'building',
			'testing',
			'maintenance',
			'complete',
			'on_hold',
			'all'
		]);
	});

	it('labels each tab in plain words', () => {
		expect(projectStatusFilterLabel('all')).toBe('All');
		expect(projectStatusFilterLabel('on_hold')).toBe('On hold');
	});
});
