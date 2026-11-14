import { beforeEach, describe, expect, it, vi } from 'vitest';
import { closeFilmMaking } from './closeFilmMaking';
import { openFilmMaking } from './openFilmMaking';

vi.mock('$env/static/public', () => ({ PUBLIC_SUPABASE_URL: 'https://files.example/', PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'a-key' }));
vi.mock('$env/dynamic/private', () => ({ env: {} }));

const world = vi.hoisted(() => ({ making: null as Record<string, unknown> | null, moves: [] as string[], granted: [] as unknown[], kept: [] as unknown[], recorded: [] as string[] }));
const supabase = {} as never;
const shot = { seconds: 0, clipItemId: 'photo-1', onScreenText: 'Shut', overline: '', underline: '', wordsAt: 'top' };
const piece = { id: 'piece-1', title: 'Fire doors', mediumPath: 'image.carousel', storyboard: [shot, { ...shot, clipItemId: 'photo-2' }], musicItemId: null, brandSnapshot: {} } as never;

vi.mock('./findFilmMakings', () => ({ findLatestFilmMaking: async () => world.making }));
vi.mock('./moveFilmMaking', () => ({
	startFilming: async (_id: string, libraryItemId: string) => world.moves.push(`filming as ${libraryItemId}`) > 0,
	finishFilming: async () => world.moves.push('ready') > 0,
	failFilmMaking: async (_id: string, reason: string) => world.moves.push(`failed: ${reason}`) > 0
}));
vi.mock('./keepPicturesMade', () => ({ keepPicturesMade: async (_making: unknown, itemIds: string[]) => world.kept.push(...itemIds) }));
vi.mock('$lib/server/brandLibrary/readFilmFiles', () => ({
	readSignedLibraryItems: async () => [
		{ id: 'photo-1', filename: 'a.jpg', mimeType: 'image/jpeg', posting: 'nothing_recognisable', permissionGivenBy: null, viewUrl: 'https://files.example/1' },
		{ id: 'photo-2', filename: 'b.jpg', mimeType: 'image/jpeg', posting: 'permission_given', permissionGivenBy: 'Sam', viewUrl: 'https://files.example/2' }
	]
}));
vi.mock('$lib/server/brandLibrary/grantLibraryUpload', () => ({
	grantLibraryUpload: async (_supabase: unknown, _adder: unknown, item: unknown) => {
		const count = world.granted.push(item);
		return { itemId: `picture-${count}`, uploadUrl: `https://files.example/upload-${count}` };
	}
}));
vi.mock('$lib/server/brandLibrary/recordLibraryUpload', () => ({
	libraryUploadRecordings: { recorded: 'recorded', alreadyRecorded: 'already_recorded' },
	recordLibraryUpload: async (_supabase: unknown, _adder: unknown, itemId: string) => {
		world.recorded.push(itemId);
		return { status: itemId === 'picture-2' && world.moves.includes('lose the second') ? 'not_arrived' : 'recorded' };
	}
}));

const waiting = { id: 'making-1', kind: 'pictures', organisationId: 'jewel', contentPieceId: 'piece-1', askedBy: 'nigel', state: 'waiting', libraryItemId: null, pictureItemIds: [] };
const closer = { organisationId: 'jewel', accountId: 'nigel', contentPieceId: 'piece-1' };

describe('a carousel’s pictures, made by the asker’s own Claude', () => {
	beforeEach(() => {
		world.making = { ...waiting };
		world.moves = [];
		world.granted = [];
		world.kept = [];
		world.recorded = [];
	});

	it('grants one picture a shot in shot order, each on its own photo’s footing, and names the first as what it makes', async () => {
		const opening = await openFilmMaking(supabase, waiting as never, piece, 'square');
		expect(opening).toMatchObject({
			order: {
				kind: 'pictures',
				shape: 'square',
				pictures: [{ photo: { url: 'https://files.example/1', filename: 'a.jpg' }, uploadUrl: 'https://files.example/upload-1' }, { photo: { url: 'https://files.example/2' } }]
			}
		});
		expect(world.granted).toMatchObject([
			{ filename: 'Fire doors 1.png', mimeType: 'image/png', posting: 'nothing_recognisable' },
			{ filename: 'Fire doors 2.png', posting: 'permission_given', permissionGivenBy: 'Sam' }
		]);
		expect(world.kept).toEqual(['picture-1', 'picture-2']);
		expect(world.moves).toEqual(['filming as picture-1']);
	});

	it('is ready only once every picture has arrived', async () => {
		world.making = { ...waiting, state: 'filming', libraryItemId: 'picture-1', pictureItemIds: ['picture-1', 'picture-2'] };
		expect(await closeFilmMaking(supabase, closer, { hasArrived: true })).toMatchObject({ state: 'ready' });
		expect(world.recorded).toEqual(['picture-1', 'picture-2']);
		world.moves = ['lose the second'];
		expect(await closeFilmMaking(supabase, closer, { hasArrived: true })).toMatchObject({ state: 'failed' });
	});
});
