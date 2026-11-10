<script lang="ts">
	import DashboardPanel from '$lib/components/workspace/DashboardPanel.svelte';
	import TabStrip from '$lib/components/workspace/TabStrip.svelte';
	import WorkspaceHeader from '$lib/components/workspace/WorkspaceHeader.svelte';
	import BooksPeriodForm from '$lib/components/books/BooksPeriodForm.svelte';
	import StatementTable from '$lib/components/books/StatementTable.svelte';
	import { workspaceBodyClasses } from '$lib/components/workspace/workspaceStyles';

	let { data } = $props();

	const booksTitle = 'Books';
	const { asked, period, statements, refusal, booksOrganisation } = $derived(data);
	const tabs = $derived(statements.map(({ key, title }) => ({ key, label: title, count: null })));
	let pickedKey = $state('');
	const selectedKey = $derived(pickedKey === '' ? (tabs[0]?.key ?? '') : pickedKey);
	const shownStatement = $derived(statements.find((statement) => statement.key === selectedKey));
	const formStart = $derived(asked.periodStart ?? period?.start ?? '');
	const formEnd = $derived(asked.periodEnd ?? period?.end ?? '');
</script>

<svelte:head>
	<title>{booksTitle} — {booksOrganisation.name}</title>
</svelte:head>

<WorkspaceHeader crumbs={[]} title={booksTitle}>
	<p class="text-sm text-chalk-subtle">
		{booksOrganisation.name}'s books, to read. Your Claude posts the entries through the Your Business Today connector.
	</p>
</WorkspaceHeader>

<div class={workspaceBodyClasses}>
	{#if tabs.length > 0}
		<TabStrip {tabs} bind:selectedKey={() => selectedKey, (key) => (pickedKey = key)} />
	{/if}
	<DashboardPanel title={shownStatement?.title ?? booksTitle} errorMessage={refusal ?? ''}>
		{#snippet toolbar()}
			<BooksPeriodForm start={formStart} end={formEnd} />
		{/snippet}
		{#if shownStatement !== undefined}
			<p class="border-b border-hairline px-6 py-3 text-sm text-chalk-subtle">{shownStatement.caption}</p>
			<div class="overflow-x-auto">
				<StatementTable statement={shownStatement} />
			</div>
		{/if}
	</DashboardPanel>
</div>
