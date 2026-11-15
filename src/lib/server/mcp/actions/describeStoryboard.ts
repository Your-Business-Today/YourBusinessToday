import type { NamedItem } from '$lib/server/brandLibrary/findItemStandings';
import type { StoryboardShot } from '$lib/brand/content/contentPiece';

/** The library items a piece names, by id, as read_content describes them. */
export type PieceLibrary = Map<string, NamedItem>;

const firstShotNumber = 1;

/** The shots in order, each with its clip and its words on screen, so another piece can be made from them. */
export function storyboardSection(storyboard: StoryboardShot[], library: PieceLibrary): string | null {
	if (storyboard.length === 0) return null;
	const shotLines = storyboard.map((shot, index) => `${index + firstShotNumber}. ${shotLine(shot, library)}`);
	return `Storyboard:\n${shotLines.join('\n')}`;
}

/** The piece's music, when it has some. */
export function musicSection(musicItemId: string | null, library: PieceLibrary): string | null {
	if (musicItemId === null) return null;
	return `Music: ${itemNamed(musicItemId, library)}`;
}

function shotLine(shot: StoryboardShot, library: PieceLibrary): string {
	const clip = shot.clipItemId === null ? '' : ` — clip: ${itemNamed(shot.clipItemId, library)}`;
	return `(${shot.seconds}s) ${shot.description}${clip}${wordsOnScreen(shot)}`;
}

function wordsOnScreen(shot: StoryboardShot): string {
	const labelled: [string, string][] = [
		['overline', shot.overline],
		['headline', shot.onScreenText],
		['underline', shot.underline]
	];
	const given = labelled.filter(([, line]) => line !== '').map(([label, line]) => `${label} “${line}”`);
	if (given.length === 0) return '';
	return ` — on screen at the ${shot.wordsAt}: ${given.join(', ')}`;
}

function itemNamed(itemId: string, library: PieceLibrary): string {
	const item = library.get(itemId);
	if (item === undefined) return `item ${itemId}, no longer in the library`;
	return `${item.filename} (${item.shows}, item id ${itemId})`;
}
