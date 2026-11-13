import { filledTextOf, filledTextsOf } from './filledText';
import { isPlainObject, type PlainObject } from './plainObject';

/** The four kinds a rule takes: what must hold before a task or a status change, what is always true, what follows an event, and what a word means. */
export const ruleKinds = { gate: 'gate', always: 'always', whenever: 'whenever', term: 'term' } as const;

export type RuleKind = (typeof ruleKinds)[keyof typeof ruleKinds];

export const everyRuleKind: RuleKind[] = Object.values(ruleKinds);

/** Where a rule sits, by its kind: the stations or the record and status a gate guards, the event a policy follows, the word a term defines. */
export type DomainRuleFacts = {
	ruleKind: RuleKind | null;
	guardsStationKeys: string[];
	guardsThingSlug: string | null;
	guardsStatus: string | null;
	followsEventSlug: string | null;
	definesWord: string | null;
};

/** What a rule's facts say of where it sits; a rule filed before rules had kinds reads as having none and sitting nowhere further. */
export function readRuleFacts(facts: PlainObject): DomainRuleFacts {
	const guardsThingSlug = filledTextOf(facts.guardsThingSlug);
	return {
		ruleKind: (everyRuleKind as unknown[]).includes(facts.ruleKind) ? (facts.ruleKind as RuleKind) : null,
		guardsStationKeys: filledTextsOf(facts.guardsStationKeys),
		guardsThingSlug,
		guardsStatus: guardsThingSlug === null ? null : filledTextOf(facts.guardsStatus),
		followsEventSlug: filledTextOf(facts.followsEventSlug),
		definesWord: filledTextOf(facts.definesWord)
	};
}

/** Who reacts to an event: the roles by the glossary's word, and the rules that follow it by their slugs. */
export type DomainEventReactors = { roles: string[]; ruleSlugs: string[] };

/** What an event says of itself: the record and the status it reaches that the event marks, and who reacts. */
export type DomainEventFacts = { marksThingSlug: string | null; marksStatus: string | null; reactors: DomainEventReactors };

/** What an event's facts say; an event filed before events said these reads as marking nothing, with nobody reacting. */
export function readEventFacts(facts: PlainObject): DomainEventFacts {
	const marksThingSlug = filledTextOf(facts.marksThingSlug);
	const reactors = isPlainObject(facts.reactors) ? facts.reactors : {};
	return {
		marksThingSlug,
		marksStatus: marksThingSlug === null ? null : filledTextOf(facts.marksStatus),
		reactors: { roles: filledTextsOf(reactors.roles), ruleSlugs: filledTextsOf(reactors.ruleSlugs) }
	};
}
