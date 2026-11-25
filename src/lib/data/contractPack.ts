import type { ContractPackStage } from './contractPackRules';

/** One document of a client's pack: the organisation document it is kept as, the version it holds and the blanks still open. */
export type ContractPackDocument = {
	documentId: string;
	templateSlug: string;
	title: string;
	versionNumber: number;
	openBlanks: string[];
};

/** A client's contract pack as it is read: where it stands, what it chose and the documents it holds, in order. */
export type ContractPack = {
	id: string;
	stage: ContractPackStage;
	chosenClauses: string[];
	quoteVersion: number | null;
	preparedAt: string;
	documents: ContractPackDocument[];
};

/** The blanks still open, each in its brackets, as a person reads them. */
export function bracketedBlanks(labels: string[]): string {
	return labels.map((label) => `[${label}]`).join(', ');
}
