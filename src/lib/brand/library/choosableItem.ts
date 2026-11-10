import { mayBePosted, type PostingFooting } from './libraryItem';

/** A library item as it stands when someone chooses it for a post: whether it may be posted, and whether its file arrived. */
export type ItemStanding = { filename: string; posting: PostingFooting; recordedAt: string | null };

/** Why the item cannot go in a post, or null when it can: its file has arrived and nobody said it may not be posted. */
export function problemWithChoosingItem(item: ItemStanding): string | null {
	if (item.recordedAt === null) return `${item.filename} has not arrived in the library yet, so it cannot go in a post`;
	if (!mayBePosted(item)) return `${item.filename} is marked not to be posted, so it cannot go in a post`;
	return null;
}
