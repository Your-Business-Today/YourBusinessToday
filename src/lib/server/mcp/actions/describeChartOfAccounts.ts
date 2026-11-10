import type { ChartOfAccounts, CostCentre, LedgerAccount } from '$lib/server/books/chartOfAccounts';

const archivedMark = ' (archived: nothing posts to it)';

export function describeChartOfAccounts(organisationName: string, chart: ChartOfAccounts): string {
	const { accounts, costCentres } = chart;
	if (accounts.length === 0) {
		return `${organisationName}'s chart of accounts holds no accounts yet, so nothing can be posted to its books.`;
	}
	return [
		`Chart of accounts of ${organisationName}, by code:`,
		...accounts.map(accountLine),
		'',
		...costCentreLines(costCentres)
	].join('\n');
}

function accountLine(account: LedgerAccount): string {
	const archived = account.isArchived ? archivedMark : '';
	return `- ${account.code} ${account.name}, ${account.accountType}${archived}. Id ${account.id}`;
}

function costCentreLines(costCentres: CostCentre[]): string[] {
	if (costCentres.length === 0) return ['No cost centres: every line is kept for the organisation as a whole.'];
	return ['Cost centres:', ...costCentres.map(costCentreLine)];
}

function costCentreLine(costCentre: CostCentre): string {
	const archived = costCentre.isArchived ? archivedMark : '';
	return `- ${costCentre.name}${archived}. Id ${costCentre.id}`;
}
