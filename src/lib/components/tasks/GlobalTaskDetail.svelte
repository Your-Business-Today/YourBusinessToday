<script lang="ts">
	import ProseText from '$lib/components/site/ProseText.svelte';
	import type { GlobalTask } from '$lib/server/projects/getGlobalTaskPage';

	let { task }: { task: GlobalTask } = $props();

	const hasStory = $derived(task.isUserStory && task.storyWant !== '');
	const createdOn = $derived(new Date(task.createdAt).toLocaleDateString());
</script>

<li class="bg-night/40 px-4 py-4 sm:px-5">
	<div class="ml-8 flex flex-col gap-3 border-l-2 border-hairline pl-4">
		{#if hasStory}
			<p class="text-sm text-chalk/80">
				<span class="text-caution">◆</span>
				As <span class="text-chalk">{task.storyRole}</span>, I want
				<span class="text-chalk">{task.storyWant}</span>, for
				<span class="text-chalk">{task.storyBenefit}</span>.
			</p>
		{/if}
		{#if task.details !== ''}
			<ProseText text={task.details} class="text-sm text-chalk/80" />
		{:else}
			<p class="text-sm text-chalk/40">No details on this task yet.</p>
		{/if}
		<p class="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-chalk/50">
			<span>{task.storyPoints} {task.storyPoints === 1 ? 'point' : 'points'}</span>
			<span>{task.completionPercent}% complete</span>
			{#if task.dueDate !== null}
				<span>due {new Date(task.dueDate).toLocaleDateString()}</span>
			{/if}
			<span>created {createdOn}</span>
		</p>
		<a
			href={`/projects/${task.projectId}/tasks/${task.id}`}
			class="self-start font-display text-sm text-go underline underline-offset-4 transition
				hover:brightness-110"
		>
			Open the full task — subtasks, checklists, comments →
		</a>
	</div>
</li>
