import { formatBritishDate } from '$lib/data/britishDate';
import { formatPoundsAndPence } from '$lib/data/books/money';
import { describeMonth } from '$lib/data/books/monthKey';
import type { PeriodEndCost } from '$lib/data/books/periodEndRules';
import type { MonthlyRelease } from '$lib/data/books/periodEndPostings';
import type { PostedAccrual } from '$lib/server/books/postAccrual';
import type { PostedRelease } from '$lib/server/books/releasePrepayment';
import { nameOf, type ChartNamings } from '$lib/server/books/chartNamings';

/** What an accrual posted and when it reverses, in the organisation's own account names. */
export function describeAccrual(organisationName: string, accrual: PostedAccrual, namings: ChartNamings): string {
	const accrued = `Accrued ${formatPoundsAndPence(accrual.amount)} for ${accrual.description} in ${organisationName}'s books`;
	const posted = `posted on ${formatBritishDate(accrual.postedOn)} to ${describeCostAccount(accrual, namings)} and owed on Accruals`;
	const reversed = `reversed on ${formatBritishDate(accrual.reversedOn)}, so the bill posts the cost once when record_expense records it`;
	return `${accrued}: ${posted}, then ${reversed}.`;
}

/** What a prepayment's release posted, month by month, in the organisation's own account names. */
export function describeRelease(organisationName: string, release: PostedRelease, namings: ChartNamings): string {
	const spread = `Spread ${formatPoundsAndPence(release.amount)} for ${release.description} across ${release.monthCount} months`;
	const moved = `in ${organisationName}'s books, moving each month's share out of Prepayments to ${describeCostAccount(release, namings)}`;
	return [`${spread} ${moved}:`, ...release.releases.map(describeMonthlyRelease)].join('\n');
}

function describeMonthlyRelease(share: MonthlyRelease): string {
	return `- ${describeMonth(share.monthKey)}: ${formatPoundsAndPence(share.amount)}`;
}

function describeCostAccount(cost: PeriodEndCost, namings: ChartNamings): string {
	const account = nameOf(namings.accountNames, cost.expenseAccountId);
	if (cost.costCentreId === null) return account;
	return `${account}, cost centre ${nameOf(namings.costCentreNames, cost.costCentreId)}`;
}
