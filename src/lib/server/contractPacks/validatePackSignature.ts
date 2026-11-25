import { contractPackSigningLimits as limits, type PackSignatureGiven } from '$lib/data/contractPackSigningRules';
import { validateRecordId } from '$lib/data/isUuid';

const isoDate = /^\d{4}-\d{2}-\d{2}$/;

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

function textRefusal(field: string, value: string, longest: number): string | null {
	const isWithinLimits = value !== '' && value.length <= longest;
	if (isWithinLimits) return null;
	return `${field} is 1 to ${longest} characters.`;
}

function dateRefusal(signedOn: string): string | null {
	const day = new Date(`${signedOn}T00:00:00Z`);
	const isDay = isoDate.test(signedOn) && !Number.isNaN(day.getTime());
	if (isDay) return null;
	return 'The date you sign is a day, such as 2026-11-25.';
}

function authorityRefusal(isAuthorisedToSign: unknown): string | null {
	const isConfirmed = isAuthorisedToSign === true || isAuthorisedToSign === 'on' || isAuthorisedToSign === 'true';
	if (isConfirmed) return null;
	return 'Confirm that you are authorised to sign for your organisation.';
}
