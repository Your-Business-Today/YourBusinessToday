import { contributionStances } from './boardroomRoom';

/** The limits of boardroom_rooms and boardroom_contributions (migration 0185), stated once for the service. */
export const boardRoomLimits = {
	usualRounds: 3,
	mostRounds: 10,
	longestWords: 4000,
	longestWording: 2000
} as const;

const { mostRounds, longestWords, longestWording } = boardRoomLimits;

export const boardRoomRefusals = {
	roundsNotANumber:
		`roundsLimit is how many rounds each item is talked through at most: a whole number from 1 to ${mostRounds}, ` +
		`or left out for ${boardRoomLimits.usualRounds}.`,
	itemNumberNotANumber: 'itemNumber is the number of an agenda item as read_board_meeting gives it now: a whole number from 1.',
	stanceUnknown: `stance is one of ${contributionStances.join(', ')}.`,
	wordsMissing: `words is what your Claude says for its director: required, at most ${longestWords} characters.`,
	wordingMissing: `wording is the wording proposed for the directors: required when the stance is proposes, at most ${longestWording} characters.`,
	wordingWithoutProposal: 'wording is given only with the stance proposes.',
	proposalNumberMissing: 'supports names the wording it supports: proposalNumber, the number of that contribution as read_board_item gives it.',
	proposalNumberNotANumber: 'proposalNumber is the number of a contribution that proposes a wording, as read_board_item gives it.',
	correctsNotANumber: 'corrects is the number of your own earlier contribution on this item, as read_board_item gives it.',
	meetingNotYetTime: 'The room opens from the time the meeting was called for, and not before.',
	meetingHasClosed: 'The meeting has closed; its room is kept as it stood.',
	callerNotOnMeeting: 'Only a sitting director on this meeting has their Claude in its room.',
	roomNotOpen: 'The room has not been opened yet. Open it with open_board_room once the meeting’s time has come.',
	itemNotOnAgenda: 'That number is not an item on the agenda as read_board_meeting gives it now.',
	itemHasComeOut: 'This item has come out of the room; nothing more is said on it. Read how it came out with read_board_item.',
	nothingProposed: 'Nothing is proposed on this item yet, so there is no wording to support. Propose one, object or comment.',
	notTheWordingOnTheTable: 'That is not the wording on the table now. Read the item again with read_board_item and speak on the latest proposal.',
	notYourContribution: 'corrects names one of your own earlier contributions on this item; nobody corrects another director’s Claude.',
	alreadySpokenThisRound: 'Your Claude has spoken in this round. It speaks again once every director on the meeting has had their turn.'
} as const;
