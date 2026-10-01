<script lang="ts">
	import { enhance } from '$app/forms';
	import DashboardPanel from '$lib/components/workspace/DashboardPanel.svelte';
	import FormErrorNote from '$lib/components/site/FormErrorNote.svelte';
	import SubmitButton from '$lib/components/site/SubmitButton.svelte';
	import { FormTracker } from '$lib/client/formTracker.svelte';
	import { panelButtonClasses } from '$lib/components/workspace/workspaceStyles';
	import { branchNameRules, branchWebAddress, longestBranchName } from '$lib/data/branchName';
	import type { Project } from '$lib/server/projects/projectRecord';
	import type { ProjectTask } from '$lib/server/projects/taskRecord';

	let { task, project }: { task: ProjectTask; project: Project } = $props();

	const tracker = new FormTracker();

	let isEditing = $state(false);

	const branchAddress = $derived(branchWebAddress(project.repositoryUrl, task.branchName));
	const linkClasses = 'truncate font-display text-sm text-go hover:brightness-110';
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
			<div class="flex min-w-0 flex-col gap-1.5">
				{#if branchAddress === null}
					<code class="truncate font-display text-sm text-chalk/80">⎇ {task.branchName}</code>
				{:else}
					<a href={branchAddress} target="_blank" rel="noopener" class={linkClasses}>
						⎇ {task.branchName} ↗
					</a>
				{/if}
				{#if task.pullRequestUrl !== ''}
					<a href={task.pullRequestUrl} target="_blank" rel="noopener" class={linkClasses}>
						Pull request ↗
					</a>
				{/if}
			</div>
		{/if}
		{#if isEditing}
			<FormErrorNote message={tracker.errorMessage} />
			<form
				method="POST"
				action="?/setBranch"
				use:enhance={tracker.submit(() => (isEditing = false))}
				class="flex flex-wrap items-center gap-3"
			>
				<input
					name="branchName"
					value={task.branchName}
					maxlength={longestBranchName}
					pattern="[A-Za-z0-9._\/\-]*"
					title={`A branch name is ${branchNameRules}`}
					placeholder="feature/weekly-cashflow-grid"
					class="w-full min-w-0 flex-1 rounded-xl border border-hairline bg-night px-4 py-2.5 font-display
						text-sm text-chalk outline-none focus:border-go"
				/>
				<SubmitButton
					isSaving={tracker.isSaving}
					class="rounded-full bg-go px-6 py-2.5 font-display text-sm font-medium text-night transition
						hover:brightness-110"
				>
					Save
				</SubmitButton>
			</form>
		{/if}
	</div>
</DashboardPanel>
