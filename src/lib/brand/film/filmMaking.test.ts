import { describe, expect, it } from 'vitest';
import { checkFilmOutcome } from './checkFilmOutcome';
import { filmPostingOf } from './filmPosting';
import { isFilmShape } from './filmFrame';
import { problemWithMakingFilm, type FilmMaking } from './filmMaking';
import type { ContentPiece } from '../content/contentPiece';
import type { ItemStanding } from '../library/choosableItem';

const clipId = '5f0c2b1e-8a3d-4f6e-9b2c-1d4e5f6a7b8c';
const shot = { description: 'A door', seconds: 3, onScreenText: 'Shut', overline: '', underline: '', wordsAt: 'bottom' as const, clipItemId: clipId as string | null };
const piece = { title: 'Fire doors', mediumPath: 'video.short.tiktok', storyboard: [shot], musicItemId: null } as unknown as ContentPiece;
const footage: ItemStanding = { filename: 'door.mp4', mimeType: 'video/mp4', posting: 'nothing_recognisable', recordedAt: '2026-11-14T10:00:00Z' };
const library = new Map([[clipId, footage]]);
const making = (state: FilmMaking['state']): FilmMaking => ({ id: 'm', kind: 'video', pictureItemIds: [], state, failureReason: null, libraryItemId: null, askedAt: '', finishedAt: null });

describe('asking for a piece’s video', () => {
	it('is allowed for a video whose every shot has a clip that may go out', () => {
		expect(problemWithMakingFilm(piece, library, null)).toBeNull();
		expect(problemWithMakingFilm(piece, library, making('failed'))).toBeNull();
	});

	it('is refused by name for a picture, a shot with no clip, a clip not to be posted, or one already being made', () => {
		expect(problemWithMakingFilm({ ...piece, mediumPath: 'image.post.x' }, library, null)).toContain('is not a video');
		expect(problemWithMakingFilm({ ...piece, storyboard: [{ ...shot, clipItemId: null }] }, library, null)).toBe(
			'Shot 1 has no clip; give it a clipItemId from the library'
		);
		const kept = new Map([[clipId, { ...footage, posting: 'not_to_be_posted' as const }]]);
		expect(problemWithMakingFilm(piece, kept, null)).toContain('marked not to be posted');
		expect(problemWithMakingFilm(piece, library, making('filming'))).toContain('already being made');
	});
});

describe('the footing a made video is posted on', () => {
	it('follows its clips: nothing recognisable, or on the permission of everyone who gave it', () => {
		const plain = { posting: 'nothing_recognisable' as const, permissionGivenBy: null };
		const given = { posting: 'permission_given' as const, permissionGivenBy: 'Sam Jewel' };
		expect(filmPostingOf([plain, plain])).toEqual(plain);
		expect(filmPostingOf([plain, given, given, { ...given, permissionGivenBy: 'Ann' }])).toEqual({ ...given, permissionGivenBy: 'Sam Jewel, Ann' });
		expect(filmPostingOf([{ ...given, permissionGivenBy: 'x'.repeat(121) }])).toHaveProperty('problem');
	});
});

describe('what the asker’s Claude says when it is done', () => {
	it('is taken only as arrived, or as not made with a reason that fits its column', () => {
		expect(checkFilmOutcome({ hasArrived: true })).toEqual({ hasArrived: true });
		expect(checkFilmOutcome({ hasArrived: false, failureReason: 'ffmpeg stopped' })).toEqual({ hasArrived: false, failureReason: 'ffmpeg stopped' });
		expect(checkFilmOutcome({ hasArrived: false })).toHaveProperty('problem');
		expect(checkFilmOutcome({ hasArrived: false, failureReason: 'x'.repeat(501) })).toEqual({ problem: 'failureReason is 501 characters; keep it to 500' });
		expect(checkFilmOutcome(null)).toHaveProperty('problem');
	});

	it('films only in a shape the player knows', () => {
		expect(isFilmShape('tall')).toBe(true);
		expect(isFilmShape('toString')).toBe(false);
	});
});
