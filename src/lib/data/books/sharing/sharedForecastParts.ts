import { LedgerAccountTypes } from '../ledgerAccountTypes';
import type { LedgerEntry } from '../ledgerEntry';
import { monthStart, type MonthKey } from '../monthKey';
import { CashflowDirections, type CashflowItem } from '../cashflow/cashflowItem';
import type { ForecastEntry } from '../cashflow/cashflowForecast';
import { forecastEntriesOfItems } from '../cashflow/forecastEntriesOfItems';
import { apportionEntries, type ApportionedEntry, type CostSharing } from './apportionedEntries';

const forecastAccount = { accountId: 'forecast', accountCode: 'forecast', accountName: 'Forecast item' } as const;

/**
 * Each time a forecast item kept against a shared cost comes round in the months given, spread over the months it
 * covers and split among the projects planned to share each, as the books split a line once it is paid.
 */
export function sharedForecastParts(items: CashflowItem[], itemCostCentres: Map<string, string>, months: MonthKey[], sharing: CostSharing): ApportionedEntry[] {
	const sharedIds = new Set(sharing.shares.map((share) => share.costCentreId));
	const sharedItems = items.filter((item) => sharedIds.has(itemCostCentres.get(item.id) ?? ''));
	const asLines = sharedItems.flatMap((item) =>
		forecastEntriesOfItems([item], months).map((entry) => asLedgerLine(entry, itemCostCentres.get(item.id) as string))
	);
	return apportionEntries(asLines, sharing);
}

function asLedgerLine(entry: ForecastEntry, costCentreId: string): LedgerEntry {
	const isMoneyOut = entry.direction === CashflowDirections.moneyOut;
	const accountType = isMoneyOut ? LedgerAccountTypes.expense : LedgerAccountTypes.income;
	const debit = isMoneyOut ? entry.amount : 0;
	const credit = isMoneyOut ? 0 : entry.amount;
	return { journalDate: monthStart(entry.month), ...forecastAccount, accountType, costCentreId, debit, credit };
}
