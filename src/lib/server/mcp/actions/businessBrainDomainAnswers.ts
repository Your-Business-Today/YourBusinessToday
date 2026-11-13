import { domainPageOutcomes, type DomainPageKept, type DomainPageOutcome } from '$lib/server/businessBrain/keepDomainPage';
import type { DomainFilingDone } from '$lib/server/businessBrain/fileDomainFromSource';
import type { DomainHolder } from './domainHolder';

export const nothingTaught =
	'Nothing was filed: no context, page or retire was given. A source that teaches the domain nothing is a valid outcome; say so to the person.';

export function unknownContext(holder: DomainHolder, contextSlug: string): string {
	return `No bounded context ${contextSlug} is filed or given in contexts. Give it in contexts, or place the page in a context the domain has (${holder.readAction}). Nothing was filed.`;
}

export function unknownThing(holder: DomainHolder, thingSlug: string): string {
	return `A rule governs ${thingSlug}, which is no thing the domain holds or this call writes. File the thing first or in the same call, or name a thing the domain has (${holder.readAction}). Nothing was filed.`;
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
