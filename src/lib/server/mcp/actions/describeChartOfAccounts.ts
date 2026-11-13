import type { ChartOfAccounts, CostCentre, LedgerAccount } from '$lib/server/books/chartOfAccounts';

const archivedMark = ' (archived: nothing posts to it)';

const systemMark = ' (system account: never archived or renamed)';

export function describeChartOfAccounts(organisationName: string, chart: ChartOfAccounts): string {
	const { accounts, costCentres } = chart;
	if (accounts.length === 0) {
		return [
			`${organisationName}'s chart of accounts holds no accounts yet, so nothing can be posted to its books.`,
			'',
			...costCentreLines(costCentres)
		].join('\n');
	}
	return [`Chart of accounts of ${organisationName}, by code:`, ...accounts.map(describeLedgerAccount), '', ...costCentreLines(costCentres)].join('\n');
}

/** The cost centres an organisation's lines can be kept within, archived ones marked. */
export function describeCostCentres(organisationName: string, costCentres: CostCentre[]): string {
	if (costCentres.length === 0) return `${organisationName}'s books hold no cost centres: every line is kept for the organisation as a whole.`;
	return [`Cost centres of ${organisationName}, by name:`, ...costCentres.map(describeCostCentre)].join('\n');
}

export function describeLedgerAccount(account: LedgerAccount): string {
	const system = account.isSystem ? systemMark : '';
	const archived = account.isArchived ? archivedMark : '';
	return `- ${account.code} ${account.name}, ${account.accountType}${system}${archived}. Id ${account.id}`;
}

export function describeCostCentre(costCentre: CostCentre): string {
	const archived = costCentre.isArchived ? archivedMark : '';
	return `- ${costCentre.name}${archived}. Id ${costCentre.id}`;
}

function costCentreLines(costCentres: CostCentre[]): string[] {
	if (costCentres.length === 0) return ['No cost centres: every line is kept for the organisation as a whole.'];
	return ['Cost centres:', ...costCentres.map(describeCostCentre)];
}
