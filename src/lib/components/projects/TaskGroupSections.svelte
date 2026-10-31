<script lang="ts">
	import TaskGroupSection from './TaskGroupSection.svelte';
	import { groupKeyOf, type TaskGroup } from './taskTreeGroups';
	import type { BacklogView } from '$lib/client/backlogView.svelte';
	import type { TaskRowActions } from './taskRowActions';

	let {
		groups,
		backlog,
		projectId,
		actions
	}: {
		groups: TaskGroup[];
		backlog: BacklogView;
		projectId: string;
		actions: TaskRowActions;
	} = $props();
</script>

<div class="flex flex-col">
	{#each groups as group (groupKeyOf(group))}
		<TaskGroupSection {group} taskCount={backlog.countOf(group.tasks)} {projectId} {actions} />
	{/each}
</div>
