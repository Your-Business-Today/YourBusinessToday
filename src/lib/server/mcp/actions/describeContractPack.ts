import { contractPackStageWords } from '$lib/data/contractPackRules';
import { formatUkDateTime } from '$lib/data/britishDate';
import { organisationDocumentNames } from './documentHomes';
import { bracketedBlanks, type ContractPack, type ContractPackDocument } from '$lib/data/contractPack';

/** A client's pack as the connector tells it: where it stands, what it chose, and each document with the blanks still open. */
export function describeContractPack(clientName: string, pack: ContractPack): string {
	const stage = contractPackStageWords[pack.stage];
	return [
		`${clientName}'s contract pack (id: ${pack.id}), prepared ${formatUkDateTime(pack.preparedAt)} — ${stage}.`,
		describeClauses(pack.chosenClauses),
		describeQuote(pack.quoteVersion),
		`Documents, each kept on the organisation: ${organisationDocumentNames.read} reads one in full, and ` +
			`${organisationDocumentNames.update} keeps a change to this client's copy, such as their own clause, as a new version without touching the template.`,
		...pack.documents.map(describeDocument)
	].join('\n');
}

function describeClauses(clauses: string[]): string {
	if (clauses.length === 0) return 'Optional clauses chosen: none.';
	return `Optional clauses chosen: ${clauses.join(', ')}.`;
}

function describeQuote(quoteVersion: number | null): string {
	if (quoteVersion === null) return 'No quote was filed for the client, so the fees stay open as blanks.';
	return `Fees from version ${quoteVersion} of the client's quote.`;
}

function describeDocument({ title, versionNumber, documentId, openBlanks }: ContractPackDocument, index: number): string {
	const heading = `${index + 1}. ${title}, version ${versionNumber} (document id: ${documentId})`;
	if (openBlanks.length === 0) return `${heading} — every blank filled.`;
	return `${heading} — still open: ${bracketedBlanks(openBlanks)}.`;
}
