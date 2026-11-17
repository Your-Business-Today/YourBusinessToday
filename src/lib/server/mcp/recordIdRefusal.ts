import { validateRecordId } from '$lib/data/isUuid';
import { nestedRecordsOf, recordIdFieldsOf } from './recordIdFields';

const wholeIdRule =
	'Nothing was done. An id is never shortened or left out: pass all 36 characters of it, exactly as the list or read action gave it.';

type Reading = Record<string, unknown>;

/**
 * The refusal for an input that names a record by anything but its whole id — the first eight
 * characters of one, or an empty or missing value where one is required, at the top of the input
 * or inside any record or list of records it holds — so it is refused by field at the gate rather
 * than reaching the database as a value its id column cannot hold.
 */
export function recordIdRefusal(actionName: string, inputSchema: Reading, input: Reading): string | null {
	const reasons = reasonsInRecord(inputSchema, input, '');
	if (reasons.length === 0) return null;
	return [`${actionName} needs whole ids.`, ...reasons.map((reason) => `- ${reason}`), wholeIdRule].join('\n');
}

function reasonsInRecord(schema: Reading, record: Reading, path: string): string[] {
	return [...reasonsInIdFields(schema, record, path), ...reasonsInNestedRecords(schema, record, path)];
}

function reasonsInIdFields(schema: Reading, record: Reading, path: string): string[] {
	return recordIdFieldsOf(schema).flatMap((field) =>
		reasonsAgainst(`${path}${field.name}`, record[field.name], field.isRequired)
	);
}

function reasonsInNestedRecords(schema: Reading, record: Reading, path: string): string[] {
	return nestedRecordsOf(schema).flatMap((nested) => {
		const value = record[nested.name];
		if (!nested.isList || !Array.isArray(value)) return reasonsInEach(nested.schema, value, `${path}${nested.name}.`);
		return value.flatMap((each, index) => reasonsInEach(nested.schema, each, `${path}${nested.name}[${index}].`));
	});
}

function reasonsInEach(schema: Reading, value: unknown, path: string): string[] {
	const isRecord = typeof value === 'object' && value !== null && !Array.isArray(value);
	if (!isRecord) return [];
	return reasonsInRecord(schema, value as Reading, path);
}

function reasonsAgainst(fieldName: string, value: unknown, isRequired: boolean): string[] {
	const isMissing = value === null || value === undefined;
	if (isMissing && isRequired) return [`${validateRecordId(fieldName, '')} It was left out.`];
	if (isMissing) return [];
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
