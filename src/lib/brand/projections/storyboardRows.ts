import type { StoryboardShot } from '../content/contentPiece';

/** A library item as the piece's page names it. */
export type PageLibrary = Map<string, { filename: string }>;

/** One shot as the Storyboard table shows it: its clip, its three lines and where they sit. */
export type ShotRow = {
	number: number;
	seconds: number;
	description: string;
	clip: string;
	overline: string;
	onScreenText: string;
	underline: string;
	wordsAt: string;
};

const firstShotNumber = 1;
const missingItem = 'No longer in the library';

/** The shots numbered from one, each clip named by its file. */
export function shotRowsOf(storyboard: StoryboardShot[], library: PageLibrary): ShotRow[] {
	return storyboard.map((shot, index) => {
		const { seconds, description, overline, onScreenText, underline, wordsAt } = shot;
		const clip = shot.clipItemId === null ? '' : filenameIn(library, shot.clipItemId);
		return { number: index + firstShotNumber, seconds, description, clip, overline, onScreenText, underline, wordsAt };
	});
}

/** The piece's music named by its file, or null when it has none. */
export function musicNameOf(musicItemId: string | null, library: PageLibrary): string | null {
	if (musicItemId === null) return null;
	return filenameIn(library, musicItemId);
}

function filenameIn(library: PageLibrary, itemId: string): string {
	const item = library.get(itemId);
	return item?.filename ?? missingItem;
}
