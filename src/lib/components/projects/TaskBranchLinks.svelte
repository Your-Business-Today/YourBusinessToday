<script lang="ts">
	import { describeStagingStanding } from '$lib/data/stagedTasks';
	import type { ProjectTask } from '$lib/server/projects/taskRecord';

	let { task, branchAddress }: { task: ProjectTask; branchAddress: string | null } = $props();

	const linkClasses = 'truncate font-display text-sm text-go hover:brightness-110';
	const standing = $derived(describeStagingStanding(task));
</script>

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
	{#if standing !== ''}
		<p class="text-xs text-chalk/60">{standing}</p>
	{/if}
</div>
