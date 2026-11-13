import { contextHeading, relationshipLine, termLine } from './describeDomainLines';
import { describeAggregates } from './describeBlueprint';
import { domainBlockNames, domainPageKinds } from '$lib/data/businessBrainDomain';
import { entitiesOf, type BoundedContext } from '$lib/data/blueprint/domainModel';
import { readBodiesByPageId } from '$lib/server/businessBrain/readBodiesByPageId';
import type { DomainBlock, OrganisationDomain } from '$lib/data/organisationDomain';
import type { DomainGlossary, DomainRule } from '$lib/data/domainReading';
import type { DomainHolder } from './domainHolder';
import type { SupabaseClient } from '@supabase/supabase-js';

const writtenOutKinds: string[] = [domainPageKinds.glossary, domainPageKinds.rule];

export function noDomainYet(holder: DomainHolder): string {
	return `${holder.brainName} holds no domain yet: no bounded context has been filed. Set it with ${holder.setAction}.`;
}

/** The domain as Markdown: the context map, then each context with its aggregates, entities, other blocks, rules and glossary. */
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
	const blocks = summary.blocks.filter((block) => !writtenOutKinds.includes(block.kind)).map(blockLine);
	const rules = inArea(domain.rules).map(ruleLine);
	const glossaries = inArea(domain.glossaries).map((glossary) => `### Glossary\n${glossaryText(glossary, bodies)}`);
	return [contextHeading(summary), summary.summary, ...describeAggregates(context), ...blocks, ...rules, ...glossaries].join('\n');
}

function blockLine({ kind, title, summary, pageId }: DomainBlock): string {
	return `- ${domainBlockNames[kind]}: ${title} — ${summary} (page id ${pageId})`;
}

function ruleLine({ title, slug, governs, pageId }: DomainRule): string {
	return `- Rule: ${title} (${slug}, governs ${governs.join(', ')}; page id ${pageId})`;
}

function glossaryText({ pageId, terms }: DomainGlossary, bodies: Map<string, string>): string {
	if (terms.length === 0) return bodies.get(pageId) ?? '';
	return terms.map(termLine).join('\n');
}
