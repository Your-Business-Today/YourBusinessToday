import { companyContextLimits as limits } from '$lib/data/companyContext/companyContextLimits';
import { contextPartKind } from '$lib/data/companyContext/companyContext';
import { isRefused, readList } from './contextText';
import { validateContextPart } from './validateContextPart';
import type { ContextPart, ProcessStep } from '$lib/data/companyContext/companyContext';
import type { Refusal } from '$lib/server/portal/portalFormReading';

export type ReadParts = { parts: ContextPart[]; steps: ProcessStep[] };

/** Every part of a version: each key once, at most one core area, and each step's role a role of this version. */
export function validateContextParts(value: unknown): ReadParts | Refusal {
	const candidates = readList(value, limits.mostParts, 'parts');
	if (isRefused(candidates)) return candidates;
	const parts: ContextPart[] = [];
	const steps: ProcessStep[] = [];
	for (const [index, candidate] of candidates.entries()) {
		const read = validateContextPart(candidate, index + 1);
		if (isRefused(read)) return read;
		const { part: readPart, steps: partSteps } = read;
		const isRepeated = parts.some((part) => part.key === readPart.key);
		if (isRepeated) return { refusal: `Part ${index + 1} repeats the key "${readPart.key}": give each part once.` };
		parts.push(readPart);
		steps.push(...partSteps);
	}
	return refuseInconsistency(parts, steps) ?? { parts, steps };
}

function refuseInconsistency(parts: ContextPart[], steps: ProcessStep[]): Refusal | null {
	const coreCount = parts.filter((part) => part.isCore).length;
	if (coreCount > 1) return { refusal: `${coreCount} areas are marked core: mark one.` };
	const roleKeys = new Set(parts.filter((part) => part.kind === contextPartKind.role).map((part) => part.key));
	const strayStep = steps.find((step) => step.roleKey !== null && !roleKeys.has(step.roleKey));
	if (strayStep === undefined) return null;
	return {
		refusal: `Part "${strayStep.processKey}" step ${strayStep.position} roleKey "${strayStep.roleKey}" is not the key of a role in this version.`
	};
}
