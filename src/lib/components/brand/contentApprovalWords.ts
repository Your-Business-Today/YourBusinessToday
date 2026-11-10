/** The words the month's plan uses for the posts waiting for the client's approval. */
export const approvalPanelTitle = 'Waiting for your approval';

export const approvalExplained =
	'Every post of the month waiting for approval, with the words each channel goes out with and its picture. Approve ' +
	'them all at once, or open a channel to ask for a change to that post alone. A post still waiting on its picture is ' +
	'approved with its picture described; only a photo or video that may be posted is chosen for it later.';

export const noCaptionYet = 'No caption yet';

export const askForChange = 'Ask for a change';

export function approveAllLabelOf(pieceCount: number): string {
	return `Approve all ${pieceCount}`;
}
