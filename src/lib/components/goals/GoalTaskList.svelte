<script lang="ts">
	import DashboardPanel from '$lib/components/workspace/DashboardPanel.svelte';
	import TaskLinkList from '$lib/components/projects/TaskLinkList.svelte';
	import { panelEmptyClasses } from '$lib/components/workspace/workspaceStyles';
	import type { ProjectTask } from '$lib/server/projects/taskRecord';

	let { tasks }: { tasks: ProjectTask[] } = $props();
</script>

<DashboardPanel title="Tasks" count={tasks.length}>
	{#if tasks.length === 0}
		<p class={panelEmptyClasses}>
			No tasks serve this goal yet — set the goal on a task from its edit form.
		</p>
	{:else}
		<TaskLinkList {tasks} />
	{/if}
</DashboardPanel>
