<script lang="ts">
	import ToActOnSection from './ToActOnSection.svelte';
	import WaitingTaskRow from './WaitingTaskRow.svelte';
	import type { WaitingTask } from '$lib/server/conversations/getTasksWaitingOnYou';

	let { waitingTasks }: { waitingTasks: WaitingTask[] } = $props();
</script>

<ToActOnSection
	title="Waiting on you"
	description="Tasks across all your projects with a question waiting on your reply, the longest wait first."
	count={waitingTasks.length}
>
	{#each waitingTasks as waitingTask (waitingTask.id)}
		<WaitingTaskRow {waitingTask} />
	{/each}
</ToActOnSection>
