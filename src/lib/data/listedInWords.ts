/** Several things named as a sentence lists them: "A", "A and B", "A, B and C". */
export function listedInWords(items: string[]): string {
	if (items.length <= 1) return items.join('');
	const last = items[items.length - 1];
	return `${items.slice(0, -1).join(', ')} and ${last}`;
}
