import { beforeEach, describe, expect, it, vi } from 'vitest';
import { contentPieceId } from './brandContentFixtures';
import { moduleNotSwitchedOn } from '../organisationModuleGate';
import { runContentAction as runPictureAction } from './brandContentTestWorld';

vi.mock('$env/static/public', () => ({ PUBLIC_SUPABASE_URL: 'https://files.example/', PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'a-key' }));
vi.mock('$env/dynamic/private', () => ({ env: {} }));
vi.mock('$env/dynamic/public', () => ({ env: {} }));

const world = vi.hoisted(() => ({
	switchedOn: [] as string[],
	items: new Map<string, unknown>(),
	needs: [] as Record<string, unknown>[],
	chosen: [] as Record<string, unknown>[],
	outcome: 'chosen'
}));
vi.mock('$lib/server/organisations/getOrganisation', async () => {
	const { jewel } = await import('./brandContentFixtures');
	return { getOrganisation: async (_supabase: unknown, organisationId: string) => (organisationId === jewel.id ? jewel : null) };
});
vi.mock('$lib/server/organisations/getSwitchedOnModules', () => ({ getSwitchedOnModules: async () => world.switchedOn }));
vi.mock('$lib/server/brandContent/findContentPiece', async () => {
	const { contentPiece } = await import('./brandContentFixtures');
	return { findContentPiece: async (_supabase: unknown, _organisationId: string, id: string) => (id === contentPiece.id ? { piece: contentPiece, reviews: [] } : null) };
});
vi.mock('$lib/server/brandContent/findContentPost', () => ({
	findContentPost: async (_supabase: unknown, _organisationId: string, piece: { id: string }) => ({ id: 'post-1', channels: [piece, piece], isKept: true })
}));
vi.mock('$lib/server/brandLibrary/findItemStanding', () => ({
	findItemStanding: async (_supabase: unknown, _organisationId: string, itemId: string) => world.items.get(itemId) ?? null
}));
vi.mock('$lib/server/brandContent/keepPictureNeed', () => ({ keepPictureNeed: async (_supabase: unknown, need: Record<string, unknown>) => void world.needs.push(need) }));
vi.mock('$lib/server/brandContent/keepPostPicture', () => ({
	keepPostPicture: async (_supabase: unknown, picture: Record<string, unknown>) => (world.chosen.push(picture), world.outcome)
}));

const kitchenId = '11111111-2222-4333-8444-555555555555';
const videoId = '66666666-7777-4888-9999-000000000000';
const awaitedId = '22222222-3333-4444-8555-666666666666';
const need = { contentPieceId, pictureNeeded: 'The team hanging a fire door', expectedFrom: 'The team on the job' };

describe('a post’s picture over the connector', () => {
	beforeEach(() => {
		world.switchedOn = ['brand'];
		world.needs = [];
		world.chosen = [];
		world.outcome = 'chosen';
		world.items = new Map([
			[kitchenId, { filename: 'kitchen-finished.jpg', posting: 'permission_given', recordedAt: '2026-11-04T09:30:00Z' }],
			[videoId, { filename: 'door-fitting.mp4', posting: 'not_to_be_posted', recordedAt: '2026-11-04T09:30:00Z' }],
			[awaitedId, { filename: 'roof.jpg', posting: 'nothing_recognisable', recordedAt: null }]
		]);
	});

	it('is refused while Brand is off for the organisation', async () => {
		world.switchedOn = [];
		expect(await runPictureAction('say_post_picture_needed', need)).toBe(moduleNotSwitchedOn('brand'));
	});

	it('keeps what the post needs once for every channel of the post', async () => {
		const answer = await runPictureAction('say_post_picture_needed', need);
		expect(answer).toContain('Kept for all 2 channels of the post: it needs The team hanging a fire door, expected from The team on the job.');
		expect(world.needs[0]).toMatchObject({ organisationId: 'jewel', accountId: 'nigel', post: { id: 'post-1' } });
	});

	it('refuses a need that does not fit its column, and a piece the brand does not hold, keeping nothing', async () => {
		const tooLong = await runPictureAction('say_post_picture_needed', { ...need, pictureNeeded: 'x'.repeat(501) });
		expect(tooLong).toBe('The picture needed was not kept: pictureNeeded is 501 characters; keep it to 500. Nothing was kept.');
		const otherPiece = await runPictureAction('say_post_picture_needed', { ...need, contentPieceId: awaitedId });
		expect(otherPiece).toContain('No piece of that id');
		expect(world.needs).toHaveLength(0);
	});

	it('chooses an item that may be posted for the post, with who chose it', async () => {
		const answer = await runPictureAction('choose_post_picture', { contentPieceId, itemId: kitchenId });
		expect(answer).toBe('Chose kitchen-finished.jpg for all 2 channels of the post. read_content shows it beside the caption.');
		expect(world.chosen[0]).toMatchObject({ accountId: 'nigel', libraryItemId: kitchenId, post: { id: 'post-1' } });
	});

	it('refuses by name an item not to be posted, one not arrived, and one the library does not keep', async () => {
		expect(await runPictureAction('choose_post_picture', { contentPieceId, itemId: videoId })).toBe(
			'The picture was not chosen: door-fitting.mp4 is marked not to be posted, so it cannot go in a post. Nothing was kept.'
		);
		expect(await runPictureAction('choose_post_picture', { contentPieceId, itemId: awaitedId })).toContain('roof.jpg has not arrived');
		const unknown = await runPictureAction('choose_post_picture', { contentPieceId, itemId: contentPieceId });
		expect(unknown).toContain('keeps no photo or video by that itemId');
		expect(await runPictureAction('choose_post_picture', { contentPieceId, itemId: 'kitchen' })).toContain('The itemId must be an id');
		expect(world.chosen).toHaveLength(0);
	});

	it('says when the item was already chosen for the post, keeping nothing twice', async () => {
		world.outcome = 'alreadyChosen';
		const answer = await runPictureAction('choose_post_picture', { contentPieceId, itemId: kitchenId });
		expect(answer).toBe('kitchen-finished.jpg was already chosen for this post, so nothing was kept twice.');
	});
});
