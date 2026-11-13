import { domainFilingLimits } from '$lib/data/businessBrainDomainRules';
import { everyRuleKind, ruleKinds, type RuleKind } from '$lib/data/domainRuleFacts';
import { isPageSlug, slugRefusal } from './businessBrainFieldRefusals';
import { rulePlaceFacts, validateRulePlace } from './validateRulePlace';
import { trimmedText } from '$lib/data/trimmedText';
import type { DomainRuleFactsGiven } from '$lib/data/businessBrainDomainFactsGiven';
import type { PlainObject } from '$lib/data/plainObject';

const { mostGoverned } = domainFilingLimits;

export const governsRefusal = `A rule names the things it governs by their slugs in governs: at most ${mostGoverned}, each once, and at least one for an always rule or a rule with no kind.`;

export const ruleKindRefusal = `ruleKind is one of ${everyRuleKind.join(', ')}.`;

const everyPlaceFact = Object.values(rulePlaceFacts).flat();

/** A rule's kind, where it sits and the things it governs, as given, or a sentence naming the first that does not fit. */
export function validateRuleFacts(entry: PlainObject, label: string): DomainRuleFactsGiven | string {
	const ruleKind = validateRuleKind(entry.ruleKind);
	if (ruleKind === undefined) return `${label}: ${ruleKindRefusal}`;
	const misplaced = everyPlaceFact.find((name) => entry[name] !== undefined && !isFactOfKind(name, ruleKind));
	if (misplaced !== undefined) return `${label}: ${misplacedRefusal(misplaced)}`;
	const isGovernsRequired = ruleKind === null || ruleKind === ruleKinds.always;
	const governs = validateGoverns(entry.governs, isGovernsRequired);
	if (typeof governs === 'string') return `${label}: ${governs}`;
	if (ruleKind === null) return { governs };
	const place = validateRulePlace(ruleKind, entry);
	return typeof place === 'string' ? `${label}: ${place}` : { governs, ruleKind, ...place };
}

function validateRuleKind(given: unknown): RuleKind | null | undefined {
	const ruleKind = trimmedText(given);
	if (ruleKind === '') return null;
	return everyRuleKind.find((kind) => kind === ruleKind);
}

function isFactOfKind(name: string, ruleKind: RuleKind | null): boolean {
	return ruleKind !== null && rulePlaceFacts[ruleKind].includes(name);
}

function misplacedRefusal(name: string): string {
	const kind = everyRuleKind.find((candidate) => rulePlaceFacts[candidate].includes(name));
	return `${name} says where a ${kind} rule sits; give ruleKind ${kind}, or leave ${name} out.`;
}

function validateGoverns(given: unknown, isRequired: boolean): string[] | string {
	if (given === undefined && !isRequired) return [];
	if (!Array.isArray(given) || given.length > mostGoverned) return governsRefusal;
	if (isRequired && given.length === 0) return governsRefusal;
	const governs = given.map(trimmedText);
	if (!governs.every(isPageSlug)) return `governs. ${slugRefusal}`;
	return new Set(governs).size === governs.length ? governs : governsRefusal;
}
