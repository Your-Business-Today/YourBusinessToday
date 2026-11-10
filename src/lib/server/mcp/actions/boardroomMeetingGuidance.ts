/** What a Claude is told before it runs each Boardroom meeting action. */
export const boardroomMeetingGuidance = {
	call:
		'Only a sitting director of the organisation calls its board meetings, as the model articles allow any ' +
		'director to (article 9); a company with its own articles follows those. Read the agenda back to the ' +
		'director and call it on their yes. Each item says what is to be decided or noted; put the items in the ' +
		'order the board takes them. Every director of the organisation is on the meeting and sees it at once, ' +
		'and each gets a to-do on their own list to brief their Claude. A Claude never calls a meeting the ' +
		'director did not ask for.',
	list:
		'Lists every meeting of the board: called (still to come, its agenda open to change), open (its time has ' +
		'come) and closed. Only the organisation’s sitting directors read them.',
	read:
		'The agenda’s numbers are the ones change_board_agenda takes, so read the meeting again before changing ' +
		'it. Each item’s papers are listed beneath it by paper id; read one with read_board_paper. Beneath them, whose briefs ' +
		'are in and whose are not: your director’s own brief is read with read_board_brief, and nobody else’s is ever shown. ' +
		'Items withdrawn before the ' +
		'meeting are listed beneath the agenda; nothing is ever deleted.',
	change:
		'Read the meeting first with read_board_meeting, and number items as it does now. Until the meeting opens ' +
		'its agenda changes freely: add items after the last, reword one, or withdraw one, which keeps it on ' +
		'record as withdrawn. Once it has opened an item is only added, taken as any other business, and nothing ' +
		'is reworded or withdrawn; once it has closed its agenda is kept as it stood. Change it only on the ' +
		'director’s word.'
} as const;
