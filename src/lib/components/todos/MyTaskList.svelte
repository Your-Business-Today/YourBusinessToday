<script lang="ts">
	import MyTaskRow from './MyTaskRow.svelte';
	import { tasksByDepartment } from '$lib/data/tasksByDepartment';
	import type { GlobalTask } from '$lib/server/projects/getGlobalTaskPage';

	let { tasks }: { tasks: GlobalTask[] } = $props();

	const groups = $derived(tasksByDepartment(tasks));
</script>

{#if groups.length === 0}
	<p class="px-4 py-3 text-sm text-chalk/50">No project task is assigned to you.</p>
{/if}
{#each groups as group (group.department)}
	<h3 class="px-4 pt-2 text-xs tracking-widest text-chalk/50 uppercase">{group.label}</h3>
	<ul class="divide-y divide-hairline">
		{#each group.tasks as task (task.id)}
			<MyTaskRow {task} />
		{/each}
	</ul>
{/each}
