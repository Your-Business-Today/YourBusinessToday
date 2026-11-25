import type { ContractPack, ContractPackDocument } from '$lib/data/contractPack';
import type { PackSignatureGiven } from '$lib/data/contractPackSigningRules';

const notInPack = 'That document is not in your contract pack.';

/** The document of the pack a client's step names, or null when the pack does not hold it. */
export function documentInPack(pack: ContractPack, documentId: string): ContractPackDocument | null {
	return pack.documents.find((document) => document.documentId === documentId) ?? null;
}

/** Why a comment cannot be kept on the pack; null when it can. */
export function commentRefusal(pack: ContractPack, documentId: string): string | null {
	if (documentInPack(pack, documentId) === null) return notInPack;
	return null;
}

/** Why a signature cannot be kept: the document is not in the pack, is signed already, or has changed since it was read. */
export function signatureRefusal(pack: ContractPack, given: PackSignatureGiven): string | null {
	const document = documentInPack(pack, given.documentId);
	if (document === null) return notInPack;
	if (document.signature !== null) return `${document.title} is signed already.`;
	if (document.versionNumber === given.versionNumber) return null;
	return `${document.title} has changed since you opened it: it is now version ${document.versionNumber}. Read it again, then sign.`;
}
