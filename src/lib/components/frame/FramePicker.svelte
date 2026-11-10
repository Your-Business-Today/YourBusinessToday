<script lang="ts">
	import { fly } from 'svelte/transition';
	import ChevronIcon from '$lib/components/site/ChevronIcon.svelte';
	import { keyboardKeys } from '$lib/client/keyboardKeys';
	import { menuDrop } from '$lib/client/motion';
	import type { FramePickOption } from './framePicks';

	let {
		caption,
		options,
		pickedId,
		emptyLabel,
		onPick
	}: {
		caption: string;
		options: FramePickOption[];
		pickedId: string | null;
		emptyLabel: string;
		onPick: (id: string) => void;
	} = $props();

	const listId = $props.id();
	let isOpen = $state(false);
	let pickerElement: HTMLElement | undefined = $state();

	const picked = $derived(options.find((option) => option.id === pickedId));
	const hasOptions = $derived(options.length > 0);
	const pickedName = $derived(picked?.name ?? emptyLabel);
	const pickedNameTone = $derived(picked === undefined ? 'text-chalk-faint' : 'text-chalk');

	function optionClasses(option: FramePickOption): string {
		if (option.id === pickedId) return 'bg-carriage-raised font-semibold text-chalk';
		return 'text-chalk-muted hover:bg-carriage-raised hover:text-chalk';
	}

	function closeOnOutsidePress(event: PointerEvent): void {
		if (!isOpen || pickerElement?.contains(event.target as Node)) return;
		isOpen = false;
	}

	function closeOnEscape(event: KeyboardEvent): void {
		if (!isOpen || event.key !== keyboardKeys.escape) return;
		event.stopPropagation();
		isOpen = false;
	}

	function choose(option: FramePickOption): void {
		isOpen = false;
		if (option.id === pickedId) return;
		onPick(option.id);
	}
</script>

<svelte:window onpointerdown={closeOnOutsidePress} onkeydowncapture={closeOnEscape} />

<div class="relative" bind:this={pickerElement}>
	<button
		type="button"
		aria-haspopup="listbox"
		aria-expanded={isOpen}
		aria-controls={listId}
		disabled={!hasOptions}
		class="flex w-full items-center gap-2 rounded border border-hairline bg-carriage-raised px-3 py-2
			text-left transition hover:border-hairline-strong disabled:hover:border-hairline"
		onclick={() => (isOpen = !isOpen)}
	>
		<span class="flex min-w-0 flex-1 flex-col">
			<span class="text-xs text-chalk-subtle">{caption}</span>
			<span class={`truncate text-sm font-semibold ${pickedNameTone}`}>{pickedName}</span>
		</span>
		<span class="text-chalk-subtle"><ChevronIcon {isOpen} /></span>
	</button>
	{#if isOpen}
		<div
			id={listId}
			role="listbox"
			aria-label={caption}
			transition:fly={menuDrop}
			class="absolute inset-x-0 top-full z-40 mt-1 flex max-h-80 flex-col overflow-y-auto rounded-lg border
				border-hairline-strong bg-carriage py-1"
		>
			{#each options as option (option.id)}
				<button
					type="button"
					role="option"
					aria-selected={option.id === pickedId}
					class={`truncate px-3 py-3.5 text-left text-sm transition md:py-2 ${optionClasses(option)}`}
					onclick={() => choose(option)}
				>
					{option.name}
				</button>
			{/each}
		</div>
	{/if}
</div>
