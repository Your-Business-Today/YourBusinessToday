<script lang="ts">
	import RecordsTable from '$lib/components/workspace/RecordsTable.svelte';
	import RecordsCell from '$lib/components/workspace/RecordsCell.svelte';
	import type { RecordsColumn } from '$lib/components/workspace/recordsTable';
	import { formatBritishDate } from '$lib/data/britishDate';
	import { taskStatusLabelFor } from '$lib/data/taskKind';
	import type { SupportTaskListing } from '$lib/server/support/getOpenSupportTasks';

	let { tasks }: { tasks: SupportTaskListing[] } = $props();

	const columns: RecordsColumn<SupportTaskListing>[] = [
		{ key: 'title', label: 'Request', sortValue: (task) => task.title },
		{ key: 'project', label: 'Project', sortValue: (task) => task.projectName },
		{ key: 'raised', label: 'Raised', isWideOnly: true, sortValue: (task) => task.createdAt },
		{ key: 'status', label: 'Status' }
	];

	function taskHref(task: SupportTaskListing): string {
		return `/projects/${task.projectId}/tasks/${task.id}`;
	}
</script>

<div class="overflow-x-auto border border-hairline">
	<RecordsTable label="Support requests" {columns} rows={tasks} keyOf={(task) => task.id} hrefOf={taskHref}>
		{#snippet cells(task)}
			<RecordsCell kind="link" href={taskHref(task)}>{task.title}</RecordsCell>
			<RecordsCell>{task.projectName}</RecordsCell>
			<RecordsCell isWideOnly>{formatBritishDate(task.createdAt)}</RecordsCell>
			<RecordsCell>{taskStatusLabelFor(task.kind, task.status)}</RecordsCell>
		{/snippet}
	</RecordsTable>
</div>
