import { beforeEach, describe, expect, it, vi } from 'vitest';
import { contentPieceId } from './brandContentFixtures';
import { runContentAction } from './brandContentTestWorld';

vi.mock('$env/static/public', () => ({ PUBLIC_SUPABASE_URL: 'https://files.example/', PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'a-key' }));
vi.mock('$env/dynamic/private', () => ({ env: {} }));
vi.mock('$env/dynamic/public', () => ({ env: {} }));

const { clipId } = vi.hoisted(() => ({ clipId: '5f0c2b1e-8a3d-4f6e-9b2c-1d4e5f6a7b8c' }));
const world = vi.hoisted(() => ({ latest: null as unknown, kept: [] as unknown[], openRefusal: null as string | null, failed: [] as string[], shapes: [] as string[] }));
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
		new Map([[ clipId, { filename: 'door.mp4', mimeType: 'video/mp4', posting: 'nothing_recognisable', recordedAt: '2026-11-14T10:00:00Z', shows: 'A door' } ]])
}));
vi.mock('$lib/server/brandFilm/findFilmMakings', () => ({ findLatestFilmMaking: async () => world.latest }));
vi.mock('$lib/server/brandFilm/keepFilmMaking', () => ({
	keepFilmMaking: async (_supabase: unknown, asker: unknown) => {
		world.kept.push(asker);
		return { id: 'making-1', kind: 'video', pictureItemIds: [], state: 'waiting', failureReason: null, libraryItemId: null, askedAt: '2026-11-14T19:00:00Z', finishedAt: null };
	}
}));
vi.mock('$lib/server/brandFilm/openFilmMaking', () => ({
	openFilmMaking: async (_supabase: unknown, _making: unknown, _piece: unknown, shape: string) => {
		world.shapes.push(shape);
		if (world.openRefusal !== null) return { problem: world.openRefusal };
		const words = { overline: '', headline: 'Shut', underline: '', wordsAt: 'bottom' };
		const shot = { seconds: 3, clip: { url: 'https://files.example/clip', filename: 'door.mp4' }, isVideo: true, words };
		return { order: { kind: 'video', shape, look: {}, uploadUrl: 'https://files.example/up', largestByteCount: 100, shots: [shot], music: null } };
	}
}));
vi.mock('$lib/server/brandFilm/moveFilmMaking', () => ({ failFilmMaking: async (_id: string, reason: string) => world.failed.push(reason) }));

describe('making a client’s video from chat', () => {
	beforeEach(() =>
		Object.assign(world, { latest: null, kept: [], openRefusal: null, failed: [], shapes: [] })
	);

	it('keeps the request under the person asking and hands back the recipe to run, in the medium’s shape', async () => {
		const answer = await runContentAction('make_content_video', { contentPieceId });
		expect(answer).toContain('The video is yours to make now, here in your own sandbox');
		expect(answer).toContain('```bash\n#!/usr/bin/env bash\nset -euo pipefail');
		expect(answer).toContain("curl -sSfL -o clip1.mp4 'https://files.example/clip'");
		expect(answer).toContain('record_content_made');
		expect(world.kept).toEqual([{ organisationId: 'jewel', accountId: 'nigel', contentPieceId, kind: 'video' }]);
		expect(world.shapes).toEqual(['tall']);
	});

	it('makes it in the shape asked for, and refuses a shape there is not', async () => {
		await runContentAction('make_content_video', { contentPieceId, shape: 'square' });
		expect(world.shapes).toEqual(['square']);
		expect(
			await runContentAction('make_content_video', { contentPieceId, shape: 'round' })
		).toBe('shape is wide, square or tall. Nothing was asked for.');
	});

	it('closes a request left open past its links before asking again', async () => {
		world.latest = { id: 'm', kind: 'video', pictureItemIds: [], state: 'filming', failureReason: null, libraryItemId: null, askedAt: '2026-11-01T09:00:00Z', finishedAt: null };
		expect(await runContentAction('make_content_video', { contentPieceId })).toContain('The video is yours to make now');
		expect(world.failed).toEqual(['its links ran out before what it made was recorded']);
	});

	it('is refused by name while one is already being made, keeping nothing', async () => {
		world.latest = { id: 'm', kind: 'video', pictureItemIds: [], state: 'filming', failureReason: null, libraryItemId: null, askedAt: new Date().toISOString(), finishedAt: null };
		const answer = await runContentAction('make_content_video', { contentPieceId });
		expect(answer).toBe('The video was not asked for: “Fire doors” is already being made; its video shows on the piece when it is ready. Nothing was kept.');
		expect(world.kept).toHaveLength(0);
	});

	it('says why, when the request could not be opened', async () => {
		world.openRefusal = 'a clip of “Fire doors” could not be reached in the library';
		const answer = await runContentAction('make_content_video', { contentPieceId });
		expect(answer).toBe('The video was asked for but could not be opened: a clip of “Fire doors” could not be reached in the library.');
	});

	it('refuses pictures of a video piece by name, keeping nothing', async () => {
		expect(await runContentAction('make_content_pictures', { contentPieceId })).toBe(
			'The pictures were not asked for: “Fire doors” is not a picture post, story or carousel. Nothing was kept.'
		);
		expect(world.kept).toHaveLength(0);
	});

	it('refuses an id that is not one before reading anything', async () => {
		expect(
			await runContentAction('make_content_video', { contentPieceId: 'fire-doors' })
		).toContain('contentPieceId');
	});
});
