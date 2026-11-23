/** Words of several lines with each line set in by the indent, so they read as belonging to the line above them. */
export function indentedLines(words: string, indent: string): string {
	return words
		.split('\n')
		.map((line) => `${indent}${line}`)
		.join('\n');
}
