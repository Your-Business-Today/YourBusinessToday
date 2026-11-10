import type { LibraryItem } from '$lib/brand/library/libraryItem';

export const kitchenId = '11111111-2222-4333-8444-555555555555';

const kitchen: LibraryItem = {
	id: kitchenId,
	filename: 'kitchen-finished.jpg',
	mimeType: 'image/jpeg',
	byteCount: 2_097_152,
	storagePath: `jewel/${kitchenId}/kitchen-finished.jpg`,
	shows: 'The finished kitchen at Mill Lane',
	takenOn: '2026-11-03',
	posting: 'permission_given',
	permissionGivenBy: 'Mrs Patel, the homeowner',
	addedBy: 'nigel',
	recordedAt: '2026-11-04T09:30:00Z'
};

const fittingVideo: LibraryItem = {
	...kitchen,
	id: '66666666-7777-4888-9999-000000000000',
	filename: 'door-fitting.mp4',
	mimeType: 'video/mp4',
	shows: 'A fire door being hung in a block of flats',
	posting: 'not_to_be_posted',
	permissionGivenBy: null
};

/** A brand's library held in memory, for the tests of the library actions. */
export const libraryWorld = { switchedOn: ['brand'] as string[], items: [kitchen, fittingVideo] as LibraryItem[] };

export function resetLibraryWorld() {
	Object.assign(libraryWorld, { switchedOn: ['brand'], items: [kitchen, fittingVideo] });
}
