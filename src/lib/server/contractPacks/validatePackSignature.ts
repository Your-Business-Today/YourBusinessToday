import { contractPackSigningLimits as limits, type PackSignatureGiven } from '$lib/data/contractPackSigningRules';
import { validateRecordId } from '$lib/data/isUuid';
import { dateRefusal, textRefusal } from './signatureFieldRefusals';

/** The signature as given, each value within its column's limit and the authority confirmed, or why not, naming the field. */
export function validatePackSignature(input: Record<string, unknown>): PackSignatureGiven | string {
	const documentId = String(input.documentId ?? '').trim();
	const idRefusal = validateRecordId('documentId', documentId);
	if (idRefusal !== null) return idRefusal;
	const versionNumber = Number(input.versionNumber);
	const isVersion = Number.isInteger(versionNumber) && versionNumber >= 1 && versionNumber <= limits.highestVersion;
	if (!isVersion) return 'The version is the whole number of the version you read.';
	const signerName = String(input.signerName ?? '').trim();
	const signerPosition = String(input.signerPosition ?? '').trim();
	const signedOn = String(input.signedOn ?? '').trim();
	const refusals = [
		textRefusal('Your name', signerName, limits.longestSignerName),
		textRefusal('Your position', signerPosition, limits.longestSignerPosition),
		dateRefusal(signedOn),
		authorityRefusal(input.isAuthorisedToSign)
	];
	const refusal = refusals.find((reason) => reason !== null);
	if (refusal !== undefined && refusal !== null) return refusal;
	return { documentId, versionNumber, signerName, signerPosition, signedOn };
}

function authorityRefusal(isAuthorisedToSign: unknown): string | null {
	const isConfirmed = isAuthorisedToSign === true || isAuthorisedToSign === 'on' || isAuthorisedToSign === 'true';
	if (isConfirmed) return null;
	return 'Confirm that you are authorised to sign for your organisation.';
}
