import { describe, expect, it } from 'vitest';
import { listPlaceCategories, mostCategoriesListed } from './listPlaceCategories';
import { placeCategoriesFailingWith, placeCategoriesOf, type FunctionCall } from './placeCategories.fixture';

const surbitonId = '02d731bf-8d5e-40c9-82ac-3d84d387e945';
const functionNotYetThere = { code: 'PGRST202' };
const databaseDown = { code: '57P03' };

const surbiton = placeCategoriesOf([
	{ category: 'accountant', place_count: 90, with_phone_count: 84 },
	{ category: '', place_count: 870, with_phone_count: 700 },
	{ category: 'real_estate_agent', place_count: 149, with_phone_count: 141 },
	{ category: 'employment_agency', place_count: 66, with_phone_count: 60 },
	{ category: 'travel_agent', place_count: 66, with_phone_count: 61 }
]);

describe('the categories of trading place a territory holds', () => {
	it('asks the database to count them for that territory, and to say how many fit', async () => {
		const calls: FunctionCall[] = [];
		await listPlaceCategories(placeCategoriesOf([], calls), surbitonId, '');
		expect(calls).toEqual([{ functionName: 'patch_place_categories', patchId: surbitonId, count: 'exact' }]);
	});

	it('gives the commonest first, and two as common as each other by name', async () => {
		const { categories, matchedCount } = await listPlaceCategories(surbiton, surbitonId, '');
		expect(categories.map((category) => category.name)).toEqual(['', 'real_estate_agent', 'accountant', 'employment_agency', 'travel_agent']);
		expect(categories[1]).toEqual({ name: 'real_estate_agent', placeCount: 149, withPhoneCount: 141 });
		expect(matchedCount).toBe(5);
	});

	it('keeps the categories containing the word, whatever its case', async () => {
		const { categories, matchedCount } = await listPlaceCategories(surbiton, surbitonId, 'Agen');
		expect(categories.map((category) => category.name)).toEqual(['real_estate_agent', 'employment_agency', 'travel_agent']);
		expect(matchedCount).toBe(3);
	});

	it('reads an underscore in the word as an underscore, never as any one character', async () => {
		const lookAlike = placeCategoriesOf([{ category: 'estate agent', place_count: 1, with_phone_count: 0 }]);
		expect((await listPlaceCategories(surbiton, surbitonId, 'estate_agent')).matchedCount).toBe(1);
		expect((await listPlaceCategories(lookAlike, surbitonId, 'estate_agent')).matchedCount).toBe(0);
	});

	it('lists a hundred at most and says how many fit in all', async () => {
		const many = Array.from({ length: 817 }, (_, index) => ({ category: `category_${index}`, place_count: index + 1, with_phone_count: index }));
		const { categories, matchedCount } = await listPlaceCategories(placeCategoriesOf(many), surbitonId, '');
		expect(categories).toHaveLength(mostCategoriesListed);
		expect(categories[0]).toEqual({ name: 'category_816', placeCount: 817, withPhoneCount: 816 });
		expect(matchedCount).toBe(817);
	});

	it('answers none until the migration that adds the function has run', async () => {
		expect(await listPlaceCategories(placeCategoriesFailingWith(functionNotYetThere), surbitonId, '')).toEqual({ categories: [], matchedCount: 0 });
	});

	it('fails on any other failure, so a database that is down is not read as an empty territory', async () => {
		await expect(listPlaceCategories(placeCategoriesFailingWith(databaseDown), surbitonId, '')).rejects.toEqual(databaseDown);
	});
});
