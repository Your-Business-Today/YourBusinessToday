<script lang="ts">
	import { enhance } from '$app/forms';
	import type { FormTracker } from '$lib/client/formTracker.svelte';

	export type GoalChoice = { id: string | null; title: string; isLongTerm: boolean };

	let {
		taskId,
		goalChoice,
		isChosen,
		tracker,
		onSaved
	}: {
		taskId: string;
		goalChoice: GoalChoice;
		isChosen: boolean;
		tracker: FormTracker;
		onSaved: () => void;
	} = $props();

	const optionClasses = $derived(
		isChosen
			? 'border-go bg-go/10 text-go'
			: 'border-hairline text-chalk/80 hover:border-go hover:text-go'
	);
</script>

<form method="POST" action="?/setGoal" use:enhance={tracker.submit(onSaved)}>
	<input type="hidden" name="taskId" value={taskId} />
	<input type="hidden" name="goalId" value={goalChoice.id ?? ''} />
	<button
		type="submit"
		disabled={isChosen || tracker.isSaving}
		class={`w-full rounded-xl border px-4 py-3 text-left font-display text-sm transition
			disabled:cursor-default ${optionClasses}`}
	>
		{goalChoice.title}
		{#if goalChoice.isLongTerm}
			<span class="ml-2 text-xs text-chalk/50">long term</span>
		{/if}
		{#if isChosen}
			<span class="ml-2 text-xs text-chalk/50">current</span>
		{/if}
	</button>
</form>
