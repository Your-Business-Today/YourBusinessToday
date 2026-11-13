import type { Tab } from '$lib/components/workspace/TabStrip.svelte';
import { countShownOnTab } from '$lib/components/workspace/countShownOnTab';
import { bankLinesOnTab, bankTabKeys, type BankLineRow, type BankTabKey } from '$lib/data/books/page/bankLineRows';

const bankTabLabels: Record<BankTabKey, string> = { toMatch: 'To match', matched: 'Matched', all: 'All' };

/** The Bank page's tabs, To match first, each counting the statement lines it lists. */
export function bankTabsOf(rows: BankLineRow[]): Tab[] {
	return bankTabKeys.map((key) => ({ key, label: bankTabLabels[key], count: countShownOnTab(bankLinesOnTab(rows, key).length) }));
}
