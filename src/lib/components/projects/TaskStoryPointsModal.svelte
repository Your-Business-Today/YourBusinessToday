<script lang="ts">
	import FormErrorNote from '$lib/components/site/FormErrorNote.svelte';
	import Modal from '$lib/components/site/Modal.svelte';
	import TaskStoryPointsOption from './TaskStoryPointsOption.svelte';
	import { FormTracker } from '$lib/client/formTracker.svelte';
	import { fibonacciStoryPoints } from '$lib/data/storyPoints';
	import type { ProjectTask } from '$lib/server/projects/taskRecord';

	let { task, isOpen = $bindable() }: { task: ProjectTask; isOpen: boolean } = $props();

	const tracker = new FormTracker();

	$effect(() => {
		if (!isOpen) tracker.reset();
	});
</script>

<Modal title="Story points" bind:isOpen>
	<div class="flex flex-col gap-4">
		<p class="text-sm text-chalk/60">{task.title}</p>
		<p class="text-xs text-chalk/45">How big the task is, from 1 for a small change to 21 for a large one.</p>
		<FormErrorNote message={tracker.errorMessage} />
		<div class="grid grid-cols-4 gap-2 sm:grid-cols-7" class:animate-pulse={tracker.isSaving}>
			{#each fibonacciStoryPoints as storyPoints (storyPoints)}
				<TaskStoryPointsOption
					taskId={task.id}
					{storyPoints}
					isCurrent={storyPoints === task.storyPoints}
					isSaving={tracker.isSaving}
					submit={tracker.submit(() => (isOpen = false))}
				/>
			{/each}
		</div>
	</div>
</Modal>
