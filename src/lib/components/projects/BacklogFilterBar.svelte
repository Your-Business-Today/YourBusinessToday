<script lang="ts">
	import AssigneeFilterChips from './AssigneeFilterChips.svelte';
	import CountedFilterChip from './CountedFilterChip.svelte';
	import DoneTaskFilter from './DoneTaskFilter.svelte';
	import type { BacklogView } from '$lib/client/backlogView.svelte';
	import type { ProjectPerson } from '$lib/server/members/projectPersonRecord';

	let {
		backlog,
		people,
		viewerId
	}: { backlog: BacklogView; people: ProjectPerson[]; viewerId: string } = $props();
</script>

<div class="flex flex-wrap items-center gap-2">
	<CountedFilterChip
		label="Waiting on me"
		title="Tasks whose conversation is waiting on you or your Claude"
		count={backlog.waitingCount}
		countTone="attention"
		isSelected={backlog.isWaitingOnMeOnly}
		onToggle={() => backlog.toggleWaitingOnMe()}
	/>
	<AssigneeFilterChips
		{people}
		{viewerId}
		selectedPersonId={backlog.assigneeId}
		countFor={(personId) => backlog.assignedCountFor(personId)}
		onToggle={(personId) => backlog.toggleAssignee(personId)}
	/>
	<DoneTaskFilter bind:shouldIncludeDone={backlog.shouldIncludeDone} />
</div>
