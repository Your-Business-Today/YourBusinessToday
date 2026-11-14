import type { DomainEventRuleGap } from '$lib/server/businessBrain/domainEventRuleGaps';
import type { DomainHolder } from './domainHolder';

/** The statuses a record holds, as a refusal names them. */
export function statusesHeldBy({ statuses }: { statuses: string[] }): string {
	return statuses.length === 0 ? 'it has no statuses' : `its statuses are ${statuses.join(', ')}`;
}

/** Why nothing was filed, naming the record, status, event, rule or word an event or a rule names that the domain will not hold. */
export function eventRuleGapAnswer(holder: DomainHolder, gap: DomainEventRuleGap): string {
	const nothingFiled = `File it first or in the same call, or name what the domain has (${holder.readAction}). Nothing was filed.`;
	const { pageSlug } = gap;
	if ('unknownRecordSlug' in gap) return `${pageSlug} names the record ${gap.unknownRecordSlug}, which is no record the domain holds or this call writes. ${nothingFiled}`;
	if ('unknownStatus' in gap) return `${pageSlug} names ${gap.recordSlug} in ${gap.unknownStatus}, which is not a status of it: ${statusesHeldBy(gap)}. ${nothingFiled}`;
	if ('unknownEventSlug' in gap) return `${pageSlug} follows the event ${gap.unknownEventSlug}, which is no event the domain holds or this call writes. ${nothingFiled}`;
	if ('unknownRuleSlug' in gap) return `${pageSlug} names the rule ${gap.unknownRuleSlug} as reacting, which is no rule the domain holds or this call writes. ${nothingFiled}`;
	return `${pageSlug} names the word "${gap.unknownWord}", which no glossary lists as a word or another name. Give it in a glossary’s terms first or in the same call (${holder.readAction}). Nothing was filed.`;
}
