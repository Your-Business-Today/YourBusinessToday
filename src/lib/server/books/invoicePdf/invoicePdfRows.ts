import type { DocumentFact, DocumentParty, HowToPay } from '$lib/data/books/invoiceDocument';
import { inks, textSizes } from './invoicePdfLayout';
import type { PenStyle, TextRow } from './pdfPen';

export const penStyles = {
	title: { size: textSizes.title, isBold: true },
	partyName: { size: textSizes.partyName, isBold: true },
	heading: { size: textSizes.heading, isBold: true, ink: inks.faint },
	body: { size: textSizes.body },
	figure: { size: textSizes.body },
	strong: { size: textSizes.body, isBold: true },
	muted: { size: textSizes.body, ink: inks.muted },
	signal: { size: textSizes.body, isBold: true, ink: inks.signal }
} satisfies Record<string, PenStyle>;

export function rowOf(text: string, style: PenStyle): TextRow {
	return { text, style };
}

/** A part's heading, written small and in capitals above it. */
export function headingRowOf(heading: string): TextRow {
	return rowOf(heading.toUpperCase(), penStyles.heading);
}

/** A fact as it prints: its label, then its value. */
export function factRowsOf(facts: DocumentFact[], style: PenStyle = penStyles.body): TextRow[] {
	return facts.map((fact) => rowOf(`${fact.label}: ${fact.value}`, style));
}

/** A company the invoice names, under its heading: its name, address, email and the facts it states. */
export function partyRowsOf(heading: string, party: DocumentParty): TextRow[] {
	const address = party.address === '' ? [] : [rowOf(party.address, penStyles.muted)];
	const email = party.email === '' ? [] : [rowOf(party.email, penStyles.muted)];
	const opening = [headingRowOf(heading), rowOf(party.name, penStyles.partyName)];
	return [...opening, ...address, ...email, ...factRowsOf(party.facts)];
}

/** How the customer pays: the seller's words, the bank details, and what to quote. */
export function howToPayRowsOf(howToPay: HowToPay): TextRow[] {
	const instructions = howToPay.instructions === '' ? [] : [rowOf(howToPay.instructions, penStyles.muted)];
	const quote = rowOf(`When you pay, quote ${howToPay.quote}.`, penStyles.body);
	return [headingRowOf('How to pay'), ...instructions, ...factRowsOf(howToPay.bankFacts), quote];
}
