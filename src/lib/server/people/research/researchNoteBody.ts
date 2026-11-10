import type { FoundRole, PersonResearchFindings } from '$lib/data/personResearchRules';

const noLines = '';

/** The "Found on the web" note: the summary, each role found with its page, and every page read. */
export function researchNoteBody(findings: PersonResearchFindings): string {
	return [findings.summary, listed('Roles found', findings.roles.map(describeRole)), listed('Read from', findings.sources)]
		.filter((section) => section !== noLines)
		.join('\n\n');
}

function describeRole(role: FoundRole): string {
	const position = [role.title, role.organisation].filter(Boolean).join(', ');
	return `${position} (${role.sourceUrl})`;
}

function listed(heading: string, lines: string[]): string {
	if (lines.length === 0) return noLines;
	return `${heading}:\n${lines.map((line) => `- ${line}`).join('\n')}`;
}
