<script lang="ts">
	import BuildStatusPill from './BuildStatusPill.svelte';
	import TaskKindPill from './TaskKindPill.svelte';
	import type { ProjectTask } from '$lib/server/projects/taskRecord';

	let { task }: { task: ProjectTask } = $props();
</script>

<TaskKindPill kind={task.kind} status={task.status} />
{#if task.buildStatus !== 'not_sent'}
	<BuildStatusPill status={task.buildStatus} />
{/if}
{#if task.branchName !== ''}
	<span
		title={`Worked on ${task.branchName}`}
		class="max-w-40 truncate rounded-full border border-hairline px-2 py-0.5 font-display text-xs
			text-chalk/60"
	>
		⎇ {task.branchName}
	</span>
{/if}
<span
	title="Story points"
	class="rounded-full border border-hairline px-2 py-0.5 font-display text-xs text-chalk/60"
>
	{task.storyPoints} pts
</span>
<span title="Completion" class="font-display text-xs whitespace-nowrap text-chalk/50">
	{task.completionPercent}%
</span>
