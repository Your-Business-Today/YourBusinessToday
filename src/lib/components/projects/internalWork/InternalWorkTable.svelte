<script lang="ts">
	import InternalWorkGroupTable from './InternalWorkGroupTable.svelte';
	import type { Department } from '$lib/data/department';
	import type { InternalWorkGroup } from './internalWorkGroups';
	import type { ProjectPerson } from '$lib/server/members/projectPersonRecord';
	import type { TaskRowActions } from '../taskRowActions';
	import type { Todo } from '$lib/server/todos/todoRecord';

	let {
		groups,
		actions,
		people,
		todosByTask,
		onAddItem
	}: {
		groups: InternalWorkGroup[];
		actions: TaskRowActions;
		people: ProjectPerson[];
		todosByTask: Record<string, Todo[]>;
		onAddItem: (department: Department) => void;
	} = $props();
</script>

{#each groups as group (group.department)}
	<InternalWorkGroupTable {group} {actions} {people} {todosByTask} onAddItem={() => onAddItem(group.department)} />
{/each}
