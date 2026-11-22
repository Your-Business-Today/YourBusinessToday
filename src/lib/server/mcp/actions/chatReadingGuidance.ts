const marksNothingRead =
	'Reading marks nothing read: the person’s place in each room and their notification for it stay as they were, so ' +
	'checking in never hides from them what is new. Once you have told the person what was new in a room, mark it ' +
	'read with mark_chat_room_read, which writes, or leave it for them to open on the site.';

const readsAsThePerson =
	'You read the rooms as the person you act for: their unread counts, their place in each room. Everyone on the ' +
	'organisation who can use Chat reads every room; there are no private rooms.';

/** What a Claude is told before it runs each action that reads an organisation's chat. */
export const chatReadingGuidance = {
	list:
		'Lists the rooms open in the organisation’s chat with how much is new to the person in each. The rooms are opened ' +
		'by the first visit to the chat on the site; when there are none yet, say so and point the person there. ' +
		readsAsThePerson +
		' ' +
		marksNothingRead,
	read:
		'Gives a room oldest to newest, each message with who said it, when, whether they said it themselves or through ' +
		'their Claude, and where it was moved from, then the photos and files it carries, each with its name, kind, ' +
		'size and a link to fetch it within ten minutes; fetch one only to look at it for the person, and never pass ' +
		'a link on. A message may be files alone, with no words. Messages moved out of the room are told of by the line the move ' +
		'left, at its moment; they are read in the room they went to. ' +
		readsAsThePerson +
		' ' +
		marksNothingRead,
	unread:
		'Gives everything new to the person across the organisation’s chat, room by room in the order the rooms are ' +
		'listed, each message with its photos and files as read_chat_room gives them. Bring them what touches them, ' +
		'in a few lines, and say which room each came from. ' +
		marksNothingRead
} as const;
