import { filenameWordsOf } from '$lib/server/projectDocuments/projectDocumentFiles';
import type { ContractPackCountersignature, ContractPackSignature } from '$lib/data/contractPack';

/** One document of a pack as it is signed by both sides: the text the client signed, and each side's signature. */
export type SignedCopy = {
	title: string;
	clientName: string;
	versionNumber: number;
	markdown: string;
	clientSignature: ContractPackSignature;
	countersignature: ContractPackCountersignature;
};

export const signedCopyType = 'application/pdf';

const pdfExtension = '.pdf';

/** The name the signed copy downloads under: its title, the version signed and that it is signed. */
export function signedCopyFilename({ title, versionNumber }: SignedCopy): string {
	return `${filenameWordsOf(`${title} version ${versionNumber} signed`)}${pdfExtension}`;
}
