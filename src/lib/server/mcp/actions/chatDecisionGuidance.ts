const notTheBoardroom =
	'A chat decision is not a Boardroom decision: it is a question raised from a message in a room, kept in that ' +
	'room, and it never goes on a Boardroom agenda or into its minutes. Nothing here sends an email or a message ' +
	'outside Your Business Today, and no one is told.';

const raisesAsThePerson = 'The room shows it as raised by the person you act for through their Claude.';

/** What a Claude is told before it runs each action on the decisions raised in an organisation's chat. */
export const chatDecisionGuidance = {
	list:
		'Lists the decisions raised in the organisation’s chat, or in one room of it, open first, each with its id, ' +
		'wording, room, the words of the message it came from, who raised it and when, who it waits on and, once ' +
		'closed, its outcome, who closed it and when. Those open on the person you act for are marked "waiting on ' +
		'you". When the person asks what is outstanding for them in chat, list with status open and bring them the ' +
		'ones waiting on them first. Listing writes nothing and marks nothing read. ' +
		notTheBoardroom,
	raise:
		'Raises a decision from one message of a room, as Raise a decision does on the site. Raise one only when the ' +
		'person asks for one, with the wording in their words, and only with the person it waits on named by them: ' +
		'never guess who it waits on, and ask when they have not said. Read the room first with read_chat_room for ' +
		'the message’s id. ' +
		raisesAsThePerson +
		' ' +
		notTheBoardroom,
	close:
		'Closes an open decision with its outcome, as Close does on the site. Close one only on the person’s word, ' +
		'with the outcome as they gave it. A closed decision is never reopened or changed, so first read the ' +
		'decision and the outcome back to the person and close it on their yes. ' +
		notTheBoardroom
} as const;
