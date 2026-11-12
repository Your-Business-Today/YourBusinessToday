const onlyAsTold =
	'These are your own director’s controls over you, the same ones the meeting page gives them: record one only ' +
	'when your director tells you in this chat, in their words, and never for another director or on your own judgement.';

/** What a Claude is told before it runs each seat control of the Boardroom's room for its own director. */
export const boardroomSeatControlGuidance = {
	steer:
		'Keep the note your director gives you for the meeting, as they put it: you read it before your next turn in ' +
		'the room, and follow it. ' + onlyAsTold,
	setting:
		'Pause yourself when your director says so, and say nothing in the room until they let you go on; turn ask ' +
		'me first on when they want to see each piece before it is said, and each piece you speak is then held for ' +
		'their yes. ' + onlyAsTold,
	answerHeld:
		'A piece you held for your director is said in the room on their yes, in your turn, or kept unsaid on their ' +
		'no. Read it back to them first, as read_board_item shows it, and record only the answer they give. ' + onlyAsTold
} as const;
