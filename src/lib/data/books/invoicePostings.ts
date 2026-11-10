import type { JournalLineInput } from './journalLine';
import { fromPence, toPence } from './money';
import { creditOf, debitOf } from './postingSides';

/** A line of an invoice as it posts: the sale it makes to one income account, perhaps within a cost centre. */
export type InvoiceSale = { incomeAccountId: string; costCentreId: string | null; amount: number };

const nothing = 0;

/** Issuing: the customer owes the total, on trade debtors, and each line's sale is credited to its income account. */
export function issueLines(debtorsAccountId: string, total: number, sales: InvoiceSale[]): JournalLineInput[] {
	const owed = debitOf(debtorsAccountId, total);
	const salesThatMoveMoney = sales.filter((sale) => sale.amount !== nothing);
	return [owed, ...salesThatMoveMoney.map((sale) => creditOf(sale.incomeAccountId, sale.amount, sale.costCentreId))];
}

/** Money received: it arrives in the bank, and trade debtors fall by the same amount. */
export function paymentLines(bankAccountId: string, debtorsAccountId: string, amount: number): JournalLineInput[] {
	return [debitOf(bankAccountId, amount), creditOf(debtorsAccountId, amount, null)];
}

/**
 * Money handed back on a paid invoice: it leaves the bank, and the sale is taken back off the income accounts the
 * invoice credited, each in proportion to its share of the sale in whole pence, the last carrying the pence left over.
 */
export function refundLines(bankAccountId: string, saleLines: JournalLineInput[], amount: number): JournalLineInput[] {
	const refundPence = toPence(amount);
	const salePence = saleLines.map((line) => toPence(line.credit));
	const totalSalePence = salePence.reduce((total, pence) => total + pence, nothing);
	const evenShares = salePence.map((pence) => Math.floor((refundPence * pence) / totalSalePence));
	const lastIndex = saleLines.length - 1;
	const sharedPence = evenShares.reduce((total, pence) => total + pence, nothing);
	const shares = evenShares.map((pence, index) => (index === lastIndex ? pence + refundPence - sharedPence : pence));
	const takenBack = saleLines.map((line, index) => debitOf(line.accountId, fromPence(shares[index]), line.costCentreId));
	return [...takenBack.filter((line) => line.debit !== nothing), creditOf(bankAccountId, amount, null)];
}

/** The same lines on the other sides, so posting them undoes the journal they came from. */
export function reversedLines(lines: JournalLineInput[]): JournalLineInput[] {
	return lines.map((line) => ({ ...line, debit: line.credit, credit: line.debit }));
}
