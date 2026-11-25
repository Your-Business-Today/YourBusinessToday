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
};

/** A client's contract pack as it is read: where it stands, what it chose, the documents it holds in order and the comments on them. */
export type ContractPack = {
	id: string;
	organisationId: string;
	stage: ContractPackStage;
	chosenClauses: string[];
	quoteVersion: number | null;
	preparedAt: string;
	viewedAt: string | null;
	documents: ContractPackDocument[];
	comments: ContractPackComment[];
};

/** The blanks still open, each in its brackets, as a person reads them. */
export function bracketedBlanks(labels: string[]): string {
	return labels.map((label) => `[${label}]`).join(', ');
}

/** Whether the client has signed every document of the pack. */
export function isSignedThroughout(pack: ContractPack): boolean {
	return pack.documents.every((document) => document.signature !== null);
}
