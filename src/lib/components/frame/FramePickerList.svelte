<script lang="ts">
	import { fly } from 'svelte/transition';
	import { menuDrop } from '$lib/client/motion';
	import type { FramePickOption } from './framePicks';

	let {
		listId,
		caption,
		options,
		pickedId,
		placementClasses,
		onChoose
	}: {
		listId: string;
		caption: string;
		options: FramePickOption[];
		pickedId: string | null;
		placementClasses: string;
		onChoose: (option: FramePickOption) => void;
	} = $props();

	function optionClasses(option: FramePickOption): string {
		if (option.id === pickedId) return 'bg-carriage-raised font-semibold text-chalk';
		return 'text-chalk-muted hover:bg-carriage-raised hover:text-chalk';
	}
</script>

<div
	id={listId}
	role="listbox"
	aria-label={caption}
	transition:fly={menuDrop}
	class={`absolute top-full z-40 mt-1 flex max-h-80 flex-col overflow-y-auto rounded-lg border
		border-hairline-strong bg-carriage py-1 ${placementClasses}`}
>
	{#each options as option (option.id)}
		<button
			type="button"
			role="option"
			aria-selected={option.id === pickedId}
			class={`shrink-0 truncate px-3 py-3.5 text-left text-sm transition md:py-2 ${optionClasses(option)}`}
			onclick={() => onChoose(option)}
		>
			{option.name}
		</button>
	{/each}
</div>
