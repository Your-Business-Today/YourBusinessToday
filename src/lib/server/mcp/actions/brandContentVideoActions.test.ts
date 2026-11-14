import { beforeEach, describe, expect, it, vi } from 'vitest';
import { contentPieceId } from './brandContentFixtures';
import { runContentAction } from './brandContentTestWorld';

vi.mock('$env/static/public', () => ({ PUBLIC_SUPABASE_URL: 'https://files.example/', PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'a-key' }));
vi.mock('$env/dynamic/private', () => ({ env: {} }));
vi.mock('$env/dynamic/public', () => ({ env: {} }));

const { clipId } = vi.hoisted(() => ({ clipId: '5f0c2b1e-8a3d-4f6e-9b2c-1d4e5f6a7b8c' }));
const world = vi.hoisted(() => ({ latest: null as unknown, kept: [] as unknown[], startRefusal: null as string | null, failed: [] as string[] }));
vi.mock('$lib/server/organisations/getOrganisation', async () => {
	const { jewel } = await import('./brandContentFixtures');
	return { getOrganisation: async (_supabase: unknown, organisationId: string) => (organisationId === jewel.id ? jewel : null) };
});
vi.mock('$lib/server/organisations/getSwitchedOnModules', () => ({ getSwitchedOnModules: async () => ['brand'] }));
vi.mock('$lib/server/brandContent/findContentPiece', async () => {
	const { contentPiece } = await import('./brandContentFixtures');
	const shot = { description: 'A door', seconds: 3, onScreenText: 'Shut', overline: '', underline: '', wordsAt: 'bottom', clipItemId: clipId };
	const found = { piece: { ...contentPiece, storyboard: [shot], musicItemId: null }, reviews: [] };
	return { findContentPiece: async (_supabase: unknown, _organisationId: string, id: string) => (id === contentPiece.id ? found : null) };
});
vi.mock('$lib/server/brandLibrary/findItemStandings', () => ({
	findItemStandings: async () =>
		new Map([[clipId, { filename: 'door.mp4', mimeType: 'video/mp4', posting: 'nothing_recognisable', recordedAt: '2026-11-14T10:00:00Z', shows: 'A door' }]])
}));
vi.mock('$lib/server/brandFilm/findFilmMakings', () => ({ findLatestFilmMaking: async () => world.latest }));
vi.mock('$lib/server/brandFilm/keepFilmMaking', () => ({
	keepFilmMaking: async (_supabase: unknown, asker: unknown) => {
		world.kept.push(asker);
		return { id: 'making-1', kind: 'video', pictureItemIds: [], state: 'waiting', failureReason: null, libraryItemId: null, askedAt: '2026-11-14T19:00:00Z', finishedAt: null };
	}
}));
vi.mock('$lib/server/brandFilm/startFilmWorkflow', () => ({ startFilmWorkflow: async () => world.startRefusal }));
vi.mock('$lib/server/payments/supabaseServiceClient', () => ({ supabaseServiceClient: () => ({}) }));
vi.mock('$lib/server/brandFilm/moveFilmMaking', () => ({
	failFilmMaking: async (_supabase: unknown, _id: string, reason: string) => world.failed.push(reason)
}));
vi.mock('$lib/server/brandContent/findPostPictures', () => ({ findPostPictures: async () => new Map() }));
vi.mock('$lib/server/brandContent/findContentPost', () => ({
	findContentPost: async (_supabase: unknown, _organisationId: string, piece: { id: string }) => ({ id: piece.id, channels: [piece], isKept: true })
}));

describe('making a client’s video from chat', () => {
	beforeEach(() => {
		world.latest = null;
		world.kept = [];
		world.startRefusal = null;
		world.failed = [];
	});

	it('keeps the request under the person asking and starts the filming', async () => {
		const answer = await runContentAction('make_content_video', { contentPieceId });
		expect(answer).toContain('The video is asked for (id making-1) and is being started');
		expect(world.kept).toEqual([{ organisationId: 'jewel', accountId: 'nigel', contentPieceId, kind: 'video' }]);
	});

	it('is refused by name while one is already being made, keeping nothing', async () => {
		world.latest = { id: 'm', kind: 'video', pictureItemIds: [], state: 'filming', failureReason: null, libraryItemId: null, askedAt: '', finishedAt: null };
		const answer = await runContentAction('make_content_video', { contentPieceId });
		expect(answer).toBe('The video was not asked for: “Fire doors” is already being made; its video shows on the piece when it is ready. Nothing was kept.');
		expect(world.kept).toHaveLength(0);
	});

	it('keeps the request as failed, saying why, when GitHub will not start the filming', async () => {
		world.startRefusal = 'GitHub refused to start the filming (403)';
		const answer = await runContentAction('make_content_video', { contentPieceId });
		expect(answer).toBe('The video was asked for but could not be started: GitHub refused to start the filming (403).');
		expect(world.failed).toEqual(['GitHub refused to start the filming (403)']);
	});

	it('refuses pictures of a video piece by name, keeping nothing', async () => {
		expect(await runContentAction('make_content_pictures', { contentPieceId })).toBe(
			'The pictures were not asked for: “Fire doors” is not a picture post, story or carousel. Nothing was kept.'
		);
		expect(world.kept).toHaveLength(0);
	});

	it('refuses an id that is not one before reading anything', async () => {
		expect(await runContentAction('make_content_video', { contentPieceId: 'fire-doors' })).toContain('contentPieceId');
	});

	it('shows where the video stands when the piece is read, and where to find it once it is made', async () => {
		world.latest = { id: 'm', kind: 'video', pictureItemIds: [], state: 'ready', failureReason: null, libraryItemId: 'item-9', askedAt: '', finishedAt: '2026-11-14T19:20:00Z' };
		const answer = await runContentAction('read_content', { contentPieceId });
		expect(answer).toContain('Video: made 14 Nov, 19:20, in the library');
		expect(answer).toContain('in the library as item item-9. Put it on the post with choose_post_picture.');
	});
});
