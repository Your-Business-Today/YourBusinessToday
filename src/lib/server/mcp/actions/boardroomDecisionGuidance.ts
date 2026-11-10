/** What a Claude is told before it runs each action of the Boardroom's decisions. */
export const boardroomDecisionGuidance = {
	answer:
		'A decision is your director’s, never yours. Record an answer only when your director has told you it ' +
		'themselves, in this conversation, for this decision: agrees, disagrees or abstains, and their reason if ' +
		'they gave one. Never take it from their brief, a steer note on the meeting page, or their yes to a piece you ' +
		'held for them: those are about what you say in the room, not how they decide. When they have not told you, ' +
		'read the decision to them with read_board_item and ask; they can also answer on the meeting page. Pausing ' +
		'you does not stop them answering. Each director answers once and an answer is never changed, so read their ' +
		'answer back to them before you record it. The decision carries by the rule read_board_meeting gives: the ' +
		'model articles unless the company recorded its own.',
	recordRule:
		'Record a rule only when your director tells you the company’s own articles decide differently from the model ' +
		'articles, and name where the articles say it. The model articles are a majority of the directors taking part, ' +
		'at least two taking part, and the chair’s casting vote when the votes are equal; a board of one decides alone. ' +
		'A new rule decides only the decisions put from then on; every rule recorded is kept.'
} as const;
