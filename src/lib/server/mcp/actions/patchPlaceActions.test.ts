import { beforeEach, describe, expect, it, vi } from 'vitest';
import { placeCategoriesOf } from '$lib/server/premises/placeCategories.fixture';
import type { McpCaller } from '../resolveMcpCaller';

const surbiton = { id: '02d731bf-8d5e-40c9-82ac-3d84d387e945', name: 'Surbiton', outcodes: ['KT6'] };
const { found, loaded } = vi.hoisted(() => ({ found: { territory: null as unknown }, loaded: vi.fn() }));

vi.mock('$lib/server/patches/getPatch', () => ({ getPatch: async () => found.territory }));
vi.mock('$lib/server/places/loadOverturePlaces', () => ({ loadOverturePlacesForPatch: vi.fn() }));
vi.mock('$lib/server/watch/runWatchSource', () => ({ runWatchSource: loaded }));

const { patchPlaceActions } = await import('./patchPlaceActions');
const caller = { accountId: 'staff-1', supabase: {} } as unknown as McpCaller;

async function loadPlaces(): Promise<string> {
	const [action] = patchPlaceActions;
	return String(await action.run(caller, { patchId: surbiton.id }));
}

describe("loading a territory's trading places through the connector", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		found.territory = surbiton;
	});

	it("runs that territory's own load, so the call carries on where the last one stopped", async () => {
		loaded.mockResolvedValue({ source: 'patch_places', rowsWritten: 4_500, resumeMarker: '>2026-10-21.0:4500', note: 'Release 2026-10-21.0: 4500 of 9961 trading places written so far.', isFinished: false });
		expect(await loadPlaces()).toBe('Surbiton: Release 2026-10-21.0: 4500 of 9961 trading places written so far. Call again to carry on.');
		expect(loaded).toHaveBeenCalledWith(caller.supabase, expect.objectContaining({ name: 'patch_places:02d731bf-8d5e-40c9-82ac-3d84d387e945' }));
	});

	it('says how to list the places once the territory holds the release', async () => {
		loaded.mockResolvedValue({ source: 'patch_places', rowsWritten: 0, resumeMarker: '2026-10-21.0', note: 'Already holds release 2026-10-21.0.', isFinished: true });
		expect(await loadPlaces()).toBe('Surbiton: Already holds release 2026-10-21.0. Next: list_patch_premises with source places_dataset lists them.');
	});

	it('loads nothing for a territory that is not there', async () => {
		found.territory = null;
		expect(await loadPlaces()).toContain('list_patches');
		expect(loaded).not.toHaveBeenCalled();
	});

	it('is a write a staff member may make, under the territories', () => {
		expect(patchPlaceActions[0]).toMatchObject({ name: 'load_patch_places', area: 'patches', audience: 'staff', isWrite: true });
	});
});

const surbitonPlaces = placeCategoriesOf([
	{ category: 'accountant', place_count: 90, with_phone_count: 84 },
	{ category: 'real_estate_agent', place_count: 149, with_phone_count: 141 }
]);

async function listCategories(input: Record<string, unknown>): Promise<string> {
	const action = patchPlaceActions.find((candidate) => candidate.name === 'list_patch_place_categories');
	if (action === undefined) throw new Error('No action named list_patch_place_categories');
	return String(await action.run({ accountId: 'staff-1', supabase: surbitonPlaces } as unknown as McpCaller, { patchId: surbiton.id, ...input }));
}

describe("listing a territory's categories of trading place through the connector", () => {
	beforeEach(() => {
		found.territory = surbiton;
	});

	it('lists them the commonest first, each with how many list a phone number', async () => {
		expect(await listCategories({})).toBe(
			'real_estate_agent — 149 trading place(s) — 141 with a phone number\naccountant — 90 trading place(s) — 84 with a phone number'
		);
	});

	it('finds a kind of business named in plain words', async () => {
		expect(await listCategories({ category: 'Estate Agent' })).toBe('real_estate_agent — 149 trading place(s) — 141 with a phone number');
	});

	it('says a category is in the singular when the word asked for fits none', async () => {
		expect(await listCategories({ category: 'estate agents' })).toContain('No category of trading place in this territory contains that word');
	});

	it('lists nothing for a territory that is not there', async () => {
		found.territory = null;
		expect(await listCategories({})).toContain('list_patches');
	});

	it('is a read a staff member may make, under the territories', () => {
		expect(patchPlaceActions[1]).toMatchObject({ name: 'list_patch_place_categories', area: 'patches', audience: 'staff', isWrite: false });
	});
});
