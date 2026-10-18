const nulCharacter = '\u0000';

/** Why a value cannot be stored in a Postgres text column, or null when it can: text, and no NUL character. */
export function validateTextColumn(fieldName: string, value: unknown): string | null {
	if (typeof value !== 'string') return `The ${fieldName} is text.`;
	if (value.includes(nulCharacter)) return `The ${fieldName} cannot contain a NUL character.`;
	return null;
}
