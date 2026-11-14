import { domainFilingLimits } from '$lib/data/businessBrainDomainRules';
import { isPageSlug, lengthRefusal, slugRefusal } from './businessBrainFieldRefusals';
import { mapKeyShape, workflowMapLimits } from '$lib/data/workflowMap/workflowMapLimits';
import { ruleKinds, type RuleKind } from '$lib/data/domainRuleFacts';
import { trimmedText } from '$lib/data/trimmedText';
import { validateRecordInStatus } from './validateRecordInStatus';
import { validateTextList } from './validateTextList';
import type { DomainRuleFactsGiven } from '$lib/data/businessBrainDomainFactsGiven';
import type { PlainObject } from '$lib/data/plainObject';

const { mostGuardedStations, longestWord } = domainFilingLimits;

/** Where a rule of a kind sits, as it is kept beside its kind. */
export type RulePlaceGiven = Omit<DomainRuleFactsGiven, 'governs' | 'ruleKind'>;

/** The facts that say where each kind of rule sits; an always rule sits on what it governs. */
export const rulePlaceFacts: Record<RuleKind, string[]> = {
	[ruleKinds.gate]: ['guardsStationKeys', 'guardsThingSlug', 'guardsStatus'],
	[ruleKinds.always]: [],
	[ruleKinds.whenever]: ['followsEventSlug'],
	[ruleKinds.term]: ['definesWord']
};

export const gateRefusal =
	`A gate names what it guards: the stations of the workflow map by their keys in guardsStationKeys, at most ${mostGuardedStations}, each once, ` +
	'or a record by its slug in guardsThingSlug with the status in guardsStatus that it must hold before reaching, or both.';

export const wheneverRefusal = `A whenever rule names the event it follows by its slug in followsEventSlug. ${slugRefusal}`;

const guardNames = { thing: 'guardsThingSlug', status: 'guardsStatus' };

function isStationKey(key: string): boolean {
	return key.length <= workflowMapLimits.keyLength && mapKeyShape.test(key);
}

function validateGate(entry: PlainObject): RulePlaceGiven | string {
	const guardsStationKeys = validateTextList(entry.guardsStationKeys, mostGuardedStations, isStationKey);
	if (guardsStationKeys === null) return gateRefusal;
	const guarded = validateRecordInStatus(entry, guardNames);
	if (typeof guarded === 'string') return guarded;
	const isStatusMissing = guarded !== null && guarded.status === '';
	if (isStatusMissing || (guarded === null && guardsStationKeys.length === 0)) return gateRefusal;
	const stations = guardsStationKeys.length === 0 ? {} : { guardsStationKeys };
	return guarded === null ? stations : { ...stations, guardsThingSlug: guarded.thingSlug, guardsStatus: guarded.status };
}

function validateWhenever(entry: PlainObject): RulePlaceGiven | string {
	const followsEventSlug = trimmedText(entry.followsEventSlug);
	return isPageSlug(followsEventSlug) ? { followsEventSlug } : wheneverRefusal;
}

function validateTermRule(entry: PlainObject): RulePlaceGiven | string {
	const definesWord = trimmedText(entry.definesWord);
	const refusal = lengthRefusal('definesWord, the glossary’s word the rule says the meaning of,', definesWord, longestWord, true);
	return refusal ?? { definesWord };
}

const placeValidators: Record<RuleKind, (entry: PlainObject) => RulePlaceGiven | string> = {
	[ruleKinds.gate]: validateGate,
	[ruleKinds.always]: () => ({}),
	[ruleKinds.whenever]: validateWhenever,
	[ruleKinds.term]: validateTermRule
};

/** Where a rule of the kind sits, as given, or a sentence naming what does not fit. */
export function validateRulePlace(ruleKind: RuleKind, entry: PlainObject): RulePlaceGiven | string {
	return placeValidators[ruleKind](entry);
}
