import { describe, expect, it } from 'vitest';
import { contentPlanOf } from '$lib/brand/plan/contentPlanOf';
import { describePostPictures } from './describePostPictures';
import { describePostsAwaitingPicture } from './brandContentPictureAnswers';
import { noPictures } from '$lib/brand/pictures/postPictures';
import type { LibraryItem } from '$lib/brand/library/libraryItem';
import type { PlannedPiece } from '$lib/brand/content/contentPiece';

const november = { year: 2026, month: 11 };

function channel(id: string, postId: string, mediumPath: string): PlannedPiece {
	return { id, postId, mediumPath, kind: 'tip', title: `Post ${postId}`, hook: '', caption: '', stage: 'drafted', plannedFor: '2026-11-03T09:00:00Z', scheduledFor: null, updatedAt: '' };
}

const kitchen = {
	id: 'kitchen-id',
	filename: 'kitchen-finished.jpg',
	mimeType: 'image/jpeg',
	byteCount: 2_000_000,
	storagePath: 'jewel/kitchen-id/kitchen-finished.jpg',
	shows: 'The finished kitchen at Mill Lane',
	takenOn: '2026-11-03',
	posting: 'permission_given',
	permissionGivenBy: 'Mrs Patel',
	addedBy: 'nigel',
	recordedAt: '2026-11-04T09:30:00Z'
} satisfies LibraryItem;

describe('reading a post’s picture out over the connector', () => {
	it('says when nobody has said what the post needs, and which action says it', () => {
		expect(describePostPictures(noPictures)).toContain('Picture: nobody has said what this post needs; say_post_picture_needed says it.');
	});

	it('gives what it needs, where from, and each item chosen with its footing', () => {
		const reading = describePostPictures({ needed: 'A finished kitchen', expectedFrom: 'The team on the job', chosen: [kitchen] });
		expect(reading).toContain('Picture needed: A finished kitchen\nExpected from: The team on the job\nChosen from the library:');
		expect(reading).toContain('- kitchen-finished.jpg (item id kitchen-id): The finished kitchen at Mill Lane — May be posted: permission was given by Mrs Patel');
	});

	it('marks an item since marked not to be posted, rather than hiding it', () => {
		const withdrawn = { ...kitchen, posting: 'not_to_be_posted' as const, permissionGivenBy: null };
		expect(describePostPictures({ ...noPictures, chosen: [withdrawn] })).toContain('[marked not to be posted since it was chosen: choose another]');
	});
});

describe('listing the posts that wait on a picture', () => {
	const pieces = [channel('ig', 'doors', 'image.post.instagram'), channel('fb', 'doors', 'image.post.facebook'), channel('li', 'roofs', 'text.post.linkedin')];

	it('lists each waiting post once, with every channel, what it needs and its first channel’s id', () => {
		const pictures = new Map([['doors', { ...noPictures, needed: 'The team fitting a door' }], ['roofs', { ...noPictures, chosen: [kitchen] }]]);
		const reading = describePostsAwaitingPicture('Jewel', contentPlanOf(november, pieces, [], pictures));
		expect(reading).toContain('Posts of Jewel’s plan for November 2026 waiting on a picture: 1.');
		expect(reading).toContain('- Tue 3 Nov 09:00 Post doors (tip) on Instagram post, Facebook image post — needs The team fitting a door [waiting on a picture] (id ig)');
		expect(reading).not.toContain('Post roofs');
	});

	it('says when no post of the month waits on one', () => {
		expect(describePostsAwaitingPicture('Jewel', contentPlanOf(november, pieces))).toBe('No post of Jewel’s plan for November 2026 is waiting on a picture.');
	});
});
