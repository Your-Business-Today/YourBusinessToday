<script lang="ts">
	import AutocompleteRow from './AutocompleteRow.svelte';
	import DashboardPanel from '$lib/components/workspace/DashboardPanel.svelte';
	import {
		countAutocomplete,
		countOpenTasks,
		type RegisterProject
	} from '$lib/data/autocompleteRegister';

	let { project }: { project: RegisterProject } = $props();

	const { tasks, goals } = $derived(project);
	const ownSettingTasks = $derived(tasks.filter((task) => task.setting !== null));
	const countLabel = $derived(`${countAutocomplete(project)} of ${countOpenTasks(project)} open tasks`);
	const isEmpty = $derived(goals.length === 0 && ownSettingTasks.length === 0);
	const projectHref = $derived(`/projects/${project.id}`);
</script>

<DashboardPanel title={project.name} count={countLabel}>
	<ul class="flex flex-col divide-y divide-hairline/70">
		{#each goals as goal (goal.id)}
			<AutocompleteRow
				href={`${projectHref}/goals/${goal.id}`}
				title={goal.title}
				kindLabel="Goal"
				isAutocomplete={goal.isAutocomplete}
			/>
		{/each}
		{#each ownSettingTasks as task (task.id)}
			<AutocompleteRow
				href={`${projectHref}/tasks/${task.id}`}
				title={task.title}
				kindLabel="Task, own setting"
				isAutocomplete={task.isAutocomplete}
			/>
		{/each}
		{#if isEmpty}
			<li class="px-4 py-3 text-sm text-chalk/50">No open goals, and no task with its own setting.</li>
		{/if}
	</ul>
</DashboardPanel>
