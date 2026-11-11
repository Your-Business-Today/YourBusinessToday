<script lang="ts">
	import Badge from '$lib/components/site/Badge.svelte';
	import RecordsCell from '$lib/components/workspace/RecordsCell.svelte';
	import RecordsTable from '$lib/components/workspace/RecordsTable.svelte';
	import { formatBritishDate } from '$lib/data/britishDate';
	import { groupToneClasses, taskStatusTones } from '$lib/components/projects/internalWork/internalWorkStyles';
	import { internalStatusLabels } from '$lib/data/internalStatus';
	import { isPastDue } from '$lib/data/dueDate';
	import type { RecordsColumn } from '$lib/components/workspace/recordsTable';
	import type { TeamWorkGroup, TeamWorkItem } from '$lib/data/organisationTeamWork';

	let { group }: { group: TeamWorkGroup } = $props();

	const columns: RecordsColumn<TeamWorkItem>[] = [
		{ key: 'item', label: 'Item', sortValue: (item) => item.title },
		{ key: 'product', label: 'Product', sortValue: (item) => item.productName },
		{ key: 'status', label: 'Status', sortValue: (item) => internalStatusLabels[item.status] },
		{ key: 'dueDate', label: 'Due date', sortValue: (item) => item.dueDate ?? '' }
	];

	const { items } = $derived(group);
	const toneClasses = $derived(groupToneClasses[group.department] ?? '');
	const noDueDate = '—';
</script>

<section class="flex flex-col gap-2 border-b border-hairline px-4 py-4 md:px-6">
	<h3 class={['border-l-4 pl-2 font-display text-base font-semibold', toneClasses]}>
		{group.label}
		<span class="text-xs font-normal text-chalk-subtle">{items.length} open</span>
	</h3>
	<RecordsTable
		label={`${group.label} jobs`}
		{columns}
		rows={items}
		keyOf={(item) => item.id}
		hrefOf={(item) => item.href}
		isCardsOnPhone
		emptyMessage="Nothing open here."
	>
		{#snippet cells(item)}
			{@const isLate = isPastDue(item.dueDate, false)}
			<RecordsCell kind="link" href={item.href} label="Item">{item.title}</RecordsCell>
			<RecordsCell label="Product">{item.productName}</RecordsCell>
			<RecordsCell kind="status" label="Status"><Badge label={internalStatusLabels[item.status]} tone={taskStatusTones[item.status]} /></RecordsCell>
			<RecordsCell label="Due date" tone={isLate ? 'negative' : 'plain'}>
				{item.dueDate === null ? noDueDate : formatBritishDate(item.dueDate)}
			</RecordsCell>
		{/snippet}
	</RecordsTable>
</section>
