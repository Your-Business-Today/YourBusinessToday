/** A value that fits its column, or the sentence that refuses it by name. */
export type FieldCheck<Value> = { value: Value } | { refusal: string };

/** Whether the value is a whole number from the lowest up to the highest. */
export function isWholeNumberWithin(value: unknown, lowest: number, highest: number): value is number {
	if (typeof value !== 'number' || !Number.isInteger(value)) return false;
	return value >= lowest && value <= highest;
}

/** Text that may be left out, read as blank, without the space around it; null when what was sent is not text. */
export function textLeftOutAsBlank(value: unknown): string | null {
	if (value === undefined) return '';
	if (typeof value !== 'string') return null;
	return value.trim();
}

/** Words that must be given, trimmed, of at most the longest length the column holds. */
export function checkRequiredWords(value: unknown, longest: number, refusal: string): FieldCheck<string> {
	const words = typeof value === 'string' ? value.trim() : '';
	const isFitting = words !== '' && words.length <= longest;
	if (!isFitting) return { refusal };
	return { value: words };
}

/** Words that may be left out, read as none, of at most the longest length the column holds. */
export function checkOptionalWords(value: unknown, longest: number, refusal: string): FieldCheck<string> {
	if (value === undefined) return { value: '' };
	if (typeof value !== 'string' || value.length > longest) return { refusal };
	return { value: value.trim() };
}

/** The fields named, each checked by its own check, or the refusal of the first that does not fit. */
export function checkNamedFields<Field extends string>(
	input: Record<string, unknown>,
	fields: Field[],
	checks: Record<Field, (value: unknown) => FieldCheck<unknown>>
): Record<string, unknown> | string {
	const checked: Record<string, unknown> = {};
	for (const field of fields) {
		const check = checks[field](input[field]);
		if ('refusal' in check) return check.refusal;
		checked[field] = check.value;
	}
	return checked;
}
