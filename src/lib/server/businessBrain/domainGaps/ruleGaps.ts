import { domainPageKinds } from '$lib/data/businessBrainDomain';
import { domainQuestionKind, type DomainQuestion } from '$lib/data/domainQuestions';
import { ruleKinds } from '$lib/data/domainRuleFacts';
import { stationsOnLines } from '$lib/server/workflowMap/mapGaps/stationsOnLines';
import { asSentence } from './questionWording';
import { askedAbout, pageSubject, type DomainHeld } from './domainHeld';
import type { DomainRule } from '$lib/data/domainReading';

/** Statement 8: every rule has a kind and sits somewhere: a gate on a task of today's map or a record's status, a whenever on an event. */
export function ruleGaps(held: DomainHeld): DomainQuestion[] {
	const { map, domain } = held;
	const { things, rules } = domain;
	const stationKeys = new Set(map === null ? [] : stationsOnLines(map).map((station) => station.key));
	const eventSlugs = new Set(things.filter((thing) => thing.kind === domainPageKinds.domainEvent).map((event) => event.slug));
	return rules.flatMap((rule) => {
		const question = questionOf(rule, stationKeys, eventSlugs);
		if (question === null) return [];
		return [askedAbout(question.kind, `${asSentence(rule.title)} ${question.asking}`, pageSubject(rule.title, rule.pageId), rule)];
	});
}

type RuleQuestion = { kind: DomainQuestion['kind']; asking: string };

function questionOf(rule: DomainRule, stationKeys: Set<string>, eventSlugs: Set<string>): RuleQuestion | null {
	const { ruleKind, guardsStationKeys, guardsThingSlug, followsEventSlug } = rule;
	if (ruleKind === null) return { kind: domainQuestionKind.ruleKind, asking: kindAsking };
	const isGuardingNothing = guardsThingSlug === null && !guardsStationKeys.some((key) => stationKeys.has(key));
	if (ruleKind === ruleKinds.gate && isGuardingNothing) return { kind: domainQuestionKind.gate, asking: 'Which task does that stop?' };
	const isFollowingNothing = followsEventSlug === null || !eventSlugs.has(followsEventSlug);
	if (ruleKind === ruleKinds.whenever && isFollowingNothing) return { kind: domainQuestionKind.whenever, asking: 'What happens that sets it off?' };
	return null;
}

const kindAsking =
	'Does it stop a task until it holds, hold always, follow something that happens, or say what a word means?';
