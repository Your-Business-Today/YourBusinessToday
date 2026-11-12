<script lang="ts">
	import DashboardPanel from '$lib/components/workspace/DashboardPanel.svelte';
	import TabStrip from '$lib/components/workspace/TabStrip.svelte';
	import WorkspaceHeader from '$lib/components/workspace/WorkspaceHeader.svelte';
	import BooksPeriodForm from '$lib/components/books/BooksPeriodForm.svelte';
	import StatementTable from '$lib/components/books/StatementTable.svelte';
	import { framePageLabels } from '$lib/components/frame/moduleFolders';
	import { workspaceBodyClasses } from '$lib/components/workspace/workspaceStyles';

	let { data } = $props();

	const reportsTitle = framePageLabels.reports;
	const { asked, period, statements, refusal, booksOrganisation } = $derived(data);
	const tabs = $derived(statements.map(({ key, title }) => ({ key, label: title, count: null })));
	let pickedKey = $state('');
	const selectedKey = $derived(pickedKey === '' ? (tabs[0]?.key ?? '') : pickedKey);
	const shownStatement = $derived(statements.find((statement) => statement.key === selectedKey));
	const formStart = $derived(asked.periodStart ?? period?.start ?? '');
	const formEnd = $derived(asked.periodEnd ?? period?.end ?? '');
</script>

<svelte:head>
	<title>{reportsTitle} — {booksOrganisation.name}</title>
</svelte:head>

<WorkspaceHeader crumbs={[]} title={reportsTitle}>
	<p class="text-sm text-chalk-subtle">
		{booksOrganisation.name}'s accounts, to read. Your Claude posts the entries through the Your Business Today connector.
	</p>
</WorkspaceHeader>

<div class={workspaceBodyClasses}>
	{#if tabs.length > 0}
		<nav aria-label="Statements">
			<TabStrip {tabs} bind:selectedKey={() => selectedKey, (key) => (pickedKey = key)} />
		</nav>
	{/if}
	<div class="flex flex-wrap items-center justify-between gap-3">
		<p class="text-sm text-chalk-subtle">{shownStatement?.caption}</p>
		<BooksPeriodForm start={formStart} end={formEnd} />
	</div>
	<DashboardPanel errorMessage={refusal ?? ''}>
		{#if shownStatement !== undefined}
			<div class="overflow-x-auto">
				<StatementTable statement={shownStatement} />
			</div>
		{/if}
	</DashboardPanel>
</div>
