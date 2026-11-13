import { documentStampOf, headingFactsOf, isSayingHowToPay, owingFactsOf } from '$lib/components/books/invoiceDocumentView';
import type { DocumentParty, InvoiceDocument } from '$lib/data/books/invoiceDocument';
import { invoicePdfFilenameOf } from '$lib/data/books/invoicePdfFilename';
import { InvoiceStatuses } from '$lib/data/books/invoiceStatuses';
import { formatPoundsAndPence } from '$lib/data/books/money';
import { escapeHtml } from '$lib/data/escapeHtml';
import { formatLongDate } from '$lib/data/taxCalculator/taxDates';
import { factsBlock, howToPayBlock, linesTable, partyBlock, printedText } from './invoiceEmailBlocks';
import { invoiceEmailStyles as styles } from './invoiceEmailStyles';

/** The invoice to email, and where the customer can open it in the portal's Billing when they are a client of ours. */
export type InvoiceLetter = { document: InvoiceDocument; portalUrl: string | null };

/** "Invoice INV-7 from Your Business Today Ltd: £5,100.00 due 15 December 2026", or that it is paid in full. */
export function invoiceEmailSubject(document: InvoiceDocument): string {
	const opening = subjectOpening(document.printedNumber, document.seller);
	if (document.status === InvoiceStatuses.paid) return `${opening}: ${formatPoundsAndPence(document.total)}, paid in full`;
	return `${opening}: ${formatPoundsAndPence(document.amountOwed)} due ${formatLongDate(document.dueDate)}`;
}

/** The invoice as an email: the same document the page shows, drawn with inline styles and a plain table for the lines. */
export function renderInvoiceEmail(letter: InvoiceLetter): string {
	const { document } = letter;
	return `
<div style="${styles.desk}">
	<div style="${styles.paper}">
		${sellerHeading(document.seller)}
		<h1 style="${styles.title}">Invoice ${escapeHtml(document.printedNumber)}</h1>
		${openingLine(document)}
		${factsBlock(headingFactsOf(document))}
		${partyBlock('From', document.seller)}
		${partyBlock('Billed to', document.customer)}
		${linesTable(document.lines, document.total, owingFactsOf(document))}
		${isSayingHowToPay(document) ? howToPayBlock(document.howToPay) : ''}
		${notesBlock(document.notes)}
		${attachedBlock(document)}
		${portalBlock(letter.portalUrl)}
	</div>
</div>`;
}

function subjectOpening(printedNumber: string, seller: DocumentParty): string {
	return `Invoice ${printedNumber} from ${seller.name}`;
}

function sellerHeading(seller: DocumentParty): string {
	return `<p style="${styles.seller}">${escapeHtml(seller.name)}</p>`;
}

function openingLine(document: InvoiceDocument): string {
	const stamp = documentStampOf(document);
	if (stamp !== null) return `<p style="${styles.stamp}">${escapeHtml(stamp.sentence)}</p>`;
	const owed = `${formatPoundsAndPence(document.amountOwed)} is due on ${formatLongDate(document.dueDate)}`;
	return `<p style="${styles.text}">Here is invoice ${escapeHtml(document.printedNumber)}: ${escapeHtml(owed)}.</p>`;
}

function notesBlock(notes: string): string {
	if (notes === '') return '';
	return `<p style="${styles.label}">Notes</p><p style="${styles.detail}">${printedText(notes)}</p>`;
}

function attachedBlock(document: InvoiceDocument): string {
	return `<p style="${styles.smallPrint}">The invoice is attached as ${escapeHtml(invoicePdfFilenameOf(document))} to file or forward.</p>`;
}

function portalBlock(portalUrl: string | null): string {
	if (portalUrl === null) return '';
	const link = `<a href="${escapeHtml(portalUrl)}" style="${styles.link}">${escapeHtml(portalUrl)}</a>`;
	return `<p style="${styles.smallPrint}">You can also open this invoice, and every invoice we have sent you, in Billing on your portal: ${link}</p>`;
}
