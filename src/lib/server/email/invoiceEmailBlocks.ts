import type { DocumentFact, DocumentLine, DocumentParty, HowToPay } from '$lib/data/books/invoiceDocument';
import { formatPoundsAndPence } from '$lib/data/books/money';
import { escapeHtml } from '$lib/data/escapeHtml';
import { invoiceEmailStyles as styles } from './invoiceEmailStyles';

const lineBreak = /\r?\n/g;

/** Text as the email prints it: escaped, its own line breaks kept. */
export function printedText(text: string): string {
	return escapeHtml(text).replace(lineBreak, '<br />');
}

/** A company the invoice names, under its heading: name, address, email and the facts it states. */
export function partyBlock(heading: string, party: DocumentParty): string {
	const address = party.address === '' ? '' : `<p style="${styles.detail}">${printedText(party.address)}</p>`;
	const email = party.email === '' ? '' : `<p style="${styles.detail}">${escapeHtml(party.email)}</p>`;
	return `
		<p style="${styles.label}">${escapeHtml(heading)}</p>
		<p style="${styles.partyName}">${escapeHtml(party.name)}</p>
		${address}${email}${factsBlock(party.facts)}`;
}

/** Labelled facts, one a line: "Sort code: 12-34-56". */
export function factsBlock(facts: DocumentFact[]): string {
	return facts.map((fact) => `<p style="${styles.detail}">${escapeHtml(fact.label)}: <strong>${escapeHtml(fact.value)}</strong></p>`).join('');
}

/** The lines as a plain table every mail program draws, with the total beneath and what is still to pay. */
export function linesTable(lines: DocumentLine[], total: number, owingFacts: DocumentFact[]): string {
	const head = ['Description', 'Quantity', 'Unit price', 'Amount'].map((label, column) => headCell(label, column > 0)).join('');
	const owing = owingFacts.map((fact) => totalRow(fact.label, fact.value)).join('');
	return `
		<table role="presentation" style="${styles.table}">
			<thead><tr>${head}</tr></thead>
			<tbody>${lines.map(lineRow).join('')}</tbody>
			<tfoot>${totalRow('Total', formatPoundsAndPence(total))}${owing}</tfoot>
		</table>`;
}

/** How the customer pays: the seller's instructions, the bank details and what to quote. */
export function howToPayBlock(howToPay: HowToPay): string {
	const instructions = howToPay.instructions === '' ? '' : `<p style="${styles.detail}">${printedText(howToPay.instructions)}</p>`;
	return `
		<p style="${styles.label}">How to pay</p>
		${instructions}${factsBlock(howToPay.bankFacts)}
		<p style="${styles.detail}">When you pay, quote <strong>${escapeHtml(howToPay.quote)}</strong>.</p>`;
}

function headCell(label: string, isFigure: boolean): string {
	return `<th style="${isFigure ? styles.headFigure : styles.headCell}">${label}</th>`;
}

function lineRow(line: DocumentLine): string {
	return `<tr>
		<td style="${styles.cell}">${printedText(line.description)}</td>
		<td style="${styles.figure}">${line.quantity}</td>
		<td style="${styles.figure}">${formatPoundsAndPence(line.unitPrice)}</td>
		<td style="${styles.figure}">${formatPoundsAndPence(line.amount)}</td>
	</tr>`;
}

function totalRow(label: string, value: string): string {
	return `<tr><td colspan="3" style="${styles.totalCell}">${escapeHtml(label)}</td><td style="${styles.totalFigure}">${escapeHtml(value)}</td></tr>`;
}
