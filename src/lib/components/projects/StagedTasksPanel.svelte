<script lang="ts">
	import DashboardPanel from '$lib/components/workspace/DashboardPanel.svelte';
	import StagedTaskRow from './StagedTaskRow.svelte';
	import { panelEmptyClasses, panelListClasses } from '$lib/components/workspace/workspaceStyles';
	import type { ProjectTask } from '$lib/server/projects/taskRecord';

	let { stagedTasks }: { stagedTasks: ProjectTask[] } = $props();
</script>

<DashboardPanel title="Staged, not live" count={stagedTasks.length}>
	{#if stagedTasks.length === 0}
		<p class={panelEmptyClasses}>
			Nothing is waiting for a deploy: every task merged into staging has been promoted.
		</p>
	{:else}
		<ul class={panelListClasses}>
			{#each stagedTasks as task (task.id)}
				<StagedTaskRow {task} />
			{/each}
		</ul>
	{/if}
</DashboardPanel>
