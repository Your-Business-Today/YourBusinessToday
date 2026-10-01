<script lang="ts">
	import DashboardPanel from '$lib/components/workspace/DashboardPanel.svelte';
	import ProseText from '$lib/components/site/ProseText.svelte';
	import SupportTaskFacts from '$lib/components/support/SupportTaskFacts.svelte';
	import { supportTaskKind } from '$lib/data/taskKind';
	import type { ProjectTask } from '$lib/server/projects/taskRecord';

	let { task, raisedByName }: { task: ProjectTask; raisedByName: string } = $props();

	const storySentence = $derived(
		task.isUserStory && task.storyRole !== ''
			? `As a ${task.storyRole}, I want ${task.storyWant}, so that ${task.storyBenefit}.`
			: null
	);
	const isSupportTask = $derived(task.kind === supportTaskKind);
	const hasNothingWritten = $derived(storySentence === null && task.details === '' && !isSupportTask);
</script>

<DashboardPanel title="Description">
	<div class="flex flex-col gap-3 px-4 py-3">
		{#if isSupportTask}
			<SupportTaskFacts {task} {raisedByName} />
		{/if}
		{#if storySentence !== null}
			<p class="rounded-lg border border-caution/40 bg-caution/10 px-3 py-2 text-sm text-caution">
				{storySentence}
			</p>
		{/if}
		{#if task.details !== ''}
			<ProseText text={task.details} class="text-sm text-chalk/80" />
		{/if}
		{#if hasNothingWritten}
			<p class="text-sm text-chalk/50">Nothing written yet — edit the task to describe the work.</p>
		{/if}
	</div>
</DashboardPanel>
