const saysAsThePerson =
	'You write as the person you act for, and the room shows it as said by them through their Claude. Everyone on ' +
	'the organisation who can use Chat sees every room; there are no private rooms, and nothing said is ever edited ' +
	'or deleted. Nothing here sends an email or a message outside Your Business Today.';

const onTheirYes = 'Do it only on the person’s yes in this chat, after telling them what will change.';

/** What a Claude is told before it runs each action that writes in an organisation's chat. */
export const chatWritingGuidance = {
	post:
		'Say only what the person asked you to say or has agreed to, in the room the matter belongs to. When a talk ' +
		'has drifted into the wrong room, offer to move it with move_chat_messages rather than answering it there. ' +
		'Posting moves your place in the room to now, as posting on the site does. ' +
		saysAsThePerson,
	open:
		'Opens a room, or a subroom under a room that sits under nothing, as New does on the site. Check ' +
		'list_chat_rooms first: a room that already covers the matter is where it goes. ' +
		saysAsThePerson,
	update:
		'Renames a room, says again what it is for, puts it under another room, or archives it, as Edit and Archive ' +
		'do on the site. Each field left out keeps what the room has. Archiving is a call of its own; the General ' +
		'room and a room with open subrooms are never archived, and an archived room is never brought back. ' +
		onTheirYes +
		' ' +
		saysAsThePerson,
	move:
		'Moves the messages chosen from one room to another, all of them or none, as Move to room does on the site: ' +
		'the room they leave keeps a line saying where they went. Read the room first with read_chat_room for the ' +
		'messages’ ids. Never move another person’s messages without the person’s yes in this chat. ' +
		saysAsThePerson,
	catchUp:
		'Saves a catch-up of a room for someone who has been away. First read what is unread with read_chat_unread, or ' +
		'the room with read_chat_room; each reading shows the room’s latest catch-up, so write a new one only when ' +
		'messages have come since it. Write it yourself, in plain sentences that name people: what was decided, what ' +
		'is waiting on whom, what changed. No padding, no greeting. Give coversUpTo as the reading’s last line gives ' +
		'it, the moment of the last message you covered. The catch-up is for everyone in the room, never private to ' +
		'one person, and it never replaces reading: when the person asks for detail, read them the messages. Saving ' +
		'it marks nothing read and tells no one. ' +
		saysAsThePerson,
	markRead:
		'Moves your place in the room to now and reads your notification for it, as opening the room on the site ' +
		'does. Mark a room read only after the person has been told what was new in it, so nothing new is hidden ' +
		'from them.'
} as const;
