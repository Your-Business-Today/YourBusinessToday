<script lang="ts">
	import { enhance } from '$app/forms';
	import LineIcon from '$lib/components/site/LineIcon.svelte';
	import { FormTracker } from '$lib/client/formTracker.svelte';
	import { priorityMarkButtonLabel, priorityMarkLabel } from '$lib/data/priorityMark';

	let { taskId, isPriority }: { taskId: string; isPriority: boolean } = $props();

	const tracker = new FormTracker();
	const buttonLabel = $derived(priorityMarkButtonLabel(isPriority));
	const starClasses = $derived(isPriority ? 'size-3.5 fill-current' : 'size-3.5');
	const markClasses = $derived(
		isPriority
			? 'border-caution/60 bg-caution/10 px-2 text-caution hover:bg-caution/20'
			: 'border-transparent px-1 text-chalk-faint hover:text-caution'
	);
</script>

<form method="POST" action="?/setPriorityMark" use:enhance={tracker.submit()} class="shrink-0">
	<input type="hidden" name="taskId" value={taskId} />
	<input type="hidden" name="isPriority" value={String(!isPriority)} />
	<button
		type="submit"
		disabled={tracker.isSaving}
		title={tracker.errorMessage ?? buttonLabel}
		aria-label={buttonLabel}
		aria-pressed={isPriority}
		class={['flex items-center gap-1 rounded-full border py-0.5 font-display text-xs whitespace-nowrap transition', markClasses]}
		class:animate-pulse={tracker.isSaving}
	>
		<LineIcon kind="star" class={starClasses} />
		{#if isPriority}
			<span>{priorityMarkLabel}</span>
		{/if}
	</button>
</form>
