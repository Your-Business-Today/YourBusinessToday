const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(candidate: string): boolean {
	return uuidPattern.test(candidate);
}

/** Why the value cannot be stored in, or looked up by, a uuid column, or null when it is a uuid. */
export function validateRecordId(fieldName: string, candidate: string): string | null {
	if (isUuid(candidate)) return null;
	return `The ${fieldName} must be an id such as 00000000-0000-0000-0000-000000000000, as a list gives it.`;
}
