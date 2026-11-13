import { domainCompletenessGaps } from '$lib/server/businessBrain/domainCompletenessGaps';
import { domainQuestionsSection } from './domainQuestionsSection';
import { workflowMapGaps } from '$lib/server/workflowMap/workflowMapGaps';
import { workflowMapRunActionName } from './workflowMapRunActionName';
import type { DomainRunStanding } from './domainRunStanding';

/** How many questions the filed map has open, as the domain run's step 1 says beneath the map. */
export function mapQuestionsOpen({ map, domain, words }: DomainRunStanding): string[] {
	if (map === null) return [];
	const questionCount = workflowMapGaps(map, { things: domain?.things ?? [], words }).length;
	if (questionCount === 0) return ['   - The workflow map passes every test of a complete map.'];
	return [
		`   - The workflow map has ${questionCount} questions open; ${workflowMapRunActionName} asks them. Where the domain cannot place a phrase, it may be the map that is missing it.`
	];
}

/** The domain's own questions, ranked, closing the domain run's step 1 once a domain is filed. */
export function domainQuestionsOpen({ map, domain, words }: DomainRunStanding): string[] {
	if (domain === null) return [];
	return [`\n${domainQuestionsSection(domainCompletenessGaps({ domain, words, map }))}`];
}
