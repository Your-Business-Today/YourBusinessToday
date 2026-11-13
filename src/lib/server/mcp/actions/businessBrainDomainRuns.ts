import { domainFiled, filingGapAnswer, nothingTaught } from './businessBrainDomainAnswers';
import { describeDomainRun } from './describeDomainRun';
import { describeDomain } from './describeDomain';
import { fileDomainFromSource } from '$lib/server/businessBrain/fileDomainFromSource';
import { noSuchSource } from './businessBrainAnswers';
import { organisationDomainHolder } from './domainHolder';
import { organisationDomainOf } from '$lib/server/businessBrain/organisationDomainOf';
import { getReachableProjectsOf } from '$lib/server/organisations/getReachableProjectsOf';
import { getSwitchedOnModules } from '$lib/server/organisations/getSwitchedOnModules';
import { readDomainPages } from '$lib/server/businessBrain/readDomainPages';
import { readDomainSources } from '$lib/server/businessBrain/readDomainSources';
import { readDomainWords } from '$lib/server/businessBrain/readDomainWords';
import { thingsOnNoTaskSection } from './mapDomainJoinSections';
import { readTodaysWorkflowMap } from '$lib/server/workflowMap/readTodaysWorkflowMap';
import { validateDomainFiling } from '$lib/server/businessBrain/validateDomainFiling';
import type { DomainFilingGiven } from '$lib/data/businessBrainDomainRules';
import type { McpCaller } from '../resolveMcpCaller';
import type { Organisation } from '$lib/server/organisations/organisationRecord';

/** Files what one source teaches about the organisation's own domain, once every value given fits. */
export async function fileDomain(caller: McpCaller, input: Record<string, unknown>, organisation: Organisation): Promise<string> {
	const holder = organisationDomainHolder(organisation);
	const filing = validateDomainFiling(input);
	if (typeof filing === 'string') return filing;
	if (isTeachingNothing(filing)) return nothingTaught;
	const filer = { ...holder.scope, filerAccountId: caller.accountId };
	const done = await fileDomainFromSource(caller.supabase, filer, filing);
	if (done === null) return noSuchSource;
	if (!('sourceId' in done)) return filingGapAnswer(holder, done);
	return domainFiled(holder, done);
}

function isTeachingNothing({ contexts, pages, retires }: DomainFilingGiven): boolean {
	return contexts.length + pages.length + retires.length === 0;
}

/** The organisation's own domain as Markdown. */
export async function readDomain(caller: McpCaller, _input: Record<string, unknown>, organisation: Organisation): Promise<string> {
	const holder = organisationDomainHolder(organisation);
	const pages = await readDomainPages(caller.supabase, holder.scope);
	const domain = organisationDomainOf(pages);
	const described = await describeDomain(caller.supabase, holder, domain);
	if (domain === null) return described;
	const [words, map] = await Promise.all([
		readDomainWords(caller.supabase, organisation.id, domain.glossaries),
		readTodaysWorkflowMap(caller.supabase, organisation.id)
	]);
	return [described, thingsOnNoTaskSection(map, { things: domain.things, words })].join('\n\n');
}

/**
 * The walk a person's Claude follows to set the organisation's domain, fitted to what is held already. The caller's
 * client is the service client and the module gate has checked access, so today's map is read past its row level security.
 */
export async function startDomainRun(caller: McpCaller, _input: Record<string, unknown>, organisation: Organisation): Promise<string> {
	const { supabase, accountId } = caller;
	const { scope } = organisationDomainHolder(organisation);
	const [map, pages, sources, projects, switchedOn] = await Promise.all([
		readTodaysWorkflowMap(supabase, organisation.id),
		readDomainPages(supabase, scope),
		readDomainSources(supabase, scope),
		getReachableProjectsOf(supabase, accountId, organisation.id),
		getSwitchedOnModules(supabase, organisation.id)
	]);
	const products = projects.map(({ id, name }) => ({ id, name }));
	const domain = organisationDomainOf(pages);
	const words = domain === null ? [] : await readDomainWords(supabase, organisation.id, domain.glossaries);
	return describeDomainRun({ organisation, map, domain, words, sources, products, switchedOn });
}
