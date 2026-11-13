import { domainPageKinds } from '$lib/data/businessBrainDomain';
import { domainKindsWithFields, type DomainFilingGiven, type DomainPageWriteGiven } from '$lib/data/businessBrainDomainRules';
import { statusesByThing, wordsWritten } from './domainWordGaps';
import { wordingOf } from '$lib/data/workflowMap/phraseInDomain';
import type { DomainEventFactsGiven, DomainRuleFactsGiven } from '$lib/data/businessBrainDomainFactsGiven';
import type { DomainEventReactors } from '$lib/data/domainRuleFacts';
import type { DomainPage } from '$lib/data/organisationDomain';

/** An event or a rule naming a record, a status, an event, a rule or a word the domain will not hold. */
export type DomainEventRuleGap =
	| { pageSlug: string; unknownRecordSlug: string }
	| { pageSlug: string; recordSlug: string; unknownStatus: string; statuses: string[] }
	| { pageSlug: string; unknownEventSlug: string }
	| { pageSlug: string; unknownRuleSlug: string }
	| { pageSlug: string; unknownWord: string };

/** What the domain will hold once the filing is in, as an event or a rule may name it. */
type DomainHeld = { statusesByRecord: Map<string, string[]>; eventSlugs: Set<string>; ruleSlugs: Set<string>; wordings: Set<string> };

function slugsOfKind(filing: DomainFilingGiven, filedPages: DomainPage[], kind: string): Set<string> {
	return new Set([...filedPages, ...filing.pages].filter((page) => page.kind === kind).map((page) => page.slug));
}

function wordingsHeld(filing: DomainFilingGiven, filedPages: DomainPage[]): Set<string> {
	const filed = filedPages.flatMap(({ facts }) => facts.terms);
	const names = [...filed, ...wordsWritten(filing)].flatMap(({ word, otherNames }) => [word, ...(otherNames ?? [])]);
	return new Set(names.map(wordingOf));
}

function heldOf(filing: DomainFilingGiven, filedPages: DomainPage[]): DomainHeld {
	return {
		statusesByRecord: statusesByThing(filing, filedPages, domainKindsWithFields),
		eventSlugs: slugsOfKind(filing, filedPages, domainPageKinds.domainEvent),
		ruleSlugs: slugsOfKind(filing, filedPages, domainPageKinds.rule),
		wordings: wordingsHeld(filing, filedPages)
	};
}

function recordInStatusGap(pageSlug: string, recordSlug: string | undefined, status: string | undefined, held: DomainHeld): DomainEventRuleGap | null {
	if (recordSlug === undefined) return null;
	const statuses = held.statusesByRecord.get(recordSlug);
	if (statuses === undefined) return { pageSlug, unknownRecordSlug: recordSlug };
	const isStatusUnknown = status !== undefined && !statuses.includes(status);
	return isStatusUnknown ? { pageSlug, recordSlug, unknownStatus: status, statuses } : null;
}

const noReactors: DomainEventReactors = { roles: [], ruleSlugs: [] };

function eventGap(pageSlug: string, facts: DomainEventFactsGiven, held: DomainHeld): DomainEventRuleGap | null {
	const marksGap = recordInStatusGap(pageSlug, facts.marksThingSlug, facts.marksStatus, held);
	if (marksGap !== null) return marksGap;
	const { roles, ruleSlugs } = facts.reactors ?? noReactors;
	const unknownWord = roles.find((role) => !held.wordings.has(wordingOf(role)));
	if (unknownWord !== undefined) return { pageSlug, unknownWord };
	const unknownRuleSlug = ruleSlugs.find((slug) => !held.ruleSlugs.has(slug));
	return unknownRuleSlug === undefined ? null : { pageSlug, unknownRuleSlug };
}

function ruleGap(pageSlug: string, facts: DomainRuleFactsGiven, held: DomainHeld): DomainEventRuleGap | null {
	const guardGap = recordInStatusGap(pageSlug, facts.guardsThingSlug, facts.guardsStatus, held);
	if (guardGap !== null) return guardGap;
	const { followsEventSlug, definesWord } = facts;
	if (followsEventSlug !== undefined && !held.eventSlugs.has(followsEventSlug)) return { pageSlug, unknownEventSlug: followsEventSlug };
	const isWordUnknown = definesWord !== undefined && !held.wordings.has(wordingOf(definesWord));
	return isWordUnknown ? { pageSlug, unknownWord: definesWord } : null;
}

function pageGap({ kind, slug, facts }: DomainPageWriteGiven, held: DomainHeld): DomainEventRuleGap | null {
	if (facts === null) return null;
	if (kind === domainPageKinds.domainEvent) return eventGap(slug, facts as DomainEventFactsGiven, held);
	if (kind === domainPageKinds.rule) return ruleGap(slug, facts as DomainRuleFactsGiven, held);
	return null;
}

/** The first event or rule this call writes that names what the domain will not hold, or null; a station key is checked only for its shape. */
export function firstEventRuleGap(filing: DomainFilingGiven, filedPages: DomainPage[]): DomainEventRuleGap | null {
	const held = heldOf(filing, filedPages);
	for (const page of filing.pages) {
		const gap = pageGap(page, held);
		if (gap !== null) return gap;
	}
	return null;
}
