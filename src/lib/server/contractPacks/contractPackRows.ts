import type { ContractPackStage } from '$lib/data/contractPackRules';

/** The columns a pack is read with: its own, its documents with the organisation document each is kept as, their signatures and the comments. */
export const packColumns =
	'id, organisation_id, stage, chosen_clauses, quote_version, prepared_at, viewed_at, sent_at, sent_to, ' +
	'countersigner_name, countersigner_position, countersigned_on, countersigned_at, ' +
	'contract_pack_documents (position, template_slug, document_id, signed_copy_version, project_documents (title, version_number, markdown)), ' +
	'contract_pack_signatures (document_id, version_number, signer_name, signer_position, signed_on, signed_at), ' +
	'contract_pack_comments (document_id, clause, comment, made_at)';

export type KeptDocumentRow = { title: string; version_number: number; markdown: string | null };
export type PackDocumentRow = {
	position: number;
	template_slug: string;
	document_id: string;
	signed_copy_version: number | null;
	project_documents: KeptDocumentRow;
};
export type SignatureRow = { document_id: string; version_number: number; signer_name: string; signer_position: string; signed_on: string; signed_at: string };
export type CommentRow = { document_id: string; clause: string; comment: string; made_at: string };

export type PackRow = {
	id: string;
	organisation_id: string;
	stage: ContractPackStage;
	chosen_clauses: string[];
	quote_version: number | null;
	prepared_at: string;
	viewed_at: string | null;
	sent_at: string | null;
	sent_to: string | null;
	countersigner_name: string | null;
	countersigner_position: string | null;
	countersigned_on: string | null;
	countersigned_at: string | null;
	contract_pack_documents: PackDocumentRow[];
	contract_pack_signatures: SignatureRow[];
	contract_pack_comments: CommentRow[];
};
