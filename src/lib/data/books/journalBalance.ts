import { sumMoney } from './money';
import type { JournalLineInput } from './journalLine';

const fewestLines = 2;

/** Why the lines do not make a journal that balances, or null when debits equal credits and money moves. */
export function journalBalanceRefusal(lines: JournalLineInput[]): string | null {
	if (lines.length < fewestLines) return 'A journal needs at least two lines.';
	const totalDebit = sumMoney(lines.map((line) => line.debit));
	const totalCredit = sumMoney(lines.map((line) => line.credit));
	if (totalDebit !== totalCredit) return `Debits (${totalDebit}) do not equal credits (${totalCredit}).`;
	if (totalDebit === 0) return 'A journal must move some money.';
	return null;
}
