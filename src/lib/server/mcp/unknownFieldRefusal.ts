type FieldSchema = { description?: string };

/** Thrown when a tool or an action is called with a field it does not take; the caller sees it as an error. */
export class UnknownFieldError extends Error {}

/** Stops the call when its input carries a field the schema does not take. */
export function refuseUnknownFields(
	name: string,
	inputSchema: Record<string, unknown>,
	input: Record<string, unknown>
): void {
	const refusal = unknownFieldRefusal(name, inputSchema, input);
	if (refusal !== null) throw new UnknownFieldError(refusal);
}

/**
 * The refusal for an input that carries a field the action does not take, naming each field it
 * does take, so a misnamed field is never quietly ignored and read as an empty answer.
 */
export function unknownFieldRefusal(
	actionName: string,
	inputSchema: Record<string, unknown>,
	input: Record<string, unknown>
): string | null {
	const fields = (inputSchema.properties ?? {}) as Record<string, FieldSchema>;
	const fieldNames = Object.keys(fields);
	const unknownNames = Object.keys(input).filter((name) => !fieldNames.includes(name));
	if (unknownNames.length === 0) return null;
	const refused = `${actionName} has no field called ${unknownNames.join(' or ')}, so nothing was done.`;
	if (fieldNames.length === 0) return `${refused} It takes no input: call it with none.`;
	const fieldLines = fieldNames.map((name) => fieldLine(name, fields[name]));
	return [`${refused} The fields it takes are:`, ...fieldLines].join('\n');
}

function fieldLine(name: string, field: FieldSchema): string {
	const description = field.description ?? '';
	if (description === '') return `- ${name}`;
	return `- ${name}: ${description}`;
}
