import { isContinuityCopyRecorded, type ClientStanding } from '$lib/data/clientDeletion';
import { isSchemaNotYetMigrated } from '$lib/server/schema/schemaNotYetMigrated';
import type { Client } from './clientRecord';
import type { SupabaseClient } from '@supabase/supabase-js';

type ClientLink = { table: string; column: string };

const links = {
	projects: { table: 'projects', column: 'client_id' },
	invoices: { table: 'invoices', column: 'client_id' },
	groupedCompanies: { table: 'clients', column: 'parent_client_id' }
} satisfies Record<string, ClientLink>;

/**
 * What the client holds that keeps it on the register, read past row level security with the
 * service client, so a project or invoice the signed-in person cannot see still counts.
 */
export async function readClientStanding(service: SupabaseClient, client: Client): Promise<ClientStanding> {
	const [projectCount, invoiceCount, groupedCompanyCount] = await Promise.all([
		countRowsNaming(service, links.projects, client.id),
		countRowsNaming(service, links.invoices, client.id),
		countRowsNaming(service, links.groupedCompanies, client.id)
	]);
	const hasContinuityCopy = isContinuityCopyRecorded(client.continuityCopy);
	return { projectCount, invoiceCount, groupedCompanyCount, hasContinuityCopy };
}

async function countRowsNaming(service: SupabaseClient, link: ClientLink, clientId: string): Promise<number> {
	const { count, error } = await service
		.from(link.table)
		.select('id', { count: 'exact', head: true })
		.eq(link.column, clientId);
	if (error === null) return count ?? 0;
	const isTableAbsent = isSchemaNotYetMigrated(error);
	if (isTableAbsent) return 0;
	throw error;
}
