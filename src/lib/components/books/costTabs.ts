import type { Tab } from '$lib/components/workspace/TabStrip.svelte';
import { countShownOnTab } from '$lib/components/workspace/countShownOnTab';
import { costTabKeys, costsOnTab, type CostRow, type CostTabKey } from '$lib/data/books/page/costRows';

const costTabLabels: Record<CostTabKey, string> = { unpaid: 'Unpaid', paid: 'Paid', all: 'All' };

/** The Costs page's tabs, Unpaid first, each counting the costs it lists. */
export function costTabsOf(rows: CostRow[]): Tab[] {
	return costTabKeys.map((key) => ({ key, label: costTabLabels[key], count: countShownOnTab(costsOnTab(rows, key).length) }));
}
