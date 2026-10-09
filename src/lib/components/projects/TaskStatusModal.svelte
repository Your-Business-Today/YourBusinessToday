<script lang="ts">
	import FormErrorNote from '$lib/components/site/FormErrorNote.svelte';
	import Modal from '$lib/components/site/Modal.svelte';
	import TaskStatusOption from './TaskStatusOption.svelte';
	import { FormTracker } from '$lib/client/formTracker.svelte';
	import type { TaskKind } from '$lib/data/taskKind';
	import { taskStatusOrder, type TaskStatus } from '$lib/data/taskStatus';

	type StatusedTask = { id: string; title: string; status: TaskStatus; kind: TaskKind };

	let { task, isOpen = $bindable() }: { task: StatusedTask; isOpen: boolean } = $props();

	const tracker = new FormTracker();

	$effect(() => {
		if (!isOpen) tracker.reset();
	});
</script>

<Modal title="Change status" bind:isOpen>
	<div class="flex flex-col gap-4">
		<p class="text-sm text-chalk/60">{task.title}</p>
		<FormErrorNote message={tracker.errorMessage} />
		<div class="flex flex-col gap-2" class:animate-pulse={tracker.isSaving}>
			{#each taskStatusOrder as statusOption (statusOption)}
				<TaskStatusOption
					{task}
					status={statusOption}
					isSaving={tracker.isSaving}
					submit={tracker.submit(() => (isOpen = false))}
				/>
			{/each}
		</div>
	</div>
</Modal>
