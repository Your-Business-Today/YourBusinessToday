/** What a Claude is told before it runs each Boardroom brief action. */
export const boardroomBriefGuidance = {
	brief:
		'Read the meeting first with read_board_meeting, and name the item by its number now. Write the brief in the ' +
		'director’s own words, as they say it: their position, what you may share in the room, what you must not share, ' +
		'and what must come back to them before it goes further. Read it back to them and save it on their yes. A change ' +
		'is a new version; the earlier ones are kept. The brief is theirs alone: no other director, no administrator and ' +
		'no other director’s Claude reads it, and the others see only that a brief is in. Brief only for the director ' +
		'you speak for, and until the meeting closes.',
	read:
		'Gives back your director’s own brief on one item, the latest version unless you ask for another, with every ' +
		'version they have written. Nobody else’s brief is ever read here. Speak for your director in the room from the ' +
		'latest version, keep back what it says to keep back, and bring back to them what it says must come back.'
} as const;
