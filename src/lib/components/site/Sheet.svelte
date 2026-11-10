<script lang="ts">
	import { fade, fly } from 'svelte/transition';
	import { keyboardKeys } from '$lib/client/keyboardKeys';
	import { backdropFade, sheetSlide } from '$lib/client/motion';
	import type { Snippet } from 'svelte';
	import Button from './Button.svelte';

	let {
		label,
		fullPageHref,
		onClose,
		children
	}: { label: string; fullPageHref: string; onClose: () => void; children: Snippet } = $props();

	let sheetElement: HTMLElement | undefined = $state();

	/** Escape closes the sheet, unless a menu or a modal open over it has claimed the key or is the top dialog. */
	function closeOnEscape(event: KeyboardEvent) {
		if (event.key !== keyboardKeys.escape || event.defaultPrevented) return;
		const dialogs = document.querySelectorAll('[aria-modal="true"]');
		const topDialog = dialogs[dialogs.length - 1];
		if (topDialog === sheetElement) onClose();
	}

	$effect(() => {
		const { body } = document;
		const { style } = body;
		const overflowBefore = style.overflow;
		style.overflow = 'hidden';
		return () => {
			style.overflow = overflowBefore;
		};
	});
</script>

<svelte:window onkeydown={closeOnEscape} />

<div class="fixed inset-0 z-50 flex justify-end">
	<button
		type="button"
		aria-label="Close"
		onclick={onClose}
		transition:fade={backdropFade}
		class="absolute inset-0 bg-night/70 backdrop-blur-[2px]"
	></button>
	<div
		bind:this={sheetElement}
		role="dialog"
		aria-modal="true"
		aria-label={label}
		transition:fly={sheetSlide}
		class="relative flex h-full w-full max-w-6xl flex-col overflow-y-auto border-l border-hairline bg-night shadow-2xl"
	>
		<div class="flex items-center justify-between gap-2 border-b border-hairline bg-carriage px-4 py-2 sm:px-6">
			<Button onclick={onClose}>✕ Close</Button>
			<Button href={fullPageHref}>Open full page ↗</Button>
		</div>
		{@render children()}
	</div>
</div>
