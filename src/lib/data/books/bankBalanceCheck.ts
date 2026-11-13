import { toPence } from './money';
import type { BankLineInput } from './bankLineRules';

/** A line whose balance is not the balance above it plus its own amount. */
export type BalanceDisagreement = { lineNumber: number; balanceAfter: number; previousBalance: number; amount: number };

/** How many lines' balances could be checked against the line above, and the first that does not follow from it. */
export type BalanceCheck = { checkedCount: number; disagreement: BalanceDisagreement | null };

const firstLineNumber = 1;
const firstIndex = 0;

/** Checks each balance the statement gives against the balance on the line above it and the line's own amount. */
export function checkStatementBalances(lines: BankLineInput[]): BalanceCheck {
	let checkedCount = 0;
	for (const [index, line] of lines.entries()) {
		const previousBalance = index === firstIndex ? null : balanceAbove(lines, index);
		if (previousBalance === null || line.balanceAfter === null) continue;
		checkedCount += 1;
		const isFollowing = toPence(previousBalance) + toPence(line.amount) === toPence(line.balanceAfter);
		if (isFollowing) continue;
		const disagreement = { lineNumber: index + firstLineNumber, balanceAfter: line.balanceAfter, previousBalance, amount: line.amount };
		return { checkedCount, disagreement };
	}
	return { checkedCount, disagreement: null };
}

function balanceAbove(lines: BankLineInput[], index: number): number | null {
	const lineAbove = lines[index - firstLineNumber];
	return lineAbove.balanceAfter;
}
