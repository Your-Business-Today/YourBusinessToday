import { blanksIn } from '$lib/data/contractBlanks';
import { isSchemaNotYetMigrated } from '$lib/server/schema/schemaNotYetMigrated';
import { contractPackTable } from './contractPackTables';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { ContractPack, ContractPackDocument } from '$lib/data/contractPack';
import type { ContractPackStage } from '$lib/data/contractPackRules';

const packColumns =
	'id, stage, chosen_clauses, quote_version, prepared_at, ' +
	'contract_pack_documents (position, template_slug, document_id, project_documents (title, version_number, markdown))';

type KeptDocumentRow = { title: string; version_number: number; markdown: string | null };
type PackDocumentRow = { position: number; template_slug: string; document_id: string; project_documents: KeptDocumentRow };
type PackRow = {
	id: string;
	stage: ContractPackStage;
	chosen_clauses: string[];
	quote_version: number | null;
	prepared_at: string;
	contract_pack_documents: PackDocumentRow[];
};

/** The organisation's latest contract pack, or the one named; null when it has none or the tables are not there yet. */
export async function readContractPack(supabase: SupabaseClient, organisationId: string, packId: string | null = null): Promise<ContractPack | null> {
	const query = supabase.from(contractPackTable).select(packColumns).eq('organisation_id', organisationId);
	const chosen = packId === null ? query.order('prepared_at', { ascending: false }) : query.eq('id', packId);
	const { data, error } = await chosen.limit(1).maybeSingle();
	if (isSchemaNotYetMigrated(error)) return null;
	if (error) throw error;
	if (data === null) return null;
	return parsePack(data as unknown as PackRow);
}

function parsePack(row: PackRow): ContractPack {
	const documents = [...row.contract_pack_documents].sort((left, right) => left.position - right.position);
	return {
		id: row.id,
		stage: row.stage,
		chosenClauses: row.chosen_clauses,
		quoteVersion: row.quote_version,
		preparedAt: row.prepared_at,
		documents: documents.map(parseDocument)
	};
}

function parseDocument({ template_slug, document_id, project_documents: kept }: PackDocumentRow): ContractPackDocument {
	return {
		documentId: document_id,
		templateSlug: template_slug,
		title: kept.title,
		versionNumber: kept.version_number,
		openBlanks: blanksIn(kept.markdown ?? '')
	};
}
