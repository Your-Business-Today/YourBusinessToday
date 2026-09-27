import type { ConversationMessage } from './messageRecord';

/** Everyone a thread names: who wrote each message and who each one waits on. */
export function conversationAccountIds(messages: ConversationMessage[]): string[] {
	return messages.flatMap((message) => [message.authorAccountId, ...awaitedAccountIds(message)]);
}

function awaitedAccountIds(message: ConversationMessage): string[] {
	const awaiting = message.awaiting;
	if (awaiting === null) return [];
	return [awaiting.accountId];
}
