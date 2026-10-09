<script lang="ts">
	import DashboardPanel from '$lib/components/workspace/DashboardPanel.svelte';
	import TaskBranchForm from './TaskBranchForm.svelte';
	import TaskBranchLinks from './TaskBranchLinks.svelte';
	import { panelButtonClasses } from '$lib/components/workspace/workspaceStyles';
	import { branchWebAddress } from '$lib/data/branchName';
	import type { Project } from '$lib/server/projects/projectRecord';
	import type { ProjectTask } from '$lib/server/projects/taskRecord';

	let { task, project }: { task: ProjectTask; project: Project } = $props();

	let isEditing = $state(false);

	const branchAddress = $derived(branchWebAddress(project.repositoryUrl, task.branchName));
</script>

<DashboardPanel title="Branch">
	{#snippet actions()}
		<button type="button" onclick={() => (isEditing = !isEditing)} class={panelButtonClasses}>
			{isEditing ? 'Cancel' : task.branchName === '' ? 'Set branch' : 'Change'}
		</button>
	{/snippet}
	<div class="flex flex-col gap-3 px-4 py-3">
		{#if task.branchName === ''}
			<p class="text-sm text-chalk/60">
				No branch yet. The Claude that starts the work records it; when its pull request merges, this
				task is marked done.
			</p>
		{:else}
			<TaskBranchLinks {task} {branchAddress} />
		{/if}
		{#if isEditing}
			<TaskBranchForm branchName={task.branchName} onSaved={() => (isEditing = false)} />
		{/if}
	</div>
</DashboardPanel>
