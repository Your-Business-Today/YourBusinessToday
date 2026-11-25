import { documentOwnerKinds } from '$lib/projectDocuments/documentOwner';
import { findDocumentVersion, readVersionMarkdown } from '$lib/server/projectDocuments/findDocumentVersions';
import { contractPackDocumentTable } from './contractPackTables';
import { moveContractPackOn } from './contractPackStages';
import { documentsAwaitingCopy } from './countersignRefusals';
import { keepSignedCopy, type CopyKeeper } from './signedCopy/keepSignedCopy';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { ContractPack, ContractPackCountersignature, ContractPackDocument } from '$lib/data/contractPack';
import type { PackCountersignatureGiven } from '$lib/data/contractPackCountersigningRules';
import type { Organisation } from '$lib/server/organisations/organisationRecord';

/** The YBT director countersigning: their own client, the service key the files are kept with, who they are and whose pack. */
export type Countersigner = { supabase: SupabaseClient; service: SupabaseClient; accountId: string; organisation: Organisation };

/**
 * Keeps each document the client signed as a dated, signed PDF, the next version of that document on the client's
 * organisation, then keeps the countersignature on the pack and moves it to countersigned.
 */
export async function countersignContractPack(countersigner: Countersigner, pack: ContractPack, given: PackCountersignatureGiven): Promise<void> {
	const { supabase, service, accountId, organisation } = countersigner;
	const countersignature = { signerName: given.signerName, signerPosition: given.signerPosition, signedOn: given.signedOn, signedAt: new Date().toISOString() };
	const keeper: CopyKeeper = { supabase, service, adder: { owner: { kind: documentOwnerKinds.organisation, id: organisation.id }, accountId } };
	for (const document of documentsAwaitingCopy(pack)) {
		const versionNumber = await keepDocumentCopy(keeper, organisation.name, document, countersignature);
		await recordSignedCopy(supabase, pack.id, document.documentId, versionNumber);
	}
	await moveContractPackOn(supabase, pack.id, 'countersigned', countersignatureColumns(countersignature, accountId));
}

async function keepDocumentCopy(keeper: CopyKeeper, clientName: string, document: ContractPackDocument, countersignature: ContractPackCountersignature): Promise<number> {
	const { documentId, title, signature } = document;
	if (signature === null) throw new Error(`${title} is not signed by the client.`);
	const markdown = await readSignedText(keeper.supabase, documentId, signature.versionNumber);
	const copy = { title, clientName, versionNumber: signature.versionNumber, markdown, clientSignature: signature, countersignature };
	return keepSignedCopy(keeper, documentId, copy);
}

async function readSignedText(supabase: SupabaseClient, documentId: string, versionNumber: number): Promise<string> {
	const version = await findDocumentVersion(supabase, documentId, versionNumber);
	if (version === null) throw new Error(`Version ${versionNumber} of document ${documentId} is not kept.`);
	return readVersionMarkdown(supabase, version);
}

async function recordSignedCopy(supabase: SupabaseClient, packId: string, documentId: string, versionNumber: number): Promise<void> {
	const { error } = await supabase
		.from(contractPackDocumentTable)
		.update({ signed_copy_version: versionNumber })
		.eq('pack_id', packId)
		.eq('document_id', documentId);
	if (error !== null) throw error;
}

function countersignatureColumns(countersignature: ContractPackCountersignature, accountId: string): Record<string, string> {
	return {
		countersigner_name: countersignature.signerName,
		countersigner_position: countersignature.signerPosition,
		countersigned_on: countersignature.signedOn,
		countersigned_at: countersignature.signedAt,
		countersigned_by: accountId
	};
}
