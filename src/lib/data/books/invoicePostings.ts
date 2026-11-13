import type { JournalLineInput } from './journalLine';
import { fromPence, toPence } from './money';
import { creditOf, debitOf } from './postingSides';

/** A line of an invoice as it posts: the sale it makes to one income account, perhaps within a cost centre, below zero when it takes money off. */
export type InvoiceSale = { incomeAccountId: string; costCentreId: string | null; amount: number };

const nothing = 0;

/**
 * Issuing: the customer owes the total, on trade debtors, and each line's sale is credited to its income account; a
 * line that takes money off is debited to its account instead, so the books show the discount as it was agreed.
 */
export function issueLines(debtorsAccountId: string, total: number, sales: InvoiceSale[]): JournalLineInput[] {
	const owed = debitOf(debtorsAccountId, total);
	const salesThatMoveMoney = sales.filter((sale) => sale.amount !== nothing);
	return [owed, ...salesThatMoveMoney.map((sale) => signedLine(sale.incomeAccountId, toPence(sale.amount), sale.costCentreId))];
}

/** Money received: it arrives in the bank, and trade debtors fall by the same amount. */
export function paymentLines(bankAccountId: string, debtorsAccountId: string, amount: number): JournalLineInput[] {
	return [debitOf(bankAccountId, amount), creditOf(debtorsAccountId, amount, null)];
}

/**
 * Money handed back on a paid invoice: it leaves the bank, and the sale is taken back off the accounts the invoice
 * posted it to, every line of the sale in proportion to its share in whole pence, the last carrying the pence left over.
 * A line that took money off takes back its share the other way, so each account ends where the net sale put it.
 */
export function refundLines(bankAccountId: string, saleLines: JournalLineInput[], amount: number): JournalLineInput[] {
	const salePence = saleLines.map((line) => toPence(line.credit) - toPence(line.debit));
	const shares = sharesInProportion(toPence(amount), salePence);
	const takenBack = saleLines.map((line, index) => signedLine(line.accountId, -shares[index], line.costCentreId));
	return [...takenBack.filter((line, index) => shares[index] !== nothing), creditOf(bankAccountId, amount, null)];
}

/** The same lines on the other sides, so posting them undoes the journal they came from. */
export function reversedLines(lines: JournalLineInput[]): JournalLineInput[] {
	return lines.map((line) => ({ ...line, debit: line.credit, credit: line.debit }));
}

/** The pence shared across the parts by their weights, each rounded towards nothing, the last carrying what is left. */
function sharesInProportion(pence: number, weights: number[]): number[] {
	const totalWeight = weights.reduce((total, weight) => total + weight, nothing);
	const evenShares = weights.map((weight) => Math.trunc((pence * weight) / totalWeight));
	const sharedPence = evenShares.reduce((total, share) => total + share, nothing);
	const lastIndex = weights.length - 1;
	return evenShares.map((share, index) => (index === lastIndex ? share + pence - sharedPence : share));
}

/** A credit of the pence when they are above nothing, a debit of them when below. */
function signedLine(accountId: string, pence: number, costCentreId: string | null): JournalLineInput {
	const amount = fromPence(Math.abs(pence));
	const isTakingOff = pence < nothing;
	if (isTakingOff) return debitOf(accountId, amount, costCentreId);
	return creditOf(accountId, amount, costCentreId);
}
