import { domainBlockNames, domainPageKinds, type DomainFieldFact, type DomainLifecycleStep } from '$lib/data/businessBrainDomain';
import { membersOf } from '$lib/data/domainGroups';
import type { DomainThing } from '$lib/data/domainReading';

const closingStop = /[.!?]$/;

/** A labelled fact closed as a sentence, so the facts of a line read one after another. */
function labelledSentence(label: string, text: string): string {
	const stop = closingStop.test(text) ? '' : '.';
	return `${label}: ${text}${stop}`;
}

/** The kinds written out a thing to a line with what it says of itself, rather than listed as a block. */
export const recordKinds: string[] = [domainPageKinds.entity, domainPageKinds.valueObject, domainPageKinds.aggregate];

/** A record or detail, or a group with its root and members, as lines of Markdown. */
export function recordLines(thing: DomainThing, things: DomainThing[]): string[] {
	if (thing.kind === domainPageKinds.aggregate) return [groupLine(thing, things)];
	return [recordLine(thing), ...thing.lifecycle.map(lifecycleLine)];
}

function recordLine(thing: DomainThing): string {
	const { kind, title, slug, summary, fields, statuses, lifecycle, identity, keptIn, groupSlug, pageId } = thing;
	const parts = [
		fields.length === 0 ? '' : `Fields: ${fields.map(fieldWords).join(', ')}.`,
		identity === null ? '' : labelledSentence('What makes one', identity),
		keptIn === null ? '' : labelledSentence('Kept in', keptIn),
		groupSlug === null ? '' : `In group ${groupSlug}.`,
		lifecycle.length > 0 || statuses.length === 0 ? '' : `Statuses: ${statuses.join(', ')}.`,
		lifecycle.length === 0 ? '' : 'Lifecycle:'
	].filter((part) => part !== '');
	return [`- ${domainBlockNames[kind]}: ${title} (${slug}) — ${summary} (page id ${pageId}).`, ...parts].join(' ');
}

function fieldWords({ name, ref }: DomainFieldFact): string {
	return ref === null ? name : `${name} → ${ref}`;
}

/** One status of a lifecycle: what it means, then where a record in it can move. */
function lifecycleLine({ status, meaning, movesTo }: DomainLifecycleStep): string {
	const meant = meaning === '' ? '' : `: ${meaning}`;
	const moves = movesTo.length === 0 ? '; moves nowhere further' : `; moves to ${movesTo.join(', ')}`;
	return `  - ${status}${meant}${moves}`;
}

function groupLine(group: DomainThing, things: DomainThing[]): string {
	const { title, slug, summary, pageId } = group;
	const root = group.aggregateRootSlug === null ? 'no root named' : `root ${group.aggregateRootSlug}`;
	const members = membersOf(things, group).map((member) => `${member.title} (${member.slug})`);
	const named = members.length === 0 ? 'no members named' : `members ${members.join(', ')}`;
	return `- ${domainBlockNames[group.kind]}: ${title} (${slug}) — ${summary}. ${root}; ${named} (page id ${pageId})`;
}
