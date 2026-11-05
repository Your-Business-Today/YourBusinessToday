/** Narrows who to chase to what the person asked for themselves; left out, it lists everything anyone owes. */
export const onlyWhatIAskedForField = {
	type: 'boolean',
	description:
		'True to list in who to chase only the asks you posted and the tasks you asked for — leave out to ' +
		'see everything everyone on your projects owes, tests and other people’s asks included'
};

export function isNarrowedToOwnAsks(input: Record<string, unknown>): boolean {
	return input.onlyWhatIAskedFor === true || input.onlyWhatIAskedFor === 'true';
}
