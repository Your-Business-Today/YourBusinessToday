<script lang="ts">
	import ModalHeader from './ModalHeader.svelte';
	import { fade, fly } from 'svelte/transition';
	import type { Snippet } from 'svelte';
	import { focusTrap } from '$lib/client/focusTrap';
	import { keyboardKeys } from '$lib/client/keyboardKeys';
	import { backdropFade, dialogRise } from '$lib/client/motion';

	let {
		title,
		isOpen = $bindable(),
		maxWidthClass = 'max-w-150',
		footer,
		children
	}: { title: string; isOpen: boolean; maxWidthClass?: string; footer?: Snippet; children: Snippet } = $props();

	function close() {
		isOpen = false;
	}

	function closeOnEscape(event: KeyboardEvent) {
		if (event.key === keyboardKeys.escape) close();
	}
</script>

<svelte:window onkeydown={closeOnEscape} />

{#if isOpen}
	<div transition:fade={backdropFade} class="fixed inset-0 z-50 flex items-center justify-center bg-night/70 p-4">
		<div
			role="dialog"
			aria-modal="true"
			aria-label={title}
			tabindex="-1"
			use:focusTrap
			in:fly={dialogRise}
			class={`flex max-h-full w-full ${maxWidthClass} flex-col gap-8 rounded-lg border border-hairline-strong
				bg-night p-5 shadow-2xl outline-none md:p-8`}
		>
			<ModalHeader {title} onClose={close} />
			<div class="-mx-1 min-h-0 overflow-y-auto px-1">{@render children()}</div>
			{#if footer !== undefined}
				<div class="flex flex-wrap justify-end gap-2">{@render footer()}</div>
			{/if}
		</div>
	</div>
{/if}
