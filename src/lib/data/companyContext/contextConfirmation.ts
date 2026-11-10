import { formatBritishDate } from '$lib/data/britishDate';
import type { ReviewTally } from './reviewTally';

/** The version a client confirmed as right, and when: a later revision is a new version, confirmed again. */
export type ContextConfirmation = { versionNumber: number; confirmedAt: string };

/** What happens once a client confirms, said the same on the map, in the connector and in the email to staff. */
export const whatHappensNext =
	'YBT raises the services your business needs from this context as goals on your project, where you can ' +
	'follow them.';

/** Confirm opens once no part is marked not right; parts not checked yet do not hold it back. */
export function canConfirm(tally: ReviewTally): boolean {
	return tally.partCount > 0 && tally.notRightCount === 0;
}

/** Why Confirm is not open yet, said to the client on the map. */
export function confirmationHeldBack(tally: ReviewTally): string {
	if (tally.partCount === 0) return 'There is nothing to confirm yet: your Claude has recorded no parts.';
	const parts = tally.notRightCount === 1 ? '1 part is' : `${tally.notRightCount} parts are`;
	return (
		`${parts} marked not right. Your Claude puts them right in its next version; once no part is marked not ` +
		'right, you can confirm it.'
	);
}

/** Said on the client's map once they have confirmed, and on the staff's copy of it. */
export function confirmedSentence({ versionNumber, confirmedAt }: ContextConfirmation, isClient: boolean): string {
	const day = formatBritishDate(confirmedAt);
	if (isClient) return `You confirmed version ${versionNumber} as right on ${day}: it is kept as your confirmed context.`;
	return `The client confirmed version ${versionNumber} as right on ${day}.`;
}

export const notConfirmedYet = 'The client has not confirmed this version yet.';

/** What staff do once a client confirms. */
export const staffNextStep =
	"Next, a staff member's Claude raises the services their business needs from it as goals on their project.";

/** What confirming does, said beside the button. */
export function confirmInvitation(versionNumber: number): string {
	return (
		`Once you are happy the parts are right, confirm it: version ${versionNumber} is kept as your confirmed ` +
		'context. If your Claude revises it later, the new version is yours to confirm again.'
	);
}
