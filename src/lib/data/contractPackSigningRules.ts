/** The limits on a client's comment and signature, mirrored by the checks on migration 0285's columns. */
export const contractPackSigningLimits = {
	longestClause: 80,
	longestComment: 4000,
	longestSignerName: 120,
	longestSignerPosition: 120,
	highestVersion: 9999
} as const;

/** A comment on a clause of one document, as the client gives it. */
export type PackCommentGiven = { documentId: string; clause: string; comment: string };

/** A signature on one document, as the client gives it: the version they read, who they are and the day they sign. */
export type PackSignatureGiven = { documentId: string; versionNumber: number; signerName: string; signerPosition: string; signedOn: string };

/** The names of the portal's signing form fields, read by the form and by the door behind it. */
export const packSigningFields = {
	documentId: 'documentId',
	clause: 'clause',
	comment: 'comment',
	versionNumber: 'versionNumber',
	signerName: 'signerName',
	signerPosition: 'signerPosition',
	signedOn: 'signedOn',
	isAuthorisedToSign: 'isAuthorisedToSign'
} as const;
