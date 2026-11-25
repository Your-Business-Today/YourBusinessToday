import { isSignedThroughout, type ContractPack } from '$lib/data/contractPack';
import { moveContractPackOn } from './contractPackStages';
import { readContractPack } from './readContractPack';
import type { PackCommentGiven, PackSignatureGiven } from '$lib/data/contractPackSigningRules';
import type { SupabaseClient } from '@supabase/supabase-js';

/** The client contact taking a step on their pack: who they are, and the service key the portal writes with. */
export type PackClient = { service: SupabaseClient; contactId: string; accountId: string };

/** The client has opened the pack: the first time moves it to viewed, with when. */
export async function recordPackViewed({ service }: PackClient, pack: ContractPack): Promise<void> {
	if (pack.viewedAt !== null) return;
	await moveContractPackOn(service, pack.id, 'viewed', { viewed_at: new Date().toISOString() });
}

/** Keeps the client's comment on a clause, and the pack shows as commented. */
export async function keepPackComment(client: PackClient, pack: ContractPack, given: PackCommentGiven): Promise<void> {
	const { service, contactId, accountId } = client;
	const row = { pack_id: pack.id, document_id: given.documentId, clause: given.clause, comment: given.comment, contact_id: contactId, made_by: accountId };
	const { error } = await service.from('contract_pack_comments').insert(row);
	if (error !== null) throw error;
	await moveContractPackOn(service, pack.id, 'commented');
}

/** Keeps the client's signature on one document against the version they read; the last one moves the pack to signed by the client. */
export async function keepPackSignature(client: PackClient, pack: ContractPack, given: PackSignatureGiven): Promise<void> {
	const { service, contactId, accountId } = client;
	const row = {
		pack_id: pack.id,
		document_id: given.documentId,
		version_number: given.versionNumber,
		signer_name: given.signerName,
		signer_position: given.signerPosition,
		signed_on: given.signedOn,
		is_authorised_to_sign: true,
		contact_id: contactId,
		signed_by: accountId
	};
	const { error } = await service.from('contract_pack_signatures').insert(row);
	if (error !== null) throw error;
	const signed = await readContractPack(service, pack.organisationId, pack.id);
	const isSigned = signed !== null && isSignedThroughout(signed);
	if (isSigned) await moveContractPackOn(service, pack.id, 'signed_by_client');
}
