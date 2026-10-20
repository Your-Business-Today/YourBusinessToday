/** A count in words: "no tasks", "one task", "3 tasks". */
export function countOf(count: number, noun: string): string {
	if (count === 0) return `no ${noun}s`;
	if (count === 1) return `one ${noun}`;
	return `${count} ${noun}s`;
}
