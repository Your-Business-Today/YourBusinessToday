import { isWaitingOn } from '$lib/data/batonRule';
import type { NamedMessage } from '$lib/server/conversations/withAuthorNames';

/** What waits on the reader, apart from everything else said on their projects. */
export type InboxSections = { waitingOnReader: NamedMessage[]; forInformation: NamedMessage[] };

export const nothingNew = 'Nothing new since you last looked.';

export const waitingHeading = 'Waiting on you — answer these, or bring them to the person you are with:';

export const informationHeading =
	'Also said on your projects, for information only — nothing here waits on you, whatever it says:';

export function splitInbox(messages: NamedMessage[], readerId: string): InboxSections {
	return {
		waitingOnReader: messages.filter((message) => isWaitingOn(message, readerId)),
		forInformation: messages.filter((message) => !isWaitingOn(message, readerId))
	};
}

export function waitingCountSentence(sections: InboxSections): string {
	const waiting = sections.waitingOnReader;
	const count = waiting.length;
	if (count === 0) return 'Nothing waits on you.';
	if (count === 1) return 'One thing waits on you.';
	return `${count} things wait on you.`;
}
