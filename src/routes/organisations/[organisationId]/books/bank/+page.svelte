<script lang="ts">
	import DashboardPanel from '$lib/components/workspace/DashboardPanel.svelte';
	import TabStrip from '$lib/components/workspace/TabStrip.svelte';
	import WorkspaceHeader from '$lib/components/workspace/WorkspaceHeader.svelte';
	import BankLinesTable from '$lib/components/books/BankLinesTable.svelte';
	import { bankTabsOf } from '$lib/components/books/bankTabs';
	import { framePageLabels } from '$lib/components/frame/moduleFolders';
	import { workspaceBodyClasses } from '$lib/components/workspace/workspaceStyles';
	import { bankLinesOnTab, type BankTabKey } from '$lib/data/books/page/bankLineRows';

	let { data } = $props();

	const bankTitle = framePageLabels.bank;
	const emptyMessages: Record<BankTabKey, string> = {
		toMatch: 'Every line is matched to what it was.',
		matched: 'No line is matched yet. Your Claude matches each line to what it was through the Your Business Today connector.',
		all: 'No bank statement has been brought in yet. Your Claude brings one in through the Your Business Today connector.'
	};
	const { bank, booksOrganisation } = $derived(data);
	let selectedTab: BankTabKey = $state('toMatch');
	const tabs = $derived(bankTabsOf(bank.lines));
	const shownLines = $derived(bankLinesOnTab(bank.lines, selectedTab));
</script>

<svelte:head>
	<title>{bankTitle} — {booksOrganisation.name}</title>
</svelte:head>

<WorkspaceHeader crumbs={[]} title={bankTitle}>
	<p class="text-sm text-chalk-subtle">{bank.standing}</p>
</WorkspaceHeader>

<div class={workspaceBodyClasses}>
	<nav aria-label="Bank statement lines by whether they are matched">
		<TabStrip {tabs} bind:selectedKey={() => selectedTab, (key) => (selectedTab = key as BankTabKey)} />
	</nav>
	<DashboardPanel>
		<div class="overflow-x-auto">
			<BankLinesTable lines={shownLines} emptyMessage={emptyMessages[selectedTab]} />
		</div>
	</DashboardPanel>
</div>
