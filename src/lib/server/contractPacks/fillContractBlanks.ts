import { blankPattern, isBlankLabel } from '$lib/data/contractBlanks';

/** The labels of a pack's blanks, each with the value it is filled with. */
export type BlankValues = Record<string, string>;

/** The document with every blank that has a value filled in; a blank with none stays in its brackets, to be seen. */
export function fillContractBlanks(markdown: string, values: BlankValues): string {
	return markdown.replace(blankPattern, (blank, label: string) => valueOf(values, label) ?? blank);
}

function valueOf(values: BlankValues, label: string): string | undefined {
	if (!isBlankLabel(label)) return undefined;
	const value = values[label]?.trim();
	if (value === undefined || value === '') return undefined;
	return value;
}
