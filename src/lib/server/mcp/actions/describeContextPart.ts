import { reviewStateLabels } from '$lib/data/companyContext/companyContextWords';
import { reviewStates } from '$lib/data/companyContext/companyContext';
import type { ContextPart, ProcessStep, SeenIn } from '$lib/data/companyContext/companyContext';

/** One part as a list line: its name and key, what it is, where it was seen, how sure Claude is and its review. */
export function describeContextPart(part: ContextPart, steps: ProcessStep[], roleNames: Map<string, string>): string {
	const core = part.isCore ? ', the core' : '';
	const description = part.description === null ? '' : ` ${part.description}`;
	const facts = [seenSentence(part.seenIn), `Confidence ${part.confidence}.`, reviewSentence(part)];
	const partLine = `- **${part.name}** (\`${part.key}\`${core}).${description} ${facts.join(' ')}`;
	const stepLines = steps.map((step) => stepLine(step, roleNames));
	return [partLine, ...stepLines].join('\n');
}

function seenSentence(seenIn: SeenIn | null): string {
	if (seenIn === null) return 'Not seen in a connector.';
	if (seenIn.place === null) return `Seen in ${seenIn.connector}.`;
	return `Seen in ${seenIn.connector}, at ${seenIn.place}.`;
}

function reviewSentence(part: ContextPart): string {
	const label = reviewStateLabels[part.reviewState];
	if (part.reviewState !== reviewStates.notRight) return `Review: ${label}.`;
	return `Review: ${label}: ${part.whatIsWrong}`;
}

function stepLine(step: ProcessStep, roleNames: Map<string, string>): string {
	const roleName = step.roleKey === null ? undefined : roleNames.get(step.roleKey);
	const byRole = roleName === undefined ? '' : ` (${roleName})`;
	return `   ${step.position}. ${step.description}${byRole}`;
}
