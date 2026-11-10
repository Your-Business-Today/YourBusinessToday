import type { JournalLineInput } from './journalLine';

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

/** The same lines on the other sides, so posting them undoes the journal they came from. */
export function reversedLines(lines: JournalLineInput[]): JournalLineInput[] {
	return lines.map((line) => ({ ...line, debit: line.credit, credit: line.debit }));
}

function debitOf(accountId: string, amount: number): JournalLineInput {
	return { accountId, costCentreId: null, debit: amount, credit: nothing };
}

function creditOf(accountId: string, amount: number, costCentreId: string | null): JournalLineInput {
	return { accountId, costCentreId, debit: nothing, credit: amount };
}
