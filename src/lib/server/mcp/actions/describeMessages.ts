import { accountNameLookup } from '$lib/data/accountNames';
import { formatBritishDate } from '$lib/data/britishDate';
import { handOffLabel } from '$lib/data/turnLabels';
import { latestTurn, postedViaChannels } from '$lib/data/conversationTurn';
import { withAuthorNames, type NamedMessage } from '$lib/server/conversations/withAuthorNames';
import type { Account } from '$lib/server/accounts/accountRecord';
import type { ConversationMessage } from '$lib/server/conversations/messageRecord';
import { awaitingKinds } from '$lib/data/conversationTurn';

const nobodyViewing = '';

export function threadLines(messages: ConversationMessage[], accounts: Account[]): string[] {
	if (messages.length === 0) return ['Conversation: nothing said yet.'];
	const lines = withAuthorNames(messages, accounts).map((message) => messageLine(message, nobodyViewing));
	return ['Conversation:', ...lines, batonLine(messages, accounts)];
}

export function messageLine(message: NamedMessage, viewerId: string): string {
	const audience = message.isInternal ? ' [internal]' : '';
	const via = message.postedVia === postedViaChannels.claude ? ' (by their Claude)' : '';
	const said = `${message.authorName}${via}${audience}, ${formatBritishDate(message.createdAt)}`;
	return `- ${said}: ${message.body}${batonNote(message, viewerId)}`;
}

function batonNote(message: NamedMessage, viewerId: string): string {
	const awaiting = message.awaiting;
	if (awaiting === null || awaiting.accountId !== viewerId) return '';
	if (awaiting.kind === awaitingKinds.claude) return ' [waiting on you, the Claude, to answer]';
	return ' [waiting on the person you are with]';
}

function batonLine(messages: ConversationMessage[], accounts: Account[]): string {
	const turn = latestTurn(messages);
	if (turn === null || turn.awaiting === null) return 'Baton: nobody is waiting on anything.';
	const holder = handOffLabel(turn.awaiting, accountNameLookup(accounts), nobodyViewing);
	const pickedUp = turn.pickedUpAt === null ? 'not picked up yet' : 'picked up';
	return `Baton: waiting on ${holder} since ${formatBritishDate(turn.since)}, ${pickedUp}.`;
}
