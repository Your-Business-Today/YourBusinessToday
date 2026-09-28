<script lang="ts">
	import ArrowIcon from '$lib/components/site/ArrowIcon.svelte';
	import { enhance } from '$app/forms';
	import { FormTracker } from '$lib/client/formTracker.svelte';

	let {
		moveAction,
		fieldName,
		id,
		isFirst,
		isLast,
		extraFields = {}
	}: {
		moveAction: string;
		fieldName: string;
		id: string;
		isFirst: boolean;
		isLast: boolean;
		extraFields?: Record<string, string>;
	} = $props();

	const tracker = new FormTracker();
</script>

{#snippet moveForm(direction: 'up' | 'down', isAtEnd: boolean, label: string, hoverClass: string)}
	<form method="POST" action={moveAction} use:enhance={tracker.submit()}>
		<input type="hidden" name={fieldName} value={id} />
		<input type="hidden" name="direction" value={direction} />
		{#each Object.entries(extraFields) as [extraFieldName, extraFieldValue] (extraFieldName)}
			<input type="hidden" name={extraFieldName} value={extraFieldValue} />
		{/each}
		<button
			type="submit"
			disabled={isAtEnd || tracker.isSaving}
			title={label}
			aria-label={label}
			class={`px-1 py-0.5 text-chalk/40 transition ${hoverClass}`}
			class:invisible={isAtEnd}
		>
			<ArrowIcon {direction} />
		</button>
	</form>
{/snippet}

<div class="flex flex-col" class:animate-pulse={tracker.isSaving}>
	{@render moveForm('up', isFirst, 'Raise priority', 'hover:text-go')}
	{@render moveForm('down', isLast, 'Lower priority', 'hover:text-caution')}
</div>
