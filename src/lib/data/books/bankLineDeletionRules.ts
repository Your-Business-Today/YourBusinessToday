import { isUuid } from '$lib/data/isUuid';

/** How many statement lines one call takes out at a time. */
export const bankLineDeletionLimits = { fewestLines: 1, mostLines: 500 } as const;

const firstItem = 1;

/** The ids as given, or the first reason they cannot be read, naming the id: never one dropped or repeated quietly. */
export function validateBankLineIds(given: unknown): string[] | string {
	const countRefusal = idCountRefusal(given);
	if (countRefusal !== null) return countRefusal;
	const seen = new Set<string>();
	for (const [index, id] of (given as unknown[]).entries()) {
		const itemNumber = index + firstItem;
		const isId = typeof id === 'string' && isUuid(id);
		if (!isId) return `Item ${itemNumber} of bankLineIds, ${JSON.stringify(id)}, is not a statement line id as list_bank_lines gives it.`;
		if (seen.has(id)) return `Item ${itemNumber} of bankLineIds, ${id}, is given twice; give each line once.`;
		seen.add(id);
	}
	return [...seen];
}

function idCountRefusal(given: unknown): string | null {
	const { fewestLines, mostLines } = bankLineDeletionLimits;
	const describedLimit = `bankLineIds is a list of ${fewestLines} to ${mostLines} statement line ids, as list_bank_lines gives them`;
	if (!Array.isArray(given)) return `${describedLimit}.`;
	const isWithinLimit = given.length >= fewestLines && given.length <= mostLines;
	if (isWithinLimit) return null;
	return `${describedLimit}; ${given.length} were given.`;
}
