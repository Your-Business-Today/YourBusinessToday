import { isSchemaNotYetMigrated } from '$lib/server/schema/schemaNotYetMigrated';
import { contractPackTable } from './contractPackTables';
import { packColumns, type PackRow } from './contractPackRows';
import { parseContractPack } from './parseContractPack';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { ContractPack } from '$lib/data/contractPack';

const stillBeingDrafted = 'drafted';

/**
 * The latest pack sent to the client a portal contact is at: a pack YBT is still drafting is not theirs to see.
 * A contact is not on the organisation, so this is read with the service key, by the client their contact row names.
 */
export async function findPortalContractPack(service: SupabaseClient, clientId: string): Promise<ContractPack | null> {
	const organisationIds = await findOrganisationsForClient(service, clientId);
	if (organisationIds.length === 0) return null;
	const { data, error } = await service
		.from(contractPackTable)
		.select(packColumns)
		.in('organisation_id', organisationIds)
		.neq('stage', stillBeingDrafted)
		.order('prepared_at', { ascending: false })
		.limit(1)
		.maybeSingle();
	if (isSchemaNotYetMigrated(error)) return null;
	if (error) throw error;
	if (data === null) return null;
	return parseContractPack(data as unknown as PackRow);
}

async function findOrganisationsForClient(service: SupabaseClient, clientId: string): Promise<string[]> {
	const { data, error } = await service.from('organisations').select('id').eq('client_id', clientId);
	if (error) throw error;
	return data.map((row) => row.id as string);
}

/** The text of one document of the pack as it stands now, to read and sign; null when the pack does not hold it. */
export async function readPackDocumentText(service: SupabaseClient, pack: ContractPack, documentId: string): Promise<string | null> {
	const isInPack = pack.documents.some((document) => document.documentId === documentId);
	if (!isInPack) return null;
	const { data, error } = await service.from('project_documents').select('markdown').eq('id', documentId).maybeSingle();
	if (error) throw error;
	return (data?.markdown as string | null) ?? null;
}
