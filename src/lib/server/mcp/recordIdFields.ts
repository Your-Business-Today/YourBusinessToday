type FieldSchema = { type?: string; items?: unknown; properties?: Record<string, unknown> };

export type RecordIdField = { name: string; isRequired: boolean };

export type NestedRecord = { name: string; schema: Record<string, unknown>; isList: boolean };

const recordIdFieldName = /Ids?$/;
const buildModelName = 'modelId';
const gmailIdFields = ['messageId', 'threadId'];
const idFieldsThatNameNoRecord = new Set([buildModelName, ...gmailIdFields]);
const objectType = 'object';
const listType = 'array';

export function namesARecord(fieldName: string): boolean {
	if (idFieldsThatNameNoRecord.has(fieldName)) return false;
	return recordIdFieldName.test(fieldName);
}

/** Every field of a schema's own level that names a record by its id, and whether the call must give it. */
export function recordIdFieldsOf(schema: Record<string, unknown>): RecordIdField[] {
	const requiredNames = requiredNamesOf(schema);
	return Object.keys(propertiesOf(schema))
		.filter(namesARecord)
		.map((name) => ({ name, isRequired: requiredNames.includes(name) }));
}

/** Every field of a schema's own level that holds a record of its own, or a list of them, whose fields may name records too. */
export function nestedRecordsOf(schema: Record<string, unknown>): NestedRecord[] {
	return Object.entries(propertiesOf(schema)).flatMap(([name, field]) => nestedSchemaOf(name, field as FieldSchema));
}

function nestedSchemaOf(name: string, field: FieldSchema): NestedRecord[] {
	if (field.type === objectType) return [{ name, schema: field as Record<string, unknown>, isList: false }];
	if (field.type !== listType) return [];
	const item = (field.items ?? {}) as FieldSchema;
	if (item.type !== objectType) return [];
	return [{ name, schema: item as Record<string, unknown>, isList: true }];
}

function propertiesOf(schema: Record<string, unknown>): Record<string, unknown> {
	return (schema.properties ?? {}) as Record<string, unknown>;
}

function requiredNamesOf(schema: Record<string, unknown>): string[] {
	return (schema.required ?? []) as string[];
}
