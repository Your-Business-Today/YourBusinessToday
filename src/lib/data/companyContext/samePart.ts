import type { CompanyContextDraft, ContextPart } from './companyContext';

/** A part with the version it is in, so a process can be read with its steps. */
export type PartInContext = { part: ContextPart; context: CompanyContextDraft };

/**
 * Whether a part says what it said in an earlier version: the same kind, words and place, and for a process the
 * same steps done by the same roles. How sure Claude is and what the client said of it are not what it says.
 */
export function isTheSamePart(earlier: PartInContext, later: PartInContext): boolean {
	return wordsOf(earlier) === wordsOf(later) && stepsOf(earlier) === stepsOf(later);
}

function wordsOf({ part }: PartInContext): string {
	const { kind, name, description, isCore, seenIn } = part;
	return JSON.stringify([kind, name, description, isCore, seenIn?.connector ?? null, seenIn?.place ?? null]);
}

function stepsOf({ part, context }: PartInContext): string {
	const steps = context.steps.filter((step) => step.processKey === part.key);
	return JSON.stringify(steps.map((step) => [step.position, step.description, step.roleKey]));
}
