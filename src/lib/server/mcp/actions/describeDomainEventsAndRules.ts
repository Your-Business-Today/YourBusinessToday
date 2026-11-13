import type { DomainRule, DomainThing } from '$lib/data/domainReading';

const listSeparator = ', ';

function reachingWords(thingSlug: string, status: string | null): string {
	return status === null ? thingSlug : `${thingSlug} reaching ${status}`;
}

/** Where a rule of a kind sits, as the parts of its line: the stations or record a gate guards, the event it follows, the word it defines. */
function placeParts({ guardsStationKeys, guardsThingSlug, guardsStatus, followsEventSlug, definesWord }: DomainRule): string[] {
	return [
		guardsStationKeys.length === 0 ? '' : `guards stations ${guardsStationKeys.join(listSeparator)}`,
		guardsThingSlug === null ? '' : `guards ${reachingWords(guardsThingSlug, guardsStatus)}`,
		followsEventSlug === null ? '' : `follows ${followsEventSlug}`,
		definesWord === null ? '' : `defines "${definesWord}"`
	].filter((part) => part !== '');
}

/** A rule as a line of Markdown with its kind and what it sits on; a rule filed before rules had kinds reads as it did. */
export function ruleLine(rule: DomainRule): string {
	const { title, slug, governs, pageId, ruleKind } = rule;
	if (ruleKind === null) return `- Rule: ${title} (${slug}, governs ${governs.join(listSeparator)}; page id ${pageId})`;
	const governed = governs.length === 0 ? [] : [`governs ${governs.join(listSeparator)}`];
	const parts = [slug, ...placeParts(rule), ...governed, `page id ${pageId}`];
	return `- Rule (${ruleKind}): ${title} (${parts.join('; ')})`;
}

/** What an event marks and who reacts, as sentences to close its line; none for an event filed before events said these. */
export function eventSentences({ marksThingSlug, marksStatus, reactors }: DomainThing): string {
	const reactingRules = reactors.ruleSlugs.map((ruleSlug) => `rule ${ruleSlug}`);
	const whoReacts = [...reactors.roles, ...reactingRules];
	const sentences = [
		marksThingSlug === null ? '' : `Marks: ${reachingWords(marksThingSlug, marksStatus)}.`,
		whoReacts.length === 0 ? '' : `Who reacts: ${whoReacts.join(listSeparator)}.`
	].filter((sentence) => sentence !== '');
	return sentences.map((sentence) => ` ${sentence}`).join('');
}
