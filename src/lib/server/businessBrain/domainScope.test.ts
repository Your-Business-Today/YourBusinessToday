import { describe, expect, it } from 'vitest';
import { everyPage, productColumnOf, readInScope, type ScopeFilter } from './domainScope';

const columnMissing = { code: '42703', message: 'column business_brain_pages.project_id does not exist' };

function readingThatKnowsTheColumn(isColumnThere: boolean) {
	const filtersAsked: ScopeFilter[] = [];
	const read = async (filter: ScopeFilter) => {
		filtersAsked.push(filter);
		const isNamingTheColumn = filter[0] === 'project_id';
		if (isNamingTheColumn && !isColumnThere) return { data: null, error: columnMissing as never };
		return { data: ['a page'], error: null };
	};
	return { filtersAsked, read };
}

describe('a reading of one scope’s domain pages', () => {
	it('narrows to the organisation’s own pages, or to one product’s', async () => {
		const reading = readingThatKnowsTheColumn(true);
		expect(await readInScope({ projectId: null }, reading.read)).toEqual(['a page']);
		expect(await readInScope({ projectId: 'product-1' }, reading.read)).toEqual(['a page']);
		expect(reading.filtersAsked).toEqual([
			['project_id', 'is', null],
			['project_id', 'eq', 'product-1']
		]);
	});

	it('before migration 0203 reads every page as the organisation’s, and a product as holding none', async () => {
		const reading = readingThatKnowsTheColumn(false);
		expect(await readInScope({ projectId: null }, reading.read)).toEqual(['a page']);
		expect(reading.filtersAsked).toEqual([['project_id', 'is', null], everyPage]);
		expect(await readInScope({ projectId: 'product-1' }, reading.read)).toBeNull();
	});

	it('throws any other failure', async () => {
		const failing = async () => ({ data: null, error: { code: '42501', message: 'permission denied' } as never });
		await expect(readInScope({ projectId: null }, failing)).rejects.toMatchObject({ code: '42501' });
	});

	it('names the product only on a product’s page, so the organisation files before the column exists', () => {
		expect(productColumnOf({ projectId: null })).toEqual({});
		expect(productColumnOf({ projectId: 'product-1' })).toEqual({ project_id: 'product-1' });
	});
});
