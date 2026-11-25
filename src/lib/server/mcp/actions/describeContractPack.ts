import { contractPackStageWords } from '$lib/data/contractPackRules';
import { formatBritishDate, formatUkDateTime } from '$lib/data/britishDate';
import { organisationDocumentNames } from './documentHomes';
import { bracketedBlanks, type ContractPack, type ContractPackDocument } from '$lib/data/contractPack';

/** A client's pack as the connector tells it: where it stands, what it chose, and each document with the blanks still open. */
export function describeContractPack(clientName: string, pack: ContractPack): string {
	const stage = contractPackStageWords[pack.stage];
	return [
		`${clientName}'s contract pack (id: ${pack.id}), prepared ${formatUkDateTime(pack.preparedAt)} — ${stage}.`,
		describeSending(pack),
		describeClauses(pack.chosenClauses),
		describeQuote(pack.quoteVersion),
		`Documents, each kept on the organisation: ${organisationDocumentNames.read} reads one in full, and ` +
			`${organisationDocumentNames.update} keeps a change to this client's copy, such as their own clause, as a new version without touching the template.`,
		...pack.documents.map(describeDocument),
		...describeComments(pack)
	].join('\n');
}

function describeSending({ sending }: ContractPack): string {
	if (sending === null) return 'Not sent to the client yet: preview_contract_pack_sending shows what would go.';
	return `Last sent to ${sending.sentTo} on ${formatUkDateTime(sending.sentAt)}.`;
}

function describeClauses(clauses: string[]): string {
	if (clauses.length === 0) return 'Optional clauses chosen: none.';
	return `Optional clauses chosen: ${clauses.join(', ')}.`;
}

function describeQuote(quoteVersion: number | null): string {
	if (quoteVersion === null) return 'No quote was filed for the client, so the fees stay open as blanks.';
	return `Fees from version ${quoteVersion} of the client's quote.`;
}

function describeDocument(document: ContractPackDocument, index: number): string {
	const { title, versionNumber, documentId } = document;
	return `${index + 1}. ${title}, version ${versionNumber} (document id: ${documentId}) — ${describeBlanks(document)} ${describeSignature(document)}`;
}

function describeBlanks({ openBlanks }: ContractPackDocument): string {
	if (openBlanks.length === 0) return 'every blank filled.';
	return `still open: ${bracketedBlanks(openBlanks)}.`;
}

function describeSignature({ signature }: ContractPackDocument): string {
	if (signature === null) return 'Not signed by the client yet.';
	const { signerName, signerPosition, signedOn, versionNumber } = signature;
	return `Signed by ${signerName}, ${signerPosition}, on ${formatBritishDate(signedOn)}, against version ${versionNumber}.`;
}

function describeComments({ comments, documents }: ContractPack): string[] {
	if (comments.length === 0) return [];
	const titleOf = (documentId: string) => {
		const commentedDocument = documents.find((document) => document.documentId === documentId);
		return commentedDocument?.title ?? 'a document';
	};
	const lines = comments.map(({ documentId, clause, comment, madeAt }) => {
		const where = clause === '' ? titleOf(documentId) : `${titleOf(documentId)}, clause ${clause}`;
		return `- ${formatUkDateTime(madeAt)}, on ${where}: ${comment}`;
	});
	return ["The client's comments:", ...lines];
}
