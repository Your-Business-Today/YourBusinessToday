import { beforeEach, describe, expect, it, vi } from 'vitest';
import { closeFilmMaking } from './closeFilmMaking';
import { openFilmMaking } from './openFilmMaking';

vi.mock('$env/static/public', () => ({ PUBLIC_SUPABASE_URL: 'https://files.example/', PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'a-key' }));
vi.mock('$env/dynamic/private', () => ({ env: {} }));

const ids = vi.hoisted(() => ({ clip: 'clip-1', music: 'music-1', piece: 'piece-1' }));
const world = vi.hoisted(() => ({ making: null as Record<string, unknown> | null, moves: [] as string[], recording: 'recorded', granted: [] as unknown[] }));
const supabase = {} as never;
const words = { onScreenText: 'Shut', overline: 'Fire safety', underline: '', wordsAt: 'bottom' };
const piece = {
	id: ids.piece,
	title: 'Fire doors',
	mediumPath: 'video.short.tiktok',
	storyboard: [{ seconds: 3, clipItemId: ids.clip, ...words }, { seconds: 0, clipItemId: ids.clip, ...words }],
	musicItemId: ids.music,
	brandSnapshot: { variables: { '--brand-colour-accent': '#123456' } }
} as never;

vi.mock('./findFilmMakings', () => ({ findLatestFilmMaking: async () => world.making }));
vi.mock('./moveFilmMaking', () => ({
	startFilming: async (_id: string, libraryItemId: string) => world.moves.push(`filming into ${libraryItemId}`) > 0,
	finishFilming: async () => world.moves.push('ready') > 0,
	failFilmMaking: async (_id: string, reason: string) => world.moves.push(`failed: ${reason}`) > 0
}));
vi.mock('$lib/server/brandLibrary/readFilmFiles', () => ({
	readSignedLibraryItems: async () => [
		{ id: ids.clip, filename: 'door.mov', mimeType: 'video/quicktime', posting: 'permission_given', permissionGivenBy: 'Sam', viewUrl: 'https://files.example/clip' },
		{ id: ids.music, filename: 'tune.mp3', mimeType: 'audio/mpeg', posting: 'nothing_recognisable', permissionGivenBy: null, viewUrl: 'https://files.example/music' }
	]
}));
vi.mock('$lib/server/brandLibrary/grantLibraryUpload', () => ({
	grantLibraryUpload: async (_supabase: unknown, _adder: unknown, item: unknown) => {
		world.granted.push(item);
		return { itemId: 'video-1', uploadUrl: 'https://files.example/upload' };
	}
}));
vi.mock('$lib/server/brandLibrary/recordLibraryUpload', () => ({
	libraryUploadRecordings: { recorded: 'recorded', alreadyRecorded: 'already_recorded' },
	recordLibraryUpload: async () => ({ status: world.recording })
}));

const waiting = { id: 'making-1', organisationId: 'jewel', contentPieceId: ids.piece, askedBy: 'nigel', kind: 'video', state: 'waiting', libraryItemId: null, pictureItemIds: [] as string[] };
const closer = { organisationId: 'jewel', accountId: 'nigel', contentPieceId: ids.piece };

describe('a brand’s video, made by the asker’s own Claude', () => {
	beforeEach(() => Object.assign(world, { making: { ...waiting, state: 'filming', libraryItemId: 'video-1' }, moves: [], recording: 'recorded', granted: [] }));

	it('opens a kept request with its shots, words, music, look and the library link its video goes to', async () => {
		const opening = await openFilmMaking(supabase, waiting as never, piece, 'tall');
		expect(opening).toMatchObject({
			order: {
				shape: 'tall',
				look: { '--brand-colour-accent': '#123456' },
				uploadUrl: 'https://files.example/upload',
				music: { url: 'https://files.example/music', filename: 'tune.mp3' },
				shots: [{ seconds: 3, clip: { url: 'https://files.example/clip', filename: 'door.mov' }, isVideo: true, words: { headline: 'Shut', overline: 'Fire safety' } }]
			}
		});
		expect(world.moves).toEqual(['filming into video-1']);
		expect(world.granted[0]).toMatchObject({ filename: 'Fire doors.mp4', mimeType: 'video/mp4', posting: 'permission_given', permissionGivenBy: 'Sam' });
	});

	it('keeps the video once it has arrived in the library', async () => {
		expect(await closeFilmMaking(supabase, closer, { hasArrived: true })).toMatchObject({ state: 'ready' });
		expect(world.moves).toEqual(['ready']);
	});

	it('fails the request when the Claude says it arrived and it did not, or says why it was not made', async () => {
		world.recording = 'not_arrived';
		expect(await closeFilmMaking(supabase, closer, { hasArrived: true })).toMatchObject({ state: 'failed' });
		expect(await closeFilmMaking(supabase, closer, { hasArrived: false, failureReason: 'ffmpeg stopped' })).toMatchObject({ state: 'failed' });
		expect(world.moves).toEqual(['failed: what was made did not all arrive in the library', 'failed: ffmpeg stopped']);
	});

	it('takes the word only of the person who asked, and only while it is being made', async () => {
		expect(await closeFilmMaking(supabase, { ...closer, accountId: 'katie' }, { hasArrived: true })).toEqual({ problem: 'only the person who asked for it can say it is done' });
		world.making = { ...waiting, state: 'ready' };
		expect(await closeFilmMaking(supabase, closer, { hasArrived: true })).toEqual({ problem: 'its latest request is ready, not being made' });
		expect(world.moves).toHaveLength(0);
	});

	it('refuses a word that does not fit, before reading the request', async () => {
		expect(await closeFilmMaking(supabase, closer, { hasArrived: 'yes' })).toEqual({ problem: 'hasArrived is true or false' });
		expect(world.moves).toHaveLength(0);
	});
});
