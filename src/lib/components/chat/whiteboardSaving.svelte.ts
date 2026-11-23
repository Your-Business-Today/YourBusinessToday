import { actionResultTypes } from '$lib/client/actionResultTypes';
import { postAction } from '$lib/components/projects/uploadThroughSignedLink';
import { whiteboardPictureName, whiteboardPostWords } from '$lib/data/chat/chatWhiteboardWords';
import { boardPicture } from './whiteboardPicture';
import { answerOf, roomGrantAction, roomPostAction, sendChatFile } from './sendChatFile';
import type { BoardPalette } from './whiteboardRendering';
import type { ListedChatWhiteboard, WhiteboardItem } from '$lib/data/chat/chatWhiteboardRules';
import type { ActionResult } from '@sveltejs/kit';

const saveAction = '?/saveWhiteboard';
const couldNotBeDone = 'That did not go through. Check your connection and try again.';

/** Where the board is on the site and the room it belongs to, whose actions take the picture. */
export type WhiteboardPlaces = { boardPath: string; roomPath: string };

function refusalOf(result: ActionResult): string | null {
	if (result.type === actionResultTypes.success) return null;
	return String(answerOf(result).message ?? couldNotBeDone);
}

/**
 * Saving the board and posting it to its room as a picture: who saved it last and when, and the last save the board
 * was opened at, which each save carries so a board someone else saved meanwhile is never written over.
 */
export class WhiteboardSaver {
	openedAsSavedAt = $state('');
	lastSavedByName = $state('');
	isSaving = $state(false);
	refusal = $state<string | null>(null);
	notice = $state<string | null>(null);

	constructor(board: ListedChatWhiteboard) {
		this.openedAsSavedAt = board.updatedAt;
		this.lastSavedByName = board.lastSavedByName;
	}

	async save(title: string, items: WhiteboardItem[]): Promise<boolean> {
		const fields = { title, strokes: JSON.stringify(items), openedAsSavedAt: this.openedAsSavedAt };
		const result = await postAction(saveAction, fields).catch(() => null);
		this.refusal = result === null ? couldNotBeDone : refusalOf(result);
		if (result === null || this.refusal !== null) return false;
		const answer = answerOf(result);
		this.openedAsSavedAt = String(answer.updatedAt);
		this.lastSavedByName = String(answer.lastSavedByName);
		this.notice = 'Saved.';
		return true;
	}

	async run(work: () => Promise<void>): Promise<void> {
		if (this.isSaving) return;
		this.isSaving = true;
		this.notice = null;
		await work().finally(() => (this.isSaving = false));
	}

	async postToRoom(title: string, items: WhiteboardItem[], palette: BoardPalette, places: WhiteboardPlaces): Promise<void> {
		const isSaved = await this.save(title, items);
		if (!isSaved) return;
		const picture = await boardPicture(items, palette, whiteboardPictureName(title));
		const sent = typeof picture === 'string' ? picture : await sendChatFile(picture, `${places.roomPath}${roomGrantAction}`);
		if (typeof sent === 'string') {
			this.refusal = sent;
			return;
		}
		const message = { body: whiteboardPostWords(title, places.boardPath), files: JSON.stringify([sent]) };
		const posted = await postAction(`${places.roomPath}${roomPostAction}`, message).catch(() => null);
		this.refusal = posted === null ? couldNotBeDone : refusalOf(posted);
		if (this.refusal === null) this.notice = 'Saved, and posted to the room as a picture.';
	}
}
