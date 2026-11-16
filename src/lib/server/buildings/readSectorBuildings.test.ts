import { describe, expect, it, vi } from 'vitest';
import { premisesRowOf, premisesTableOf } from '$lib/server/premises/premisesTable.fixture';

const parade = { id: 'parade', latitude: 51.3925, longitude: -0.3045 };
const warehouse = { id: 'warehouse', latitude: 51.4, longitude: -0.29 };
const { buildingsRead } = vi.hoisted(() => ({ buildingsRead: vi.fn() }));

vi.mock('./listBuildingsForSector', () => ({ listBuildingsForSector: buildingsRead }));

const { readSectorBuildings } = await import('./readSectorBuildings');

const held = [
	premisesRowOf({ id: 'lamb', business_name: 'The Lamb', latitude: parade.latitude, longitude: parade.longitude }),
	premisesRowOf({ id: 'bakery', business_name: 'Bread Ahead', latitude: parade.latitude + 0.0001, longitude: parade.longitude }),
	premisesRowOf({ id: 'far', business_name: 'Far Away', latitude: 51.38, longitude: -0.32 })
];

describe("the largest buildings of a sector with what is known in each", () => {
	it('names the premises in or beside each building, and nothing for a building with none', async () => {
		buildingsRead.mockResolvedValue([parade, warehouse]);
		const readings = await readSectorBuildings(premisesTableOf(held), 'patch-1', ['KT6'], 'KT6 5');
		expect(readings).toEqual([
			{ building: parade, knownNearby: ['Bread Ahead', 'The Lamb'] },
			{ building: warehouse, knownNearby: [] }
		]);
	});

	it('answers with no buildings until the buildings migration has run', async () => {
		buildingsRead.mockRejectedValue({ code: '42P01' });
		expect(await readSectorBuildings(premisesTableOf(held), 'patch-1', ['KT6'], 'KT6 5')).toEqual([]);
	});
});
