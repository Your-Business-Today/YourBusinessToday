import { beforeEach, describe, expect, it, vi } from 'vitest';
import { closeFilmForRunner } from './closeFilmForRunner';
import { openFilmForRunner } from './openFilmForRunner';

vi.mock('$env/static/public', () => ({ PUBLIC_SUPABASE_URL: 'https://files.example/', PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'a-key' }));
vi.mock('$env/dynamic/private', () => ({ env: {} }));

const ids = vi.hoisted(() => ({ clip: 'clip-1', music: 'music-1', piece: 'piece-1' }));
const world = vi.hoisted(() => ({ making: null as Record<string, unknown> | null, moves: [] as string[], recording: 'recorded', granted: [] as unknown[] }));
const supabase = {} as never;

vi.mock('./findFilmMakings', () => ({ findFilmMaking: async () => world.making }));
vi.mock('./moveFilmMaking', () => ({
	startFilming: async (_supabase: unknown, _id: string, filming: { libraryItemId: string }) => world.moves.push(`filming into ${filming.libraryItemId}`) > 0,
	finishFilming: async () => world.moves.push('ready') > 0,
	failFilmMaking: async (_supabase: unknown, _id: string, reason: string) => world.moves.push(`failed: ${reason}`) > 0
}));
vi.mock('$lib/server/brandContent/findContentPiece', () => {
	const shot = { seconds: 3, clipItemId: ids.clip };
	return { findContentPiece: async () => ({ piece: { id: ids.piece, title: 'Fire doors', storyboard: [shot, { ...shot, seconds: 0 }], musicItemId: ids.music } }) };
});
vi.mock('$lib/server/brandLibrary/readFilmFiles', () => ({
	readSignedLibraryItems: async () => [
		{ id: ids.clip, mimeType: 'video/quicktime', posting: 'permission_given', permissionGivenBy: 'Sam', viewUrl: 'https://files.example/clip' },
		{ id: ids.music, mimeType: 'audio/mpeg', posting: 'nothing_recognisable', permissionGivenBy: null, viewUrl: 'https://files.example/music' }
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

const waiting = { id: 'making-1', organisationId: 'jewel', contentPieceId: ids.piece, askedBy: 'nigel', state: 'waiting', libraryItemId: null };

describe('the doors GitHub’s runner knocks at to make a brand’s film', () => {
	beforeEach(() => {
		world.making = { ...waiting };
		world.moves = [];
		world.recording = 'recorded';
		world.granted = [];
	});

	it('hands a waiting film over with its shots, music and the library link its video goes to', async () => {
		const opening = await openFilmForRunner(supabase, 'making-1');
		expect(opening).toMatchObject({
			order: { uploadUrl: 'https://files.example/upload', musicUrl: 'https://files.example/music', shots: [{ seconds: 3, clipUrl: 'https://files.example/clip', isVideo: true }] }
		});
		expect(world.moves).toEqual(['filming into video-1']);
		expect(world.granted[0]).toMatchObject({ filename: 'Fire doors.mp4', mimeType: 'video/mp4', posting: 'permission_given', permissionGivenBy: 'Sam' });
	});

	it('hands over nothing that is not waiting', async () => {
		world.making = { ...waiting, state: 'ready' };
		expect(await openFilmForRunner(supabase, 'making-1')).toEqual({ problem: 'that film is ready, not waiting' });
		expect(world.moves).toHaveLength(0);
	});

	it('keeps the video once it has arrived in the library', async () => {
		world.making = { ...waiting, state: 'filming', libraryItemId: 'video-1' };
		expect(await closeFilmForRunner(supabase, 'making-1', { hasArrived: true })).toEqual({ state: 'ready' });
		expect(world.moves).toEqual(['ready']);
	});

	it('fails the film when the runner says it arrived and it did not, or says why it was not made', async () => {
		world.making = { ...waiting, state: 'filming', libraryItemId: 'video-1' };
		world.recording = 'not_arrived';
		expect(await closeFilmForRunner(supabase, 'making-1', { hasArrived: true })).toEqual({ state: 'failed' });
		expect(await closeFilmForRunner(supabase, 'making-1', { hasArrived: false, failureReason: 'ffmpeg stopped' })).toEqual({ state: 'failed' });
		expect(world.moves).toEqual(['failed: the video did not arrive in the library', 'failed: ffmpeg stopped']);
	});

	it('refuses a word that does not fit, before reading the film', async () => {
		expect(await closeFilmForRunner(supabase, 'making-1', { hasArrived: 'yes' })).toEqual({ problem: 'hasArrived is true or false' });
		expect(world.moves).toHaveLength(0);
	});
});
