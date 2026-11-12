import { brainOf } from './businessBrainAnswers';
import { domainRunActionName } from './domainRunActionName';
import { describeAggregates } from './describeBlueprint';
import { domainAddressOf } from './businessBrainDomainAnswers';
import { domainBlockNames, domainPageKinds } from '$lib/data/businessBrainDomain';
import { entitiesOf, type BoundedContext } from '$lib/data/blueprint/domainModel';
import { readBodiesByPageId } from '$lib/server/businessBrain/readBodiesByPageId';
import type { DomainBlock, DomainContextSummary, OrganisationDomain } from '$lib/data/organisationDomain';
import type { Organisation } from '$lib/server/organisations/organisationRecord';
import type { SupabaseClient } from '@supabase/supabase-js';

export function noDomainYet(organisation: Organisation): string {
	return `${brainOf(organisation)} holds no domain yet: no bounded context has been filed. Set it with ${domainRunActionName}.`;
}

/** The domain as Markdown: the context map, then each context with its aggregates, entities, other blocks and glossary. */
export async function describeOrganisationDomain(
	supabase: SupabaseClient,
	organisation: Organisation,
	domain: OrganisationDomain | null
): Promise<string> {
	if (domain === null) return noDomainYet(organisation);
	const { model, contexts, contextMap } = domain;
	const bodies = await readBodiesByPageId(supabase, organisation.id, writtenOutPageIds(domain));
	const { relationships } = model;
	const counts = `${contexts.length} contexts, ${entitiesOf(model).length} entities, ${relationships.length} relationships`;
	const mapSection = contextMap === null ? [] : [`## Context map\n${bodies.get(contextMap.pageId) ?? ''}`];
	const contextSections = model.contexts.map((context) => describeContext(context, contexts, bodies));
	return [`# ${organisation.name} domain\n${counts}. Drawn at ${domainAddressOf(organisation)}.`, ...mapSection, ...contextSections].join('\n\n');
}

function writtenOutPageIds({ contexts, contextMap }: OrganisationDomain): string[] {
	const glossaries = contexts.flatMap((context) => context.blocks).filter((block) => block.kind === domainPageKinds.glossary);
	const mapIds = contextMap === null ? [] : [contextMap.pageId];
	return [...mapIds, ...glossaries.map((glossary) => glossary.pageId)];
}

function describeContext(context: BoundedContext, summaries: DomainContextSummary[], bodies: Map<string, string>): string {
	const summary = summaries.find((candidate) => candidate.slug === context.name);
	if (summary === undefined) return '';
	const core = summary.isCoreDomain ? ' — the core domain' : '';
	const blocks = summary.blocks.filter((block) => block.kind !== domainPageKinds.glossary).map(blockLine);
	const glossaries = summary.blocks.filter((block) => block.kind === domainPageKinds.glossary).map((glossary) => `### Glossary\n${bodies.get(glossary.pageId) ?? ''}`);
	return [`## ${summary.title} (${summary.slug})${core}`, summary.summary, ...describeAggregates(context), ...blocks, ...glossaries].join('\n');
}

function blockLine({ kind, title, summary, pageId }: DomainBlock): string {
	return `- ${domainBlockNames[kind]}: ${title} — ${summary} (page id ${pageId})`;
}
