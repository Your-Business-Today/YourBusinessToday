<script lang="ts">
	import FramePickerList from './FramePickerList.svelte';
	import LineIcon from '$lib/components/site/LineIcon.svelte';
	import { framePickerLooks, type FramePickerLook } from './framePickerLooks';
	import { keyboardKeys } from '$lib/client/keyboardKeys';
	import type { FramePickOption } from './framePicks';

	let {
		caption,
		options,
		pickedId,
		emptyLabel,
		look = 'field',
		onPick
	}: {
		caption: string;
		options: FramePickOption[];
		pickedId: string | null;
		emptyLabel: string;
		look?: FramePickerLook;
		onPick: (id: string) => void;
	} = $props();

	const listId = $props.id();
	let isOpen = $state(false);
	let pickerElement: HTMLElement | undefined = $state();

	const classes = $derived(framePickerLooks[look]);
	const picked = $derived(options.find((option) => option.id === pickedId));
	const hasOptions = $derived(options.length > 0);
	const pickedName = $derived(picked?.name ?? emptyLabel);
	const pickedNameTone = $derived(picked === undefined ? 'text-chalk-faint' : 'text-chalk');

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

<div class={classes.picker} bind:this={pickerElement}>
	<button
		type="button"
		aria-haspopup="listbox"
		aria-expanded={isOpen}
		aria-controls={listId}
		disabled={!hasOptions}
		class={classes.toggle}
		onclick={() => (isOpen = !isOpen)}
	>
		<span class="flex min-w-0 flex-1 flex-col">
			<span class={classes.caption}>{caption}</span>
			<span class={`truncate ${classes.name} ${pickedNameTone}`}>{pickedName}</span>
		</span>
		<LineIcon kind="selector" class="h-4 w-4 shrink-0 text-chalk-faint" />
	</button>
	{#if isOpen}
		<FramePickerList {listId} {caption} {options} {pickedId} placementClasses={classes.list} onChoose={choose} />
	{/if}
</div>
