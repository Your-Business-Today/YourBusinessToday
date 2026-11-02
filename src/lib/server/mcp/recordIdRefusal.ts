import { validateRecordId } from '$lib/data/isUuid';

const recordIdFieldName = /Ids?$/;
const idFieldsThatNameNoRecord = new Set(['modelId']);

const wholeIdRule =
	'Nothing was done. An id is never shortened: pass all 36 characters of it, exactly as the list or read action gave it.';

/**
 * The refusal for an input that names a record by anything but its whole id — the first eight
 * characters of one, or an empty value where one is required — so it is refused by field at the
 * gate rather than reaching the database as a value its id column cannot hold.
 */
export function recordIdRefusal(
	actionName: string,
	inputSchema: Record<string, unknown>,
	input: Record<string, unknown>
): string | null {
	const requiredNames = (inputSchema.required ?? []) as string[];
	const reasons = Object.entries(input)
		.filter(([name]) => namesARecord(name))
		.flatMap(([name, value]) => reasonsAgainst(name, value, requiredNames.includes(name)));
	if (reasons.length === 0) return null;
	return [
		`${actionName} needs whole ids.`,
		...reasons.map((reason) => `- ${reason}`),
		wholeIdRule
	].join('\n');
}

function namesARecord(fieldName: string): boolean {
	if (idFieldsThatNameNoRecord.has(fieldName)) return false;
	return recordIdFieldName.test(fieldName);
}

function reasonsAgainst(fieldName: string, value: unknown, isRequired: boolean): string[] {
	if (value === null || value === undefined) return [];
	if (Array.isArray(value)) return reasonsAgainstEach(fieldName, value);
	const candidate = String(value).trim();
	const isLeftOut = candidate === '' && !isRequired;
	if (isLeftOut) return [];
	const reason = validateRecordId(fieldName, candidate);
	if (reason === null) return [];
	return [`${reason} It was given "${candidate}".`];
}

function reasonsAgainstEach(fieldName: string, values: unknown[]): string[] {
	return values.flatMap((each) => reasonsAgainst(fieldName, each, true));
}
