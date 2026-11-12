<script lang="ts">
	import WaitingTaskRow from './WaitingTaskRow.svelte';
	import { panelListClasses } from '$lib/components/workspace/workspaceStyles';
	import type { WaitingTask } from '$lib/server/conversations/getTasksWaitingOnYou';

	let { waitingTasks }: { waitingTasks: WaitingTask[] } = $props();
</script>

<ul class="{panelListClasses} rounded-xl border border-hairline bg-carriage">
	{#each waitingTasks as waitingTask (waitingTask.id)}
		<WaitingTaskRow {waitingTask} />
	{/each}
</ul>
