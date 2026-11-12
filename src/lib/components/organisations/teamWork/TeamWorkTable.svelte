<script lang="ts">
	import Badge from '$lib/components/site/Badge.svelte';
	import RecordsCell from '$lib/components/workspace/RecordsCell.svelte';
	import RecordsTable from '$lib/components/workspace/RecordsTable.svelte';
	import { formatBritishDate } from '$lib/data/britishDate';
	import { departmentDotClasses, taskStatusTones } from '$lib/components/projects/internalWork/internalWorkStyles';
	import { departmentLabels } from '$lib/data/department';
	import { internalStatusLabels } from '$lib/data/internalStatus';
	import { isPastDue } from '$lib/data/dueDate';
	import type { RecordsColumn } from '$lib/components/workspace/recordsTable';
	import type { TeamWorkItem } from '$lib/data/organisationTeamWork';

	let { items }: { items: TeamWorkItem[] } = $props();

	const columns: RecordsColumn<TeamWorkItem>[] = [
		{ key: 'item', label: 'Item', sortValue: (item) => item.title },
		{ key: 'department', label: 'Department', sortValue: (item) => departmentLabels[item.department] },
		{ key: 'product', label: 'Product', sortValue: (item) => item.productName },
		{ key: 'status', label: 'Status', sortValue: (item) => internalStatusLabels[item.status] },
		{ key: 'dueDate', label: 'Due date', sortValue: (item) => item.dueDate ?? '' }
	];
	const noDueDate = '—';
</script>

<RecordsTable
	label="The team's open jobs"
	{columns}
	rows={items}
	keyOf={(item) => item.id}
	hrefOf={(item) => item.href}
	isCardsOnPhone
	emptyMessage="Nothing open here."
>
	{#snippet cells(item)}
		{@const isLate = isPastDue(item.dueDate, false)}
		<RecordsCell kind="link" href={item.href}>{item.title}</RecordsCell>
		<RecordsCell label="Department">
			<span class="inline-flex items-center gap-2">
				<span class={['h-2 w-2 shrink-0 rounded-full', departmentDotClasses[item.department]]} aria-hidden="true"></span>
				{departmentLabels[item.department]}
			</span>
		</RecordsCell>
		<RecordsCell label="Product">{item.productName}</RecordsCell>
		<RecordsCell kind="status" label="Status"><Badge label={internalStatusLabels[item.status]} tone={taskStatusTones[item.status]} /></RecordsCell>
		<RecordsCell label="Due date" tone={isLate ? 'negative' : 'plain'}>
			{item.dueDate === null ? noDueDate : formatBritishDate(item.dueDate)}
		</RecordsCell>
	{/snippet}
</RecordsTable>
