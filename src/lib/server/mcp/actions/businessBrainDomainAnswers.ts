import { domainPageOutcomes, type DomainPageKept, type DomainPageOutcome } from '$lib/server/businessBrain/keepDomainPage';
import type { DomainFilingDone } from '$lib/server/businessBrain/fileDomainFromSource';
import type { DomainFilingGap } from '$lib/server/businessBrain/domainFilingGaps';
import type { DomainHolder } from './domainHolder';
import type { DomainWordGap } from '$lib/server/businessBrain/domainWordGaps';

export const nothingTaught =
	'Nothing was filed: no context, page or retire was given. A source that teaches the domain nothing is a valid outcome; say so to the person.';

function unknownContext(holder: DomainHolder, contextSlug: string): string {
	return `No bounded context ${contextSlug} is filed or given in contexts. Give it in contexts, or place the page in a context the domain has (${holder.readAction}). Nothing was filed.`;
}

function unknownThing(holder: DomainHolder, thingSlug: string): string {
	return `A rule governs ${thingSlug}, which is no thing the domain holds or this call writes. File the thing first or in the same call, or name a thing the domain has (${holder.readAction}). Nothing was filed.`;
}

function unknownRelatedContext(holder: DomainHolder, contextSlug: string): string {
	return `The context map relates ${contextSlug}, which is no bounded context filed or given in contexts. Give it in contexts, or relate the contexts the domain has (${holder.readAction}). Nothing was filed.`;
}

function unknownNaming(holder: DomainHolder, gap: DomainWordGap): string {
	const nothingFiled = `File it first or in the same call, or name what the domain has (${holder.readAction}). Nothing was filed.`;
	if ('unknownNamedThingSlug' in gap) return `The word "${gap.word}" names ${gap.unknownNamedThingSlug}, which is no thing the domain holds or this call writes. ${nothingFiled}`;
	const { word, thingSlug, unknownStatus, statuses } = gap;
	const statusesHeld = statuses.length === 0 ? 'it has no statuses' : `its statuses are ${statuses.join(', ')}`;
	return `The word "${word}" names ${thingSlug} in ${unknownStatus}, which is not a status of it: ${statusesHeld}. ${nothingFiled}`;
}

/** Why nothing was filed, naming what the filing names that the domain will not hold. */
export function filingGapAnswer(holder: DomainHolder, gap: DomainFilingGap): string {
	if ('unknownContextSlug' in gap) return unknownContext(holder, gap.unknownContextSlug);
	if ('unknownThingSlug' in gap) return unknownThing(holder, gap.unknownThingSlug);
	if ('unknownRelatedContextSlug' in gap) return unknownRelatedContext(holder, gap.unknownRelatedContextSlug);
	return unknownNaming(holder, gap);
}

const outcomeWords: Record<DomainPageOutcome, string> = {
	filed: 'Filed',
	revised: 'Revised, the earlier version kept in its history:',
	unchanged: 'Already read so, left unchanged:',
	revisedMeanwhile: 'Revised by someone else while you were filing, left as they made it; read it again and write on top of theirs:',
	notInDomain: 'Not written, the slug belongs to a page that is not part of the domain; choose another slug:'
};

function keptLine({ title, slug, pageId, outcome }: DomainPageKept): string {
	const id = pageId === null || outcome === domainPageOutcomes.notInDomain ? '' : `, page id ${pageId}`;
	return `- ${outcomeWords[outcome]} "${title}" (${slug}${id})`;
}

function retiredLine(kept: DomainPageKept): string {
	if (kept.outcome === domainPageOutcomes.notInDomain) return `- Not superseded, no domain page ${kept.slug} to fold: ${kept.slug}`;
	return `- Superseded, out of the domain with its history and a link to its successor: ${kept.slug}`;
}

function section(heading: string, lines: string[]): string[] {
	return lines.length === 0 ? [] : [heading, ...lines];
}

export function domainFiled(holder: DomainHolder, done: DomainFilingDone): string {
	const { sourceId, contexts, pages, retires, coreMovedFrom } = done;
	return [
		`Filed into the domain in ${holder.brainName}. Source id: ${sourceId}.`,
		...section('Contexts:', contexts.map(keptLine)),
		...section('No longer the core domain:', coreMovedFrom.map(keptLine)),
		...section('Pages:', pages.map(keptLine)),
		...section('Superseded:', retires.map(retiredLine)),
		`The domain is drawn at ${holder.address}; give the person the link.`
	].join('\n');
}
