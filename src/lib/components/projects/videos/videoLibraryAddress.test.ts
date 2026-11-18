import { describe, expect, it } from 'vitest';
import { videoLibraryAt, videoLibraryHref } from './videoLibraryAddress';

const harbourId = '11111111-1111-4111-8111-111111111111';

describe('where a project’s video libraries are watched', () => {
	it('keeps the tutorials at the project’s videos and the promotional films beneath them', () => {
		expect(videoLibraryHref(harbourId, 'tutorials')).toBe(`/projects/${harbourId}/videos`);
		expect(videoLibraryHref(harbourId, 'promotional')).toBe(`/projects/${harbourId}/videos/promotional`);
	});

	it('reads the library back from the segment, and none from a segment that names no library', () => {
		expect(videoLibraryAt(undefined)).toBe('tutorials');
		expect(videoLibraryAt('promotional')).toBe('promotional');
		expect(videoLibraryAt('adverts')).toBeNull();
	});
});
