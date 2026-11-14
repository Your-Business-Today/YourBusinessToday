import { beforeEach, describe, expect, it, vi } from 'vitest';
import { contentPieceId } from './brandContentFixtures';
import { runContentAction } from './brandContentTestWorld';

vi.mock('$env/static/public', () => ({ PUBLIC_SUPABASE_URL: 'https://files.example/', PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'a-key' }));
vi.mock('$env/dynamic/private', () => ({ env: {} }));
vi.mock('$env/dynamic/public', () => ({ env: {} }));

const world = vi.hoisted(() => ({ latest: null as unknown, failed: [] as string[] }));
vi.mock('$lib/server/organisations/getOrganisation', async () => {
	const { jewel } = await import('./brandContentFixtures');
	return { getOrganisation: async (_supabase: unknown, organisationId: string) => (organisationId === jewel.id ? jewel : null) };
});
vi.mock('$lib/server/organisations/getSwitchedOnModules', () => ({ getSwitchedOnModules: async () => ['brand'] }));
vi.mock('$lib/server/brandContent/findPostPictures', () => ({ findPostPictures: async () => new Map() }));
vi.mock('$lib/server/brandContent/findContentPost', () => ({
	findContentPost: async (_supabase: unknown, _organisationId: string, piece: { id: string }) => ({ id: piece.id, channels: [piece], isKept: true })
}));
vi.mock('$lib/server/brandContent/findContentPiece', async () => {
	const { contentPiece } = await import('./brandContentFixtures');
	return { findContentPiece: async () => ({ piece: contentPiece, reviews: [] }) };
});
vi.mock('$lib/server/brandFilm/findFilmMakings', () => ({ findLatestFilmMaking: async () => world.latest }));
vi.mock('$lib/server/payments/supabaseServiceClient', () => ({ supabaseServiceClient: () => ({}) }));
vi.mock('$lib/server/brandFilm/moveFilmMaking', () => ({ failFilmMaking: async (_id: string, reason: string) => world.failed.push(reason), finishFilming: async () => true }));

describe('recording what a user’s Claude made from its recipe, and reading where it stands', () => {
	beforeEach(() => {
		world.failed = [];
	});

	it('records the asker’s word that the recipe failed, and refuses anyone else’s', async () => {
		world.latest = { id: 'm', kind: 'video', askedBy: 'nigel', pictureItemIds: [], state: 'filming', failureReason: null, libraryItemId: 'item-9', askedAt: '', finishedAt: null };
		const failed = await runContentAction('record_content_made', { contentPieceId, hasArrived: false, failureReason: 'ffmpeg has no drawtext' });
		expect(failed).toBe('Video: not made: ffmpeg has no drawtext. Ask again with make_content_video once that is put right.');
		expect(world.failed).toEqual(['ffmpeg has no drawtext']);
		world.latest = { ...(world.latest as object), askedBy: 'katie' };
		expect(
			await runContentAction('record_content_made', { contentPieceId, hasArrived: true })
		).toBe('Nothing was recorded: only the person who asked for it can say it is done.');
	});

	it('shows where the video stands when the piece is read, and where to find it once it is made', async () => {
		world.latest = { id: 'm', kind: 'video', pictureItemIds: [], state: 'ready', failureReason: null, libraryItemId: 'item-9', askedAt: '', finishedAt: '2026-11-14T19:20:00Z' };
		const answer = await runContentAction('read_content', { contentPieceId });
		expect(answer).toContain('Video: made 14 Nov, 19:20, in the library');
		expect(answer).toContain('in the library as item item-9. Put it on the post with choose_post_picture.');
	});
});
