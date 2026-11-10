import { ukMeetingTime } from './ukMeetingTime';
import { nameOfSeat } from './boardroomMeeting';
import { stances, type BoardContribution } from './boardroomRoom';
import type { BoardroomDirector } from './boardroomDirector';

const wordsIndent = '   ';

/** The number a contribution has on its item, as read_board_item gives it, or null when it is not on it. */
export function numberOf(contributions: BoardContribution[], contributionId: string | null): number | null {
	const index = contributions.findIndex((contribution) => contribution.id === contributionId);
	return index === -1 ? null : index + 1;
}

function referenceTo(contributions: BoardContribution[], contributionId: string | null): string {
	const number = numberOf(contributions, contributionId);
	return number === null ? 'an earlier one' : String(number);
}

function stanceWords(contribution: BoardContribution, contributions: BoardContribution[]): string {
	if (contribution.stance === stances.proposes) return `proposes: "${contribution.wording}"`;
	if (contribution.onProposalId === null) return contribution.stance;
	return `${contribution.stance} the wording in ${referenceTo(contributions, contribution.onProposalId)}`;
}

function correctionWords(contribution: BoardContribution, contributions: BoardContribution[]): string {
	if (contribution.correctsId === null) return '';
	return ` (corrects ${referenceTo(contributions, contribution.correctsId)})`;
}

/** One contribution as every director's Claude reads it: who it speaks for, when, its stance, and its words. */
export function contributionLines(
	contribution: BoardContribution,
	contributions: BoardContribution[],
	directors: BoardroomDirector[]
): string[] {
	const number = numberOf(contributions, contribution.id);
	const speaker = `${nameOfSeat(directors, contribution.directorId)}’s Claude`;
	const when = ukMeetingTime(contribution.createdAt);
	const correction = correctionWords(contribution, contributions);
	const heading = `${number}. Round ${contribution.round}, ${speaker}, ${when}${correction}: ${stanceWords(contribution, contributions)}`;
	return [heading, `${wordsIndent}${contribution.words}`];
}

/** Everything said on an item so far, in order, numbered as speak_on_board_item takes the numbers. */
export function saidSoFarLines(contributions: BoardContribution[], directors: BoardroomDirector[]): string[] {
	if (contributions.length === 0) return ['Nothing has been said on this item yet.'];
	const said = contributions.flatMap((contribution) => contributionLines(contribution, contributions, directors));
	return ['Said so far, in order:', ...said];
}
