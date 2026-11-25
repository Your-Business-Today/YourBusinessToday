import { companyDetails } from '$lib/data/companyDetails';
import { formatBritishDate, formatUkDayAndTime } from '$lib/data/britishDate';
import { a4Page, writingWidth } from '$lib/server/books/invoicePdf/invoicePdfLayout';
import { InvoicePdfSheet } from '$lib/server/books/invoicePdf/invoicePdfSheet';
import { headingRowOf, penStyles, rowOf } from '$lib/server/books/invoicePdf/invoicePdfRows';
import { markdownRows } from './markdownRows';
import type { TextRow } from '$lib/server/books/invoicePdf/pdfPen';
import type { TextColumn } from '$lib/server/books/invoicePdf/textColumn';
import type { SignedCopy } from './signedCopy';

const halfWidth = writingWidth / 2;
const wholeWidth = { x: a4Page.margin, width: writingWidth };

/** A person's signature as it prints: who they signed for, their name, their position and the day. */
type Signer = { side: string; name: string; position: string; signedOn: string };

/**
 * The document as both sides signed it, drawn as an A4 PDF with the invoice's pen: its title and version, the text the
 * client read and signed, then who signed for each side and on which day, and when YBT kept it.
 */
export async function drawSignedCopyPdf(copy: SignedCopy): Promise<Uint8Array> {
	const title = `${copy.title}, version ${copy.versionNumber}`;
	const sheet = await InvoicePdfSheet.open(`${title}, signed`, companyDetails.legalName, rowOf(`${title}, continued`, penStyles.muted));
	sheet.writeColumns([{ rows: openingRowsOf(copy), ...wholeWidth }]);
	sheet.rule();
	sheet.writeFlowing({ rows: markdownRows(copy.markdown), ...wholeWidth });
	sheet.space();
	sheet.rule();
	sheet.writeColumns(signatureColumnsOf(copy));
	sheet.space();
	sheet.writeFlowing({ rows: [rowOf(keptSentenceOf(copy), penStyles.muted)], ...wholeWidth });
	return sheet.save();
}

function openingRowsOf(copy: SignedCopy): TextRow[] {
	return [
		rowOf(copy.title, penStyles.title),
		rowOf(`Between ${companyDetails.legalName} and ${copy.clientName}`, penStyles.body),
		rowOf(`Version ${copy.versionNumber}, signed by both sides`, penStyles.strong)
	];
}

function signatureColumnsOf({ clientName, clientSignature, countersignature }: SignedCopy): TextColumn[] {
	const client = { side: clientName, name: clientSignature.signerName, position: clientSignature.signerPosition, signedOn: clientSignature.signedOn };
	const director = { side: companyDetails.legalName, name: countersignature.signerName, position: countersignature.signerPosition, signedOn: countersignature.signedOn };
	return [
		{ rows: signerRowsOf(client), x: a4Page.margin, width: halfWidth },
		{ rows: signerRowsOf(director), x: a4Page.margin + halfWidth, width: halfWidth }
	];
}

function signerRowsOf(signer: Signer): TextRow[] {
	return [
		headingRowOf(`Signed for ${signer.side}`),
		rowOf(signer.name, penStyles.partyName),
		rowOf(signer.position, penStyles.muted),
		rowOf(`Signed on ${formatBritishDate(signer.signedOn)}`, penStyles.body)
	];
}

function keptSentenceOf({ versionNumber, clientSignature, countersignature }: SignedCopy): string {
	const clientSignedAt = formatUkDayAndTime(clientSignature.signedAt);
	const keptAt = formatUkDayAndTime(countersignature.signedAt);
	return (
		`The client signed version ${versionNumber} in the Your Business Today client portal at ${clientSignedAt}, ` +
		`after reading that version. ${companyDetails.legalName} countersigned it and kept this copy at ${keptAt}.`
	);
}
