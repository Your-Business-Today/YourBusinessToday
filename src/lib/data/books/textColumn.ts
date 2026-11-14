/** Why a text column of the books tables cannot hold the value, counted in characters, or null when it fits. */
export function lengthRefusal(field: string, value: string, longest: number): string | null {
	const characterCount = [...value].length;
	if (characterCount <= longest) return null;
	return `${field} is at most ${longest} characters; ${characterCount} were given.`;
}
