import { companyContextLimits as limits } from '$lib/data/companyContext/companyContextLimits';
import { contextPartKind } from '$lib/data/companyContext/companyContext';
import { fieldsOf, isRefused, readList, readOptionalText, readRequiredText } from './contextText';
import type { ProcessStep } from '$lib/data/companyContext/companyContext';
import type { Refusal } from '$lib/server/portal/portalFormReading';

type StepOwner = { processKey: string; kind: string; label: string };

/** A process's steps in the order given, numbered from 1; any other kind of part has none. */
export function validateProcessSteps(value: unknown, owner: StepOwner): ProcessStep[] | Refusal {
	const candidates = readList(value, limits.mostStepsInAProcess, `${owner.label} steps`);
	if (isRefused(candidates)) return candidates;
	if (candidates.length > 0 && owner.kind !== contextPartKind.process) {
		return {
			refusal: `${owner.label} is a ${owner.kind}: only a process has steps.`
		};
	}
	const steps: ProcessStep[] = [];
	for (const [index, candidate] of candidates.entries()) {
		const step = readStep(candidate, owner, index + 1);
		if (isRefused(step)) return step;
		steps.push(step);
	}
	return steps;
}

function readStep(candidate: unknown, owner: StepOwner, position: number): ProcessStep | Refusal {
	const fields = fieldsOf(candidate);
	const label = `${owner.label} step ${position}`;
	const description = readRequiredText(fields.does, {
		field: `${label} does`,
		limit: limits.stepLength
	});
	if (isRefused(description)) return description;
	const roleKey = readOptionalText(fields.roleKey, {
		field: `${label} roleKey`,
		limit: limits.keyLength
	});
	if (isRefused(roleKey)) return roleKey;
	return { processKey: owner.processKey, position, description, roleKey };
}
