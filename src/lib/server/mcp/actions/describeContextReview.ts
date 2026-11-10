import { hasChanges } from '$lib/data/companyContext/contextChanges';
import { reviewStates } from '$lib/data/companyContext/companyContext';
import type { CompanyContextVersion, ContextPart } from '$lib/data/companyContext/companyContext';
import type { ContextChanges } from '$lib/data/companyContext/contextChanges';

/** Each part the client marked not right, a list line in their own words, indented to sit under a numbered step. */
export function notRightLines({ parts }: CompanyContextVersion): string[] {
	const notRight = parts.filter((part) => part.reviewState === reviewStates.notRight);
	return notRight.map((part) => `   - ${part.name} (${part.key}): ${part.whatIsWrong}`);
}

/** The parts marked not right, for the client's Claude to put right in the next version. */
export function notRightSection(context: CompanyContextVersion): string {
	const lines = notRightLines(context);
	if (lines.length === 0) return '';
	const instruction =
		'Put each right with the client, then record a revised version with record_company_context. A part you ' +
		'change goes back to not checked, so they check it again on the map.';
	return ['### Marked not right by the client', instruction, ...lines.map((line) => line.trim())].join('\n');
}

/** What this version changed since the one before it, part by part. */
export function changesSection(changes: ContextChanges | null): string {
	if (changes === null) return '';
	const heading = `### Changed since version ${changes.sinceVersion}`;
	if (!hasChanges(changes)) return `${heading}\nNothing about the parts changed: every review was kept.`;
	return [
		heading,
		changeLine('New', changes.added),
		changeLine('Put differently, so not checked again until the client checks it', changes.changed),
		changeLine('Taken out', changes.removed)
	]
		.filter((line) => line !== '')
		.join('\n');
}

function changeLine(label: string, parts: ContextPart[]): string {
	if (parts.length === 0) return '';
	return `- ${label}: ${parts.map((part) => part.name).join(', ')}.`;
}
