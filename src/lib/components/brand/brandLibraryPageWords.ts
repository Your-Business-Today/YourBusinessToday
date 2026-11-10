import { LibraryLimits } from '$lib/brand/library/libraryLimits';
import { mayBePosted } from '$lib/brand/library/libraryItem';
import type { BadgeTone } from '$lib/components/site/badgeTones';
import type { SignedUploadActions } from '$lib/components/projects/uploadThroughSignedLink';
import type { LibraryItem } from '$lib/brand/library/libraryItem';

/** A kept photo or video as the library page shows it: with the link it is viewed by, if storage signed one, and who added it. */
export type LibraryPageItem = LibraryItem & { viewUrl: string | null; addedByName: string };

/** The library page's actions that sign an item's upload link, and record the file sent to it. */
export const brandLibraryUploadActions: SignedUploadActions = {
	grant: '?/grantItem',
	record: '?/recordItem',
	idField: 'itemId'
};

export const noBrandYet =
	'This brand has not been started yet. Ask your Claude to describe the brand first, then add photos and videos here.';

export const libraryIsEmpty = 'No photos or videos yet. Add the first from your phone or computer.';

export const libraryLimitHint = `A photo or a video, up to ${LibraryLimits.largestMegabytes} MB.`;

/** The note under the table when the brand keeps more than a list shows. */
export function moreThanListed(keptCount: number): string | null {
	if (keptCount <= LibraryLimits.mostItemsListed) return null;
	return `Showing the latest ${LibraryLimits.mostItemsListed} of ${keptCount}.`;
}

/** The badge that says at a glance whether an item may be posted. */
export function postingBadgeOf(item: LibraryPageItem): { label: string; tone: BadgeTone } {
	if (mayBePosted(item)) return { label: 'May be posted', tone: 'positive' };
	return { label: 'Not to be posted', tone: 'negative' };
}
