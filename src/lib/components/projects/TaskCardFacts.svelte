<script lang="ts">
	import AssigneePills from './AssigneePills.svelte';
	import TaskCardFact from './TaskCardFact.svelte';
	import TaskSequenceNote from '$lib/components/sequences/TaskSequenceNote.svelte';
	import TaskTurnNote from '$lib/components/conversations/TaskTurnNote.svelte';
	import type { SequenceStanding } from '$lib/data/taskSequenceStanding';
	import type { TaskAssignee, TaskTurn } from './taskRowActions';

	let {
		isDone,
		assignees,
		turn,
		standing
	}: {
		isDone: boolean;
		assignees: TaskAssignee[];
		turn: TaskTurn | null;
		standing: SequenceStanding | null;
	} = $props();

	const hasAssignees = $derived(assignees.length > 0);
</script>

<dl class="grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-2 border-t border-hairline/70 pt-3">
	<TaskCardFact label="Assigned to">
		{#if hasAssignees}
			<div class="flex flex-wrap gap-1.5"><AssigneePills {assignees} /></div>
		{:else}
			<span class="font-display text-xs text-chalk/35">Nobody yet</span>
		{/if}
	</TaskCardFact>
	{#if standing !== null}
		<TaskCardFact label={standing.isWaiting ? 'Blocked by' : 'Follows'}>
			<TaskSequenceNote {standing} />
		</TaskCardFact>
	{/if}
	{#if turn !== null && !isDone}
		<TaskCardFact label="Waiting on">
			<TaskTurnNote {turn} />
		</TaskCardFact>
	{/if}
</dl>
