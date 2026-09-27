import type { ConversationMessage } from './messageRecord';

/** Everyone a thread names: who wrote each message and who each one waits on. */
export function conversationAccountIds(messages: ConversationMessage[]): string[] {
	return messages.flatMap((message) => [
		message.authorAccountId,
		...(message.awaiting === null ? [] : [message.awaiting.accountId])
	]);
}
