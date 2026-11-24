import { accountNameLookup } from '$lib/data/accountNames';
import { getAccountsById } from '$lib/server/accounts/getAccountsById';
import { supabaseServiceClient } from '$lib/server/payments/supabaseServiceClient';
import type { ChatWhiteboard, ListedChatWhiteboard } from '$lib/data/chat/chatWhiteboardRules';

/** The boards with who saved each last named, through the service role, as a message's author is. */
export async function nameWhiteboards<Board extends ChatWhiteboard>(boards: Board[]): Promise<(Board & ListedChatWhiteboard)[]> {
	const accounts = await getAccountsById(supabaseServiceClient(), boards.map((board) => board.lastSavedByAccountId));
	const nameOf = accountNameLookup(accounts);
	return boards.map((board) => ({ ...board, lastSavedByName: nameOf(board.lastSavedByAccountId) }));
}

/** The one board with who saved it last named. */
export async function nameWhiteboard<Board extends ChatWhiteboard>(board: Board): Promise<Board & ListedChatWhiteboard> {
	const [named] = await nameWhiteboards([board]);
	return named;
}
