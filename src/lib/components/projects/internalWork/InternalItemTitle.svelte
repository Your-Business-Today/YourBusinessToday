<script lang="ts">
	import ChevronIcon from '$lib/components/site/ChevronIcon.svelte';
	import { taskPagePath, taskSheet } from '$lib/client/taskSheet.svelte';
	import type { TaskTreeNode } from '$lib/server/projects/buildTaskTree';

	let {
		task,
		depth,
		todoCount,
		isOpen,
		onToggle
	}: { task: TaskTreeNode; depth: number; todoCount: number; isOpen: boolean; onToggle: () => void } = $props();

	const sheetTarget = $derived({ projectId: task.projectId, taskId: task.id });
	const hasTodos = $derived(todoCount > 0);
	const todoWords = $derived(`${todoCount} ${todoCount === 1 ? 'to-do' : 'to-dos'}`);
	const openLabel = $derived(hasTodos ? `Show ${todoWords}` : 'Add a to-do');
	const toggleLabel = $derived(isOpen ? 'Hide the to-dos' : openLabel);
</script>

<div class="flex min-w-60 items-start gap-1.5 md:min-w-72" style:padding-left="{depth}rem">
	<button
		type="button"
		onclick={onToggle}
		title={toggleLabel}
		aria-label={toggleLabel}
		aria-expanded={isOpen}
		class={['mt-0.5 shrink-0 rounded p-0.5 transition hover:text-chalk', hasTodos || isOpen ? 'text-chalk-muted' : 'text-chalk-subtle/40']}
	>
		<ChevronIcon {isOpen} />
	</button>
	<a
		href={taskPagePath(sheetTarget)}
		onclick={(event) => taskSheet.openOnPlainClick(event, sheetTarget)}
		title={task.title}
		class="line-clamp-2 font-display leading-snug transition hover:text-go"
	>
		{task.title}
	</a>
	{#if hasTodos}
		<span class="mt-0.5 shrink-0 whitespace-nowrap rounded-full bg-night/60 px-2 py-px text-xs tabular-nums text-chalk-subtle">
			{todoWords}
		</span>
	{/if}
</div>
