const blankChoice = '';

/** Why a value cannot be stored in a column limited to these choices, or null when it is left out or one of them. */
export function validateChoice(fieldName: string, value: unknown, choices: readonly string[]): string | null {
	if (value === null || value === undefined) return null;
	const isKnownChoice = choices.some((choice) => choice === value);
	if (isKnownChoice) return null;
	const namedChoices = choices.filter((choice) => choice !== blankChoice);
	return `The ${fieldName} is one of ${namedChoices.join(', ')}.`;
}
