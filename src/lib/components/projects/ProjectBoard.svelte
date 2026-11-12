<script lang="ts">
	import ProjectFilterBar from './ProjectFilterBar.svelte';
	import ProjectPagination from './ProjectPagination.svelte';
	import ProjectTable from './ProjectTable.svelte';
	import ProjectsTabs from './ProjectsTabs.svelte';
	import WaitingOnYouList from './WaitingOnYouList.svelte';
	import type { ProjectListView } from '$lib/client/projectListView.svelte';
	import type { ListedProject } from '$lib/server/projects/getProjectsForUser';
	import type { WaitingTask } from '$lib/server/conversations/getTasksWaitingOnYou';

	let {
		listView,
		waitingTasks,
		latestKitVersion,
		onEdit,
		onDelete,
		onSetPriority
	}: {
		listView: ProjectListView;
		waitingTasks: WaitingTask[];
		latestKitVersion: string;
		onEdit: (project: ListedProject) => void;
		onDelete: (project: ListedProject) => void;
		onSetPriority: (project: ListedProject) => void;
	} = $props();

	let isPriorityChosen = $state<boolean | null>(null);

	const hasWaitingTasks = $derived(waitingTasks.length > 0);
	const showsPriority = $derived(hasWaitingTasks && (isPriorityChosen ?? hasWaitingTasks));
</script>

<ProjectsTabs
	{listView}
	waitingCount={waitingTasks.length}
	{showsPriority}
	onPriorityChosen={(isChosen) => (isPriorityChosen = isChosen)}
/>
{#if showsPriority}
	<WaitingOnYouList {waitingTasks} />
{:else}
	<ProjectFilterBar
		bind:searchText={listView.searchText}
		bind:isShowingFinished={listView.isShowingFinished}
		finishedCount={listView.finishedCount}
		countLabel={listView.countLabel}
	/>
	{#if listView.matchCount === 0}
		<p class="rounded-xl border border-dashed border-hairline p-8 text-center text-sm text-chalk/60">
			No projects match — adjust the filters or create one.
		</p>
	{:else}
		<ProjectTable
			rows={listView.pagedRows}
			{latestKitVersion}
			shownIds={listView.shownIds}
			{onEdit}
			{onDelete}
			{onSetPriority}
		/>
		<ProjectPagination bind:pageNumber={listView.pageNumber} pageCount={listView.pageCount} />
	{/if}
{/if}
