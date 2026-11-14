import { describe, expect, it } from 'vitest';
import { makingKindOf, problemWithMakingPictures } from './pictureMaking';
import type { ContentPiece } from '../content/contentPiece';
import type { ItemStanding } from '../library/choosableItem';

const photoId = '6a1d2c3e-4b5f-4a6b-8c7d-9e0f1a2b3c4d';
const shot = { description: 'The door', seconds: 0, onScreenText: 'Shut', overline: '', underline: '', wordsAt: 'top' as const, clipItemId: photoId as string | null };
const carousel = { title: 'Fire doors', mediumPath: 'image.carousel.instagram', storyboard: [shot, shot], musicItemId: null } as unknown as ContentPiece;
const photo: ItemStanding = { filename: 'door.jpg', mimeType: 'image/jpeg', posting: 'nothing_recognisable', recordedAt: '2026-11-14T10:00:00Z' };

describe('asking for a piece’s pictures', () => {
	it('makes an image piece into pictures and anything else into its video', () => {
		expect(makingKindOf('image.carousel.instagram')).toBe('pictures');
		expect(makingKindOf('image')).toBe('pictures');
		expect(makingKindOf('video.short.tiktok')).toBe('video');
	});

	it('is allowed for an image piece whose every shot carries a photo that may go out', () => {
		expect(problemWithMakingPictures(carousel, new Map([[photoId, photo]]), null)).toBeNull();
	});

	it('is refused by name for a video, a shot with no photo, or a shot whose clip is a video', () => {
		expect(problemWithMakingPictures({ ...carousel, mediumPath: 'video.short.tiktok' }, new Map(), null)).toContain('is not a picture post');
		const withoutPhoto = { ...carousel, storyboard: [shot, { ...shot, clipItemId: null }] };
		expect(problemWithMakingPictures(withoutPhoto, new Map([[photoId, photo]]), null)).toBe(
			'Shot 2 has no picture; give it the clipItemId of a photo from the library'
		);
		const footage = { ...photo, filename: 'door.mp4', mimeType: 'video/mp4' };
		expect(problemWithMakingPictures(carousel, new Map([[photoId, footage]]), null)).toBe('Shot 1: door.mp4 is not a photo, and a picture is made from a photo');
	});
});
