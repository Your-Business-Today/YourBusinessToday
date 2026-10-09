<script lang="ts">
	import ModalHeader from './ModalHeader.svelte';
	import type { Snippet } from 'svelte';
	import { keyboardKeys } from '$lib/client/keyboardKeys';

	let {
		title,
		isOpen = $bindable(),
		maxWidthClass = 'max-w-lg',
		children
	}: { title: string; isOpen: boolean; maxWidthClass?: string; children: Snippet } = $props();

	function close() {
		isOpen = false;
	}

	function closeOnEscape(event: KeyboardEvent) {
		if (event.key === keyboardKeys.escape) close();
	}
</script>

<svelte:window onkeydown={closeOnEscape} />

{#if isOpen}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-night/80 p-6"
	>
		<div
			role="dialog"
			aria-modal="true"
			aria-label={title}
			class={`my-auto w-full ${maxWidthClass} rounded-2xl border border-hairline bg-carriage p-6 shadow-2xl`}
		>
			<ModalHeader {title} onClose={close} />
			{@render children()}
		</div>
	</div>
{/if}
