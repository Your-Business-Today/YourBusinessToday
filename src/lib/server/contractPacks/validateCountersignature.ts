import { contractPackSigningLimits as limits } from '$lib/data/contractPackSigningRules';
import { validateRecordId } from '$lib/data/isUuid';
import { dateRefusal, textRefusal } from './signatureFieldRefusals';
import type { PackCountersignatureGiven } from '$lib/data/contractPackCountersigningRules';

/** The countersignature as given, each value within its column's limit, or why not, naming the field. */
export function validateCountersignature(input: Record<string, unknown>): PackCountersignatureGiven | string {
	const packId = String(input.packId ?? '').trim();
	const idRefusal = validateRecordId('packId', packId);
	if (idRefusal !== null) return idRefusal;
	const signerName = String(input.signerName ?? '').trim();
	const signerPosition = String(input.signerPosition ?? '').trim();
	const signedOn = String(input.signedOn ?? '').trim();
	const refusals = [
		textRefusal('Your name', signerName, limits.longestSignerName),
		textRefusal('Your position', signerPosition, limits.longestSignerPosition),
		dateRefusal(signedOn)
	];
	const refusal = refusals.find((reason) => reason !== null);
	if (refusal !== undefined && refusal !== null) return refusal;
	return { packId, signerName, signerPosition, signedOn };
}
