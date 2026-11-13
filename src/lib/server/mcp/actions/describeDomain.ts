import { contextHeading, relationshipLine, termLine } from './describeDomainLines';
import { recordKinds, recordLines } from './describeDomainRecords';
import { eventSentences, ruleLine } from './describeDomainEventsAndRules';
import { domainBlockNames, domainPageKinds } from '$lib/data/businessBrainDomain';
import { entitiesOf, type BoundedContext } from '$lib/data/blueprint/domainModel';
import { readBodiesByPageId } from '$lib/server/businessBrain/readBodiesByPageId';
import type { DomainBlock, OrganisationDomain } from '$lib/data/organisationDomain';
import type { DomainGlossary, DomainThing } from '$lib/data/domainReading';
import type { DomainHolder } from './domainHolder';
import type { SupabaseClient } from '@supabase/supabase-js';

const writtenOutKinds: string[] = [domainPageKinds.glossary, domainPageKinds.rule, ...recordKinds];

export function noDomainYet(holder: DomainHolder): string {
	return `${holder.brainName} holds no domain yet: no bounded context has been filed. Set it with ${holder.setAction}.`;
}

/** The domain as Markdown: the context map, then each context with its records and their lifecycles, its groups and their members, other blocks with what each event marks and who reacts, its rules with their kinds and what they sit on, and its glossary. */
export async function describeDomain(
	supabase: SupabaseClient,
	holder: DomainHolder,
	domain: OrganisationDomain | null
): Promise<string> {
	if (domain === null) return noDomainYet(holder);
	const { model, contexts, contextMap, rules } = domain;
	const { relationships } = model;
	const { organisationId } = holder.scope;
	const bodies = await readBodiesByPageId(supabase, organisationId, writtenOutPageIds(domain));
	const counts = `${contexts.length} contexts, ${entitiesOf(model).length} entities, ${relationships.length} relationships, ${rules.length} rules`;
	const mapSection = contextMap === null ? [] : [contextMapSection(domain, bodies.get(contextMap.pageId) ?? '')];
	const contextSections = model.contexts.map((context) => describeContext(context, domain, bodies));
	return [`# ${holder.name} domain\n${counts}. Drawn at ${holder.address}.`, ...mapSection, ...contextSections].join('\n\n');
}

function contextMapSection({ areaRelationships }: OrganisationDomain, body: string): string {
	const rows = areaRelationships.length === 0 ? [] : ['### How the contexts relate', ...areaRelationships.map(relationshipLine)];
	return ['## Context map', body, ...rows].join('\n');
}

function writtenOutPageIds({ glossaries, contextMap }: OrganisationDomain): string[] {
	const mapIds = contextMap === null ? [] : [contextMap.pageId];
	const inProse = glossaries.filter(({ terms }) => terms.length === 0);
	return [...mapIds, ...inProse.map((glossary) => glossary.pageId)];
}

function describeContext(context: BoundedContext, domain: OrganisationDomain, bodies: Map<string, string>): string {
	const summary = domain.contexts.find((candidate) => candidate.slug === context.name);
	if (summary === undefined) return '';
	const inArea = <Listed extends { areaSlug: string }>(listed: Listed[]) => listed.filter((each) => each.areaSlug === summary.slug);
	const records = inArea(domain.things).filter((thing) => recordKinds.includes(thing.kind));
	const recordsWritten = records.flatMap((thing) => recordLines(thing, domain.things));
	const blocks = summary.blocks.filter((block) => !writtenOutKinds.includes(block.kind)).map((block) => blockLine(block, domain.things));
	const rules = inArea(domain.rules).map(ruleLine);
	const glossaries = inArea(domain.glossaries).map((glossary) => `### Glossary\n${glossaryText(glossary, bodies)}`);
	return [contextHeading(summary), summary.summary, ...recordsWritten, ...blocks, ...rules, ...glossaries].join('\n');
}

/** A building block as a line of Markdown, an event closed with what it marks and who reacts. */
function blockLine({ kind, title, summary, pageId }: DomainBlock, things: DomainThing[]): string {
	const event = things.find((thing) => thing.pageId === pageId && thing.kind === domainPageKinds.domainEvent);
	const eventFacts = event === undefined ? '' : eventSentences(event);
	return `- ${domainBlockNames[kind]}: ${title} — ${summary} (page id ${pageId})${eventFacts}`;
}

function glossaryText({ pageId, terms }: DomainGlossary, bodies: Map<string, string>): string {
	if (terms.length === 0) return bodies.get(pageId) ?? '';
	return terms.map(termLine).join('\n');
}
