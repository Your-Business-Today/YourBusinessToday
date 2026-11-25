import type { ContractPackStage } from './contractPackRules';

/** A client contact's signature on one document, against the version they read. */
export type ContractPackSignature = { versionNumber: number; signerName: string; signerPosition: string; signedOn: string; signedAt: string };

/** A client contact's comment on a clause of one document. */
export type ContractPackComment = { documentId: string; clause: string; comment: string; madeAt: string };

/** One document of a client's pack: the organisation document it is kept as, the version it holds, the blanks still open and its signature. */
export type ContractPackDocument = {
	documentId: string;
	templateSlug: string;
	title: string;
	versionNumber: number;
	openBlanks: string[];
	signature: ContractPackSignature | null;
	signedCopyVersion: number | null;
};

/** A YBT director's countersignature on the whole pack, once the client has signed every document. */
export type ContractPackCountersignature = { signerName: string; signerPosition: string; signedOn: string; signedAt: string };

/** When the pack was last sent to the client, and the address it went to. */
export type ContractPackSending = { sentAt: string; sentTo: string };

/** A client's contract pack as it is read: where it stands, what it chose, the documents it holds in order and the comments on them. */
export type ContractPack = {
	id: string;
	organisationId: string;
	stage: ContractPackStage;
	chosenClauses: string[];
	quoteVersion: number | null;
	preparedAt: string;
	viewedAt: string | null;
	sending: ContractPackSending | null;
	countersignature: ContractPackCountersignature | null;
	documents: ContractPackDocument[];
	comments: ContractPackComment[];
};

/** Exactly what sending a pack does: the one email, to whom, about which documents, with the one link to the pack. */
export type PackSendingPlan = {
	packId: string;
	from: string;
	clientName: string;
	contact: { id: string; name: string; email: string };
	documents: { title: string; versionNumber: number }[];
	subject: string;
	packUrl: string;
};

/** The blanks still open, each in its brackets, as a person reads them. */
export function bracketedBlanks(labels: string[]): string {
	return labels.map((label) => `[${label}]`).join(', ');
}

/** Whether the client has signed every document of the pack. */
export function isSignedThroughout(pack: ContractPack): boolean {
	return pack.documents.every((document) => document.signature !== null);
}

const signedByClient: ContractPackStage = 'signed_by_client';

/** Whether the client has signed the whole pack and YBT has not countersigned it yet. */
export function isAwaitingCountersignature(pack: ContractPack): boolean {
	return pack.stage === signedByClient && pack.countersignature === null;
}
