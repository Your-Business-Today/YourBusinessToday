import { blanksIn } from '$lib/data/contractBlanks';
import type {
	ContractPack,
	ContractPackComment,
	ContractPackCountersignature,
	ContractPackDocument,
	ContractPackSending,
	ContractPackSignature
} from '$lib/data/contractPack';
import type { CommentRow, PackDocumentRow, PackRow, SignatureRow } from './contractPackRows';

/** A pack as its row and the rows under it give it, documents in order and comments oldest first. */
export function parseContractPack(row: PackRow): ContractPack {
	const documents = [...row.contract_pack_documents].sort((left, right) => left.position - right.position);
	const signatures = row.contract_pack_signatures ?? [];
	const comments = [...(row.contract_pack_comments ?? [])].sort((left, right) => left.made_at.localeCompare(right.made_at));
	return {
		id: row.id,
		organisationId: row.organisation_id,
		stage: row.stage,
		chosenClauses: row.chosen_clauses,
		quoteVersion: row.quote_version,
		preparedAt: row.prepared_at,
		viewedAt: row.viewed_at,
		sending: parseSending(row),
		countersignature: parseCountersignature(row),
		documents: documents.map((document) => parseDocument(document, signatures)),
		comments: comments.map(parseComment)
	};
}

function parseDocument(row: PackDocumentRow, signatures: SignatureRow[]): ContractPackDocument {
	const { template_slug, document_id, signed_copy_version, project_documents: kept } = row;
	const signature = signatures.find((candidate) => candidate.document_id === document_id) ?? null;
	return {
		documentId: document_id,
		templateSlug: template_slug,
		title: kept.title,
		versionNumber: kept.version_number,
		openBlanks: blanksIn(kept.markdown ?? ''),
		signature: signature === null ? null : parseSignature(signature),
		signedCopyVersion: signed_copy_version ?? null
	};
}

function parseSending({ sent_at, sent_to }: PackRow): ContractPackSending | null {
	if (sent_at === null || sent_to === null) return null;
	return { sentAt: sent_at, sentTo: sent_to };
}

function parseCountersignature(row: PackRow): ContractPackCountersignature | null {
	const { countersigner_name, countersigner_position, countersigned_on, countersigned_at } = row;
	if (countersigner_name === null || countersigner_position === null) return null;
	if (countersigned_on === null || countersigned_at === null) return null;
	return { signerName: countersigner_name, signerPosition: countersigner_position, signedOn: countersigned_on, signedAt: countersigned_at };
}

function parseSignature(row: SignatureRow): ContractPackSignature {
	return {
		versionNumber: row.version_number,
		signerName: row.signer_name,
		signerPosition: row.signer_position,
		signedOn: row.signed_on,
		signedAt: row.signed_at
	};
}

function parseComment(row: CommentRow): ContractPackComment {
	return { documentId: row.document_id, clause: row.clause, comment: row.comment, madeAt: row.made_at };
}
