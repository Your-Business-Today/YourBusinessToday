import { brainOf } from './businessBrainAnswers';
import { domainPageOutcomes, type DomainPageKept, type DomainPageOutcome } from '$lib/server/businessBrain/keepDomainPage';
import { portalAddress } from '$lib/portal/portalAddress';
import type { DomainFilingDone } from '$lib/server/businessBrain/fileOrganisationDomain';
import type { Organisation } from '$lib/server/organisations/organisationRecord';

export const nothingTaught =
	'Nothing was filed: no context, page or retire was given. A source that teaches the domain nothing is a valid outcome; say so to the person.';

export function unknownContext(contextSlug: string): string {
	return `No bounded context ${contextSlug} is filed or given in contexts. Give it in contexts, or place the page in a context the domain has (read_business_brain_domain). Nothing was filed.`;
}

/** Where the organisation's domain is drawn on the site. */
export function domainAddressOf(organisation: Organisation): string {
	return `https://${portalAddress.hostName}/organisations/${organisation.id}/domain`;
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

export function domainFiled(organisation: Organisation, done: DomainFilingDone): string {
	const { sourceId, contexts, pages, retires, coreMovedFrom } = done;
	return [
		`Filed into the domain in ${brainOf(organisation)}. Source id: ${sourceId}.`,
		...section('Contexts:', contexts.map(keptLine)),
		...section('No longer the core domain:', coreMovedFrom.map(keptLine)),
		...section('Pages:', pages.map(keptLine)),
		...section('Superseded:', retires.map(retiredLine)),
		`The domain is drawn at ${domainAddressOf(organisation)}; give the person the link.`
	].join('\n');
}
