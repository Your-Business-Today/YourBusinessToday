import { companyContextLimits as limits, partKeyShape } from '$lib/data/companyContext/companyContextLimits';
import { contextPartKinds } from '$lib/data/companyContext/companyContext';
import { fieldsOf, isRefused, readChoice, readOptionalText, readRequiredText } from './contextText';
import { readPartStanding } from './readPartStanding';
import { validateProcessSteps } from './validateProcessSteps';
import type { ContextPart, ProcessStep } from '$lib/data/companyContext/companyContext';
import type { Refusal } from '$lib/server/portal/portalFormReading';

/** A part as the connector reads it, with the steps it carries when it is a process. */
export type ReadPart = { part: ContextPart; steps: ProcessStep[] };

type PartWords = { name: string; description: string | null };

export function validateContextPart(candidate: unknown, position: number): ReadPart | Refusal {
	const fields = fieldsOf(candidate);
	const key = readPartKey(fields.key, `Part ${position} key`);
	if (isRefused(key)) return key;
	const label = `Part "${key}"`;
	const kind = readChoice(fields.kind, contextPartKinds, `${label} kind`);
	if (isRefused(kind)) return kind;
	const words = readPartWords(fields, label);
	if (isRefused(words)) return words;
	const standing = readPartStanding(fields, { kind, label });
	if (isRefused(standing)) return standing;
	const steps = validateProcessSteps(fields.steps, { processKey: key, kind, label });
	if (isRefused(steps)) return steps;
	return { part: { key, kind, ...words, ...standing }, steps };
}

function readPartKey(value: unknown, field: string): string | Refusal {
	const key = readRequiredText(value, { field, limit: limits.keyLength });
	if (isRefused(key)) return key;
	if (partKeyShape.test(key)) return key;
	return { refusal: `${field} must be lower-case words joined by hyphens, such as quote-spreadsheet.` };
}

function readPartWords(fields: Record<string, unknown>, label: string): PartWords | Refusal {
	const name = readRequiredText(fields.name, { field: `${label} name`, limit: limits.nameLength });
	if (isRefused(name)) return name;
	const descriptionRule = { field: `${label} description`, limit: limits.descriptionLength };
	const description = readOptionalText(fields.description, descriptionRule);
	if (isRefused(description)) return description;
	return { name, description };
}
