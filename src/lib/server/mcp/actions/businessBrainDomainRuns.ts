import { domainFiled, nothingTaught, unknownContext } from './businessBrainDomainAnswers';
import { describeDomainRun } from './describeDomainRun';
import { describeOrganisationDomain } from './describeOrganisationDomain';
import { fileOrganisationDomain } from '$lib/server/businessBrain/fileOrganisationDomain';
import { noSuchSource } from './businessBrainAnswers';
import { organisationDomainOf } from '$lib/server/businessBrain/organisationDomainOf';
import { getReachableProjectsOf } from '$lib/server/organisations/getReachableProjectsOf';
import { getSwitchedOnModules } from '$lib/server/organisations/getSwitchedOnModules';
import { readDomainPages } from '$lib/server/businessBrain/readDomainPages';
import { readDomainSources } from '$lib/server/businessBrain/readDomainSources';
import { readLatestCompanyContext } from '$lib/server/companyContext/readLatestCompanyContext';
import { validateDomainFiling } from '$lib/server/businessBrain/validateDomainFiling';
import type { DomainFilingGiven } from '$lib/data/businessBrainDomainRules';
import type { McpCaller } from '../resolveMcpCaller';
import type { Organisation } from '$lib/server/organisations/organisationRecord';

/** Files what one source teaches about the organisation's domain, once every value given fits. */
export async function fileDomain(caller: McpCaller, input: Record<string, unknown>, organisation: Organisation): Promise<string> {
	const filing = validateDomainFiling(input);
	if (typeof filing === 'string') return filing;
	if (isTeachingNothing(filing)) return nothingTaught;
	const filer = { organisationId: organisation.id, filerAccountId: caller.accountId };
	const done = await fileOrganisationDomain(caller.supabase, filer, filing);
	if (done === null) return noSuchSource;
	if ('unknownContextSlug' in done) return unknownContext(done.unknownContextSlug);
	return domainFiled(organisation, done);
}

function isTeachingNothing({ contexts, pages, retires }: DomainFilingGiven): boolean {
	return contexts.length + pages.length + retires.length === 0;
}

/** The organisation's domain as Markdown. */
export async function readDomain(caller: McpCaller, _input: Record<string, unknown>, organisation: Organisation): Promise<string> {
	const pages = await readDomainPages(caller.supabase, organisation.id);
	return describeOrganisationDomain(caller.supabase, organisation, organisationDomainOf(pages));
}

/** The walk a person's Claude follows to set the organisation's domain, fitted to what is held already. */
export async function startDomainRun(caller: McpCaller, _input: Record<string, unknown>, organisation: Organisation): Promise<string> {
	const { supabase, accountId } = caller;
	const [pages, sources, context, projects, switchedOn] = await Promise.all([
		readDomainPages(supabase, organisation.id),
		readDomainSources(supabase, organisation.id),
		readLatestCompanyContext(supabase, organisation.id),
		getReachableProjectsOf(supabase, accountId, organisation.id),
		getSwitchedOnModules(supabase, organisation.id)
	]);
	const products = projects.map(({ id, name }) => ({ id, name }));
	return describeDomainRun({ organisation, domain: organisationDomainOf(pages), sources, context, products, switchedOn });
}
