import type { SupabaseClient } from '@supabase/supabase-js';
import { domainOfWebsite, isDomainOfSite } from '$lib/data/emailDomains';
import { literalInLike } from '$lib/server/schema/likePattern';
import { toEmailCompany } from './findPeopleByEmail';
import type { EmailCompany } from './emailOwner';

/** A client or lead together with the site its website points at. */
export type ClientWithSite = EmailCompany & { siteDomain: string };

type ClientRow = { id: string; name: string; lifecycle_stage: string; website: string };

/** The clients whose website's text names one of the domains, each with the site it points at. */
export async function findClientsByDomain(supabase: SupabaseClient, domains: string[]): Promise<ClientWithSite[]> {
	if (domains.length === 0) return [];
	const anyOfTheDomains = domains.map((domain) => `website.ilike.%${literalInLike(domain)}%`).join(',');
	const { data, error } = await supabase.from('clients').select('id, name, lifecycle_stage, website').or(anyOfTheDomains);
	if (error) throw error;
	return (data as ClientRow[]).map(toClientWithSite);
}

/** The clients whose site the email domain belongs to, never one whose website only mentions the domain. */
export function clientsAtDomain(clients: ClientWithSite[], emailDomain: string): EmailCompany[] {
	return clients.filter(({ siteDomain }) => isDomainOfSite(emailDomain, siteDomain)).map(({ id, name, stage }) => ({ id, name, stage }));
}

function toClientWithSite(row: ClientRow): ClientWithSite {
	return { ...toEmailCompany(row), siteDomain: domainOfWebsite(row.website) };
}
