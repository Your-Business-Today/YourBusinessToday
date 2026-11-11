<script lang="ts">
	import { enhance } from '$app/forms';
	import NewTaskFormFooter from './NewTaskFormFooter.svelte';
	import { FormTracker } from '$lib/client/formTracker.svelte';
	import { readSimilarTasks } from '$lib/data/similarTasks';
	import type { Snippet } from 'svelte';

	let {
		createAction,
		parentTaskId,
		hiddenFields,
		submitLabel,
		laterNote,
		onCreated,
		children
	}: {
		createAction: string;
		parentTaskId: string | null;
		hiddenFields: Record<string, string>;
		submitLabel: string;
		laterNote: string;
		onCreated: () => void;
		children: Snippet;
	} = $props();

	const tracker = new FormTracker();

	const similarTasks = $derived(readSimilarTasks(tracker.failureData));
</script>

<form
	method="POST"
	action={createAction}
	use:enhance={tracker.submit(onCreated)}
	class="flex flex-col gap-4"
>
	{#each Object.entries(hiddenFields) as [fieldName, fieldValue] (fieldName)}
		<input type="hidden" name={fieldName} value={fieldValue} />
	{/each}
	{#if parentTaskId !== null}
		<input type="hidden" name="parentTaskId" value={parentTaskId} />
	{/if}
	{@render children()}
	<NewTaskFormFooter
		errorMessage={tracker.errorMessage}
		{similarTasks}
		isSaving={tracker.isSaving}
		{submitLabel}
		{laterNote}
		onCancelSimilar={() => tracker.reset()}
	/>
</form>
