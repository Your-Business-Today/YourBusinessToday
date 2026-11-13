import { describe, expect, it } from 'vitest';
import { countedWork } from './countedWork';
import { departments } from '$lib/data/department';

const feature = { id: 'feature', department: departments.development };
const server = { id: 'server', department: departments.infrastructure };
const insurance = { id: 'insurance', department: departments.administration };
const listing = { id: 'listing', department: departments.marketing };

describe('countedWork', () => {
	it('counts a product’s Development side alone', () => {
		expect(countedWork(false, [feature, server, insurance, listing])).toEqual([feature, server]);
	});

	it('counts every job of an internal project, which has nothing else', () => {
		expect(countedWork(true, [insurance, listing])).toEqual([insurance, listing]);
	});
});
