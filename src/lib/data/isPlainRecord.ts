/** Whether a value given at a door is a record of named values, not a list, a scalar or nothing. */
export function isPlainRecord(candidate: unknown): candidate is Record<string, unknown> {
	return typeof candidate === 'object' && candidate !== null && !Array.isArray(candidate);
}
