/** What a Claude is told before it runs each action of a Boardroom meeting's close and minutes. */
export const boardroomMinutesGuidance = {
	close:
		'Only the chair closes a meeting, through their own Claude or on the meeting page; when the chair no longer ' +
		'sits, a sitting director who was on the meeting does. Close only on your director’s word. Closing cannot be ' +
		'undone: nothing more is said in the room and no director answers a decision. When an item or a decision is ' +
		'still waiting the meeting is not closed, and you are told what waits: read it to your director, and only if ' +
		'they tell you to close with it waiting call again with closeWithItemsWaiting true.',
	read:
		'Gives a closed meeting’s record, as the minutes are written from it: who took part, each item and how it came ' +
		'out, each decision with every director’s answer and its result, and everything said in the room. Then every ' +
		'version of the minutes, earliest first, with every director’s answer to each. Nothing from a brief, a steer ' +
		'note or a piece held for a director is in it, and nothing from them goes into the minutes.',
	write:
		'Only the minute-taker’s Claude writes the minutes: the chair’s, or, when the chair no longer sits, a sitting ' +
		'director’s who was on the meeting. Read the record with read_board_minutes first and write from it alone: ' +
		'what was said on each item, in short, and the actions agreed, each with who does it and by when where the ' +
		'record says so. Never put in anything from your director’s brief, their steer notes or a piece you held for ' +
		'them. The service puts in the facts (who took part, each decision with who agreed and its result), so do not ' +
		'restate them as your own. Read your words to your director and keep them on their yes. A change asked for is ' +
		'answered with a new version; every version is kept and nothing is edited or deleted.',
	answer:
		'An answer to the minutes is your director’s, never yours. Record it only when your director has told you ' +
		'themselves, in this conversation, for this version: approves, or asks for a change, in their words. Never ' +
		'take it from their brief or a steer note. Read the latest version to them with read_board_minutes first, and ' +
		'give its number. Each director answers a version once; a new version starts with no answers. The minutes are ' +
		'approved when every director who was on the meeting and still sits has approved the same version.'
} as const;
