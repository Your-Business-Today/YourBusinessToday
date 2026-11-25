import { contractPackSection, type ContractPackRequest } from '$lib/data/contractPackRules';
import { documentOwnerKinds } from '$lib/projectDocuments/documentOwner';
import { defaultDocumentFlow, defaultDocumentStatus } from '$lib/projectDocuments/documentStanding';
import { keepWrittenDocument } from '$lib/server/projectDocuments/keepProjectDocument';
import { readLeadQuote } from '$lib/server/leadQuotes/readLeadQuote';
import { contractPackValues } from './contractPackValues';
import { draftContractDocuments, type DraftedContractDocument } from './draftContractDocuments';
import { insertContractPack, insertPackDocuments, findClientIdForOrganisation, type KeptPackDocument } from './contractPackTables';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { DocumentAdder } from '$lib/server/projectDocuments/documentAdder';
import type { DocumentDetails } from '$lib/projectDocuments/projectDocument';
import type { Organisation } from '$lib/server/organisations/organisationRecord';

/** Who prepares a pack, and the client organisation it is for, already reached. */
export type PackPreparer = { supabase: SupabaseClient; accountId: string; organisation: Organisation };

/**
 * Drafts each chosen template for the client, keeps each as a written document on its organisation, and keeps the
 * pack that holds them, drafted. Gives the pack's id.
 */
export async function prepareContractPack(preparer: PackPreparer, request: ContractPackRequest): Promise<string> {
	const { documentSlugs, clauseSlugs, writtenValues } = request;
	const { supabase, accountId, organisation } = preparer;
	const clientId = await findClientIdForOrganisation(supabase, organisation.id);
	const quote = clientId === null ? null : await readLeadQuote(supabase, clientId);
	const values = contractPackValues(organisation, quote, writtenValues);
	const drafted = draftContractDocuments(documentSlugs, clauseSlugs, values);
	const packId = await insertContractPack(supabase, { organisationId: organisation.id, clauseSlugs, quoteVersion: quote?.version ?? null, accountId });
	const adder: DocumentAdder = { owner: { kind: documentOwnerKinds.organisation, id: organisation.id }, accountId };
	const kept = await keepEachDocument(supabase, adder, drafted);
	await insertPackDocuments(supabase, packId, kept);
	return packId;
}

async function keepEachDocument(supabase: SupabaseClient, adder: DocumentAdder, drafted: DraftedContractDocument[]): Promise<KeptPackDocument[]> {
	const kept: KeptPackDocument[] = [];
	for (const [index, document] of drafted.entries()) {
		const details = packDocumentDetails(document, index + 1);
		kept.push({ documentId: await keepWrittenDocument(supabase, adder, details, document.markdown), drafted: document });
	}
	return kept;
}

function packDocumentDetails({ title, summary }: DraftedContractDocument, position: number): DocumentDetails {
	return { title, summary, section: contractPackSection, position, status: defaultDocumentStatus, flow: defaultDocumentFlow };
}
