/** A step of a run's walk: its heading, then each item beneath it as an indented bullet. */
export function bulletedList(heading: string, items: readonly string[]): string {
	return [heading, ...items.map((item) => `   - ${item}`)].join('\n');
}
