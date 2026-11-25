<script lang="ts">
	import DesignRequestAnswerForm from './DesignRequestAnswerForm.svelte';
	import { isAwaitingDesignApproval } from '$lib/data/designReview';
	import type { ProjectTask } from '$lib/server/projects/taskRecord';

	let { task, chunks, canAnswer }: { task: ProjectTask; chunks: ProjectTask[]; canAnswer: boolean } = $props();

	const isRequest = $derived(isAwaitingDesignApproval(task));
	const change = $derived(task.designReview?.change ?? '');
</script>

<li class="flex min-w-0 flex-col gap-1 px-4 py-3">
	<a
		href={`/projects/${task.projectId}/tasks/${task.id}`}
		title={task.title}
		class="line-clamp-2 font-display text-sm leading-snug transition hover:text-go"
	>
		{task.title}
	</a>
	{#if isRequest}
		<p class="text-xs text-chalk/60">What it changes: {change}</p>
	{/if}
	{#if chunks.length > 0}
		<ul class="flex flex-col gap-0.5 border-l border-hairline pl-3 text-xs text-chalk/70">
			{#each chunks as chunk (chunk.id)}
				<li><a href={`/projects/${chunk.projectId}/tasks/${chunk.id}`} class="transition hover:text-go">{chunk.title}</a></li>
			{/each}
		</ul>
	{/if}
	{#if canAnswer && isRequest}
		<DesignRequestAnswerForm taskId={task.id} />
	{/if}
</li>
