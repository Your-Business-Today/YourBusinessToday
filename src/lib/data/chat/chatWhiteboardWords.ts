import { formatBritishDateTime, formatUkTime } from '$lib/data/britishDate';
import type { ListedChatWhiteboard } from './chatWhiteboardRules';

export const whiteboardsTitle = 'Whiteboards';

const pictureExtension = '.png';
const markdownSignificant = /[\\[\]]/g;

/** Who saved the board last and when, in the room's own date format. */
export function lastSavedSentence(board: ListedChatWhiteboard): string {
	return `Last saved by ${board.lastSavedByName} on ${formatBritishDateTime(board.updatedAt)}.`;
}

/** Why a save was refused because someone else saved the board after the saver opened it; nothing of theirs is lost. */
export function savedSinceRefusal(saverName: string, savedAt: string): string {
	return `${saverName} saved this board at ${formatUkTime(savedAt)}. Open it again to carry on from theirs.`;
}

/** The words of the message a board is posted to its room with: its title, linked back to the board. */
export function whiteboardPostWords(title: string, boardPath: string): string {
	const linkLabel = title.replace(markdownSignificant, (character) => `\\${character}`);
	return `Whiteboard: [${linkLabel}](${boardPath})`;
}

/** What the picture of a board is called on the message that carries it. */
export function whiteboardPictureName(title: string): string {
	return `Whiteboard ${title}${pictureExtension}`;
}
