import type { SupabaseClient } from '@supabase/supabase-js';
import type { DraftedContractDocument } from './draftContractDocuments';

/** The tables a pack and its documents are kept in (migration 0284). */
export const contractPackTable = 'contract_packs';
export const contractPackDocumentTable = 'contract_pack_documents';

/** What a pack is kept with when it is prepared: whose it is, the clauses chosen, the quote its fees came from and who prepared it. */
export type PackPrepared = { organisationId: string; clauseSlugs: string[]; quoteVersion: number | null; accountId: string };

/** Keeps a new pack, drafted, and gives its id. */
export async function insertContractPack(supabase: SupabaseClient, pack: PackPrepared): Promise<string> {
	const row = {
		organisation_id: pack.organisationId,
		chosen_clauses: pack.clauseSlugs,
		quote_version: pack.quoteVersion,
		prepared_by: pack.accountId
	};
	const { data, error } = await supabase.from(contractPackTable).insert(row).select('id').single();
	if (error !== null) throw error;
	return data.id as string;
}

/** Puts the kept documents in the pack, in the order they were drafted. */
export async function insertPackDocuments(supabase: SupabaseClient, packId: string, kept: KeptPackDocument[]): Promise<void> {
	const rows = kept.map(({ documentId, drafted }, index) => ({
		pack_id: packId,
		document_id: documentId,
		template_slug: drafted.templateSlug,
		position: index + 1
	}));
	const { error } = await supabase.from(contractPackDocumentTable).insert(rows);
	if (error !== null) throw error;
}

/** A drafted document and the organisation document it is kept as. */
export type KeptPackDocument = { documentId: string; drafted: DraftedContractDocument };

/** The client register record an organisation was opened for, whose quote the pack's fees come from; null when none. */
export async function findClientIdForOrganisation(supabase: SupabaseClient, organisationId: string): Promise<string | null> {
	const { data, error } = await supabase.from('organisations').select('client_id').eq('id', organisationId).maybeSingle();
	if (error !== null) throw error;
	return (data?.client_id as string | null) ?? null;
}
