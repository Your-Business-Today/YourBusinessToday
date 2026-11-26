import type { JournalLineInput } from '../journalLine';
import { manualJournalKind } from '../journalKinds';
import { fromPence } from '../money';
import { describeMonth, type MonthKey } from '../monthKey';
import type { DirectorsLoanLine, DirectorsLoanPart } from './directorsLoanParts';

const noCostCentre = null;

/**
 * The journal that moves a member's part of a shared cost in a month off the costs onto its director's loan account:
 * the loan debited with the whole part, each cost account credited within the member's cost centre. Its description
 * names the shared cost and the month, never whose the part is.
 */
export function directorsLoanJournalOf(part: DirectorsLoanPart, sharedCostLabel: string, month: MonthKey, journalDate: string) {
	const loanLine: JournalLineInput = { accountId: part.directorsLoanAccountId, costCentreId: noCostCentre, debit: fromPence(part.pence), credit: 0 };
	const costLines = part.lines.map((line) => costLineOf(line, part.costCentreId));
	const description = `Personal share of ${sharedCostLabel}, ${describeMonth(month)}`;
	return { journalDate, description, kind: manualJournalKind, lines: [loanLine, ...costLines] };
}

function costLineOf(line: DirectorsLoanLine, costCentreId: string): JournalLineInput {
	return { accountId: line.accountId, costCentreId, debit: 0, credit: fromPence(line.pence) };
}
