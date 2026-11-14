import { isMusic, mayBePosted } from '../library/libraryItem';
import { problemWithChoosingItem, type ItemStanding } from '../library/choosableItem';
import type { StoryboardShot } from './contentPiece';

/** What a draft names from the library: the clip of each shot, and the piece's music. */
export type DraftItems = { storyboard: StoryboardShot[]; musicItemId?: string | null };

const firstShotNumber = 1;
const notInLibrary = 'is not in this brand’s library; find its id with list_brand_library';

/** Every library item a draft names, once each. */
export function libraryIdsOf(draft: DraftItems): string[] {
	const clipIds = draft.storyboard.map((shot) => shot.clipItemId);
	const named = [...clipIds, draft.musicItemId ?? null].filter((itemId): itemId is string => typeof itemId === 'string');
	return [...new Set(named)];
}

/** Why the draft cannot show what it names, or null: each clip a photo or video that may go out, the music music that may. */
export function problemWithDraftItems(draft: DraftItems, items: Map<string, ItemStanding>): string | null {
	const shotProblems = draft.storyboard.map((shot, index) => problemWithClip(shot, items, `Shot ${index + firstShotNumber}`));
	const shotProblem = shotProblems.find((problem) => problem !== null);
	if (shotProblem !== undefined) return shotProblem;
	const { musicItemId } = draft;
	if (musicItemId === undefined || musicItemId === null) return null;
	return problemWithMusic(items.get(musicItemId));
}

function problemWithClip(shot: StoryboardShot, items: Map<string, ItemStanding>, shotName: string): string | null {
	if (shot.clipItemId === null) return null;
	const item = items.get(shot.clipItemId);
	if (item === undefined) return `${shotName}: its clip ${notInLibrary}`;
	if (isMusic(item)) return `${shotName}: ${item.filename} is music, and a shot shows a photo or a video`;
	const problem = problemWithChoosingItem(item);
	return problem === null ? null : `${shotName}: ${problem}`;
}

function problemWithMusic(item: ItemStanding | undefined): string | null {
	if (item === undefined) return `the music ${notInLibrary}`;
	if (!isMusic(item)) return `${item.filename} is not music: give a piece of music from the library`;
	if (item.recordedAt === null) return `${item.filename} has not arrived in the library yet`;
	if (!mayBePosted(item)) return `${item.filename} is marked not to be posted, so it cannot be a piece’s music`;
	return null;
}
