const clauseSeparator = '; ';
const leadingJoiner = /^(and|or)\s+/i;
const fewestClauses = 3;
const colonRun = /(^|[.!?]\s+)([^.!?:]*?:)\s+([^.!?]*;[^.!?]*[.!?])(?=\s|$)/;

/**
 * A sentence that lists after a colon and separates its points with semicolons —
 * "Both sides can check it: a; b; and c." — written out as a bulleted list.
 */
export function listSemicolonRun(paragraph: string): string {
	const run = colonRun.exec(paragraph);
	if (run === null) return paragraph;
	const [whole, sentenceStart, lead, listed] = run;
	const clauses = listed.slice(0, -1).split(clauseSeparator);
	if (clauses.length < fewestClauses) return paragraph;
	const runStart = run.index + sentenceStart.length;
	const before = paragraph.slice(0, runStart).trim();
	const after = paragraph.slice(run.index + whole.length).trim();
	const bullets = clauses.map((clause) => `- ${clause.trim().replace(leadingJoiner, '')}`);
	return [before, lead, bullets.join('\n'), after]
		.filter((part) => part !== '')
		.join('\n\n');
}
