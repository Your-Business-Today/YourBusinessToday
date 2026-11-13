import { domainQuestionStatements, type DomainQuestion } from '$lib/data/domainQuestions';
import { areaGaps } from './domainGaps/areaGaps';
import { assumedGaps } from './domainGaps/assumedGaps';
import { eventGaps } from './domainGaps/eventGaps';
import { recordGaps } from './domainGaps/recordGaps';
import { ruleGaps } from './domainGaps/ruleGaps';
import { wordGaps } from './domainGaps/wordGaps';
import type { DomainHeld } from './domainGaps/domainHeld';

/** What the domain leaves missing, tested against statements 5 to 10 of a complete model, each as its question: the core area first, then the statements in order. */
export function domainCompletenessGaps(held: DomainHeld): DomainQuestion[] {
	const questions = [...wordGaps(held), ...recordGaps(held), ...eventGaps(held), ...ruleGaps(held), ...areaGaps(held), ...assumedGaps(held)];
	const { contexts } = held.domain;
	const core = contexts.find((context) => context.isCoreDomain);
	const coreSlug = core?.slug ?? null;
	const areaRankOf = ({ areaSlug }: DomainQuestion) => (coreSlug !== null && areaSlug === coreSlug ? 0 : 1);
	const statementOf = ({ kind }: DomainQuestion) => domainQuestionStatements[kind];
	return [...questions].sort((first, second) => areaRankOf(first) - areaRankOf(second) || statementOf(first) - statementOf(second));
}
