import { accountNameLookup } from '$lib/data/accountNames';
import type { Account } from '$lib/server/accounts/accountRecord';
import type { ConversationMessage } from './messageRecord';

/** Anything said by an account: a message on a conversation, or one in a chat room. */
type Authored = { authorAccountId: string };

export type Named<Message extends Authored> = Message & { authorName: string };

export type NamedMessage = Named<ConversationMessage>;

export function withAuthorNames<Message extends Authored>(messages: Message[], accounts: Account[]): Named<Message>[] {
	const nameOf = accountNameLookup(accounts);
	return messages.map((message) => ({ ...message, authorName: nameOf(message.authorAccountId) }));
}
