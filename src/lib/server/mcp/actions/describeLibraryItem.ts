import { describeByteCount } from '$lib/data/taskAttachmentRules';
import { describePostingFooting } from '$lib/brand/library/libraryWords';
import { fetchLinkLifetimeMinutes } from '$lib/server/storage/signFetchLink';
import { formatBritishDate, formatBritishDateTime } from '$lib/data/britishDate';
import { isVideo, type LibraryItem } from '$lib/brand/library/libraryItem';
import { LibraryLimits } from '$lib/brand/library/libraryLimits';
import type { KeptLibrary } from '$lib/server/brandLibrary/findLibraryItems';
import type { Organisation } from '$lib/server/organisations/organisationRecord';

/** The action that reads one item, named wherever the library is listed. */
export const readLibraryItemAction = 'read_brand_library_item';

const addedOnTheSite = 'Photos and videos are added on the site, on the Brand place’s Photos and videos page.';

function libraryCountOf(keptCount: number): string {
	if (keptCount === 1) return 'one photo or video';
	return `${keptCount} photos and videos`;
}

function kindOf(item: LibraryItem): string {
	return isVideo(item) ? 'video' : 'photo';
}

function itemLine(item: LibraryItem): string {
	const facts = `${kindOf(item)}, taken ${formatBritishDate(item.takenOn)}, item id ${item.id}`;
	return `- **${item.filename}** (${facts}): ${item.shows} — ${describePostingFooting(item)}`;
}

/** The brand's library, latest added first, each item with whether it may be posted. */
export function describeLibrary(organisation: Organisation, library: KeptLibrary): string {
	const { items, keptCount } = library;
	if (keptCount === 0) return `${organisation.name}’s brand keeps no photos or videos yet. ${addedOnTheSite}`;
	const heading = `${organisation.name}’s brand keeps ${libraryCountOf(keptCount)}, the latest added first:`;
	const unlisted = keptCount - items.length;
	const cutNote = unlisted > 0 ? [`${unlisted} older ones are not listed; the latest ${LibraryLimits.mostItemsListed} are.`] : [];
	const howToRead = `Read one, with a link to look at it, by ${readLibraryItemAction} and its item id. Post only what may be posted.`;
	return [heading, ...items.map(itemLine), ...cutNote, howToRead].join('\n');
}

/** One item's details, who added it, and a short-lived link to look at it. */
export function describeLibraryItem(item: LibraryItem, addedByName: string, link: string): string {
	return [
		`**${item.filename}**, a ${kindOf(item)} (${item.mimeType}, ${describeByteCount(item.byteCount)}), item id ${item.id}.`,
		`What it shows: ${item.shows}`,
		`Taken: ${formatBritishDate(item.takenOn)}. Added by ${addedByName} on ${formatBritishDateTime(item.recordedAt)}.`,
		`Posting: ${describePostingFooting(item)}.`,
		`Look at it within ${fetchLinkLifetimeMinutes} minutes at:`,
		link,
		'The link is for you to look at the file now, not to pass on: call again for a fresh one.'
	].join('\n');
}

export const noSuchLibraryItem =
	'This brand’s library keeps no photo or video by that itemId. Find its id with list_brand_library; an item is kept once its file has arrived.';
