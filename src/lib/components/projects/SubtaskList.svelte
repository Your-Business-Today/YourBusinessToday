<script lang="ts">
	import DashboardPanel from '$lib/components/workspace/DashboardPanel.svelte';
	import TaskLinkList from './TaskLinkList.svelte';
	import { panelButtonClasses, panelEmptyClasses } from '$lib/components/workspace/workspaceStyles';
	import type { ProjectTask } from '$lib/server/projects/taskRecord';

	let {
		subtasks,
		onAddSubtask
	}: { subtasks: ProjectTask[]; onAddSubtask: () => void } = $props();
</script>

<DashboardPanel title="Subtasks" count={subtasks.length}>
	{#snippet actions()}
		<button type="button" onclick={onAddSubtask} class={panelButtonClasses}>＋ Subtask</button>
	{/snippet}
	{#if subtasks.length === 0}
		<p class={panelEmptyClasses}>
			No subtasks yet — break this task down if it's more than one piece of work.
		</p>
	{:else}
		<TaskLinkList tasks={subtasks} />
	{/if}
</DashboardPanel>
