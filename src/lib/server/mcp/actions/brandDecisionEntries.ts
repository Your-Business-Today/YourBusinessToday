import { checkDecision } from '$lib/brand/decisions/checkDecision';
import { KitLimits } from '$lib/brand/kitLimits';
import type { DecisionToKeep } from '$lib/server/brandKits/keepBrandDecision';
import type { TraitDefinition } from '$lib/brand/traits/traitDefinition';

/** One decision as the caller gave it, numbered from one so a refusal can name it. */
export type DecisionEntry = { number: number; traitKey: string; mediumPath: string; rationale: string; value: unknown };

export type EntryCheck = { decision: DecisionToKeep } | { refusal: string };

/** The decisions given, or why the list as a whole cannot be read. */
export function decisionEntriesOf(given: unknown): DecisionEntry[] | string {
	if (!Array.isArray(given) || given.length === 0) return 'decisions is a list of at least one decision.';
	if (given.length > KitLimits.decisionsPerCall) {
		return `That is ${given.length} decisions; record up to ${KitLimits.decisionsPerCall} in one call. Nothing was recorded.`;
	}
	return given.map((fields, index) => entryOf(index + 1, objectOf(fields)));
}

/** Checks one decision against its trait in the catalogue and its rationale against its column. */
export function validateDecisionEntry(entry: DecisionEntry, catalogue: TraitDefinition[]): EntryCheck {
	const { number, traitKey, mediumPath, rationale } = entry;
	const name = `Decision ${number} (${traitKey} @ ${mediumPath})`;
	if (rationale.length > KitLimits.rationaleCharacters) {
		return { refusal: `${name}: keep the rationale to ${KitLimits.rationaleCharacters} characters` };
	}
	const check = checkDecision(entry, catalogue);
	if ('problem' in check) return { refusal: `${name}: ${check.problem}` };
	return { decision: { ...check.decision, rationale } };
}

function entryOf(number: number, fields: Record<string, unknown>): DecisionEntry {
	const [traitKey, mediumPath, rationale] = ['traitKey', 'medium', 'rationale'].map((field) => textOf(fields, field));
	return { number, traitKey, mediumPath, rationale, value: fields.value };
}

function objectOf(fields: unknown): Record<string, unknown> {
	if (typeof fields !== 'object' || fields === null) return {};
	return fields as Record<string, unknown>;
}

function textOf(fields: Record<string, unknown>, field: string): string {
	return String(fields[field] ?? '').trim();
}
