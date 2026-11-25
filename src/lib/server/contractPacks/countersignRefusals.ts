import { contractPackStageWords } from '$lib/data/contractPackRules';
import { isAwaitingCountersignature, type ContractPack, type ContractPackDocument } from '$lib/data/contractPack';

/** Why YBT cannot countersign the pack yet: it is countersigned already, the client has not signed it all, or a document has changed since. */
export function countersignRefusal(pack: ContractPack): string | null {
	if (pack.countersignature !== null) return 'This pack is countersigned already.';
	if (!isAwaitingCountersignature(pack)) return `The client has not signed every document yet: the pack is ${contractPackStageWords[pack.stage].toLowerCase()}.`;
	const changed = pack.documents.map(changedSinceSigned).find((refusal) => refusal !== null);
	return changed ?? null;
}

/** The documents whose signed copy is still to be kept: all of them, but any kept by a countersigning that stopped part way. */
export function documentsAwaitingCopy(pack: ContractPack): ContractPackDocument[] {
	return pack.documents.filter((document) => document.signedCopyVersion === null);
}

function changedSinceSigned(document: ContractPackDocument): string | null {
	const { signature, title, versionNumber } = document;
	if (signature === null) return `${title} is not signed by the client yet.`;
	const isCopyKept = document.signedCopyVersion !== null;
	const isAsSigned = versionNumber === signature.versionNumber;
	if (isCopyKept || isAsSigned) return null;
	return `${title} has changed since the client signed version ${signature.versionNumber}: it is now version ${versionNumber}, so the client signs it again first.`;
}
