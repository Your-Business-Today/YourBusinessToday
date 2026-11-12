/** A value that is an object of named values, as JSON input gives one: not null, not a list. */
export type PlainObject = Record<string, unknown>;

export function isPlainObject(value: unknown): value is PlainObject {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}
