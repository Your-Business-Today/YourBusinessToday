<script lang="ts">
	import { fade, fly } from 'svelte/transition';
	import { backdropFade, drawerSlide } from '$lib/client/motion';
	import { keyboardKeys } from '$lib/client/keyboardKeys';
	import type { Snippet } from 'svelte';

	let { onClose, children }: { onClose: () => void; children: Snippet } = $props();

	let closeButton: HTMLButtonElement;

	$effect(() => closeButton.focus());

	function closeOnEscape(event: KeyboardEvent): void {
		if (event.key !== keyboardKeys.escape) return;
		event.preventDefault();
		onClose();
	}
</script>

<svelte:window onkeydown={closeOnEscape} />

<button
	type="button"
	aria-label="Close menu"
	tabindex="-1"
	class="fixed inset-0 z-40 bg-night/70 md:hidden"
	transition:fade={backdropFade}
	onclick={onClose}
></button>

<div
	role="dialog"
	aria-modal="true"
	aria-label="Menu"
	data-sveltekit-replacestate
	class="fixed inset-y-0 left-0 z-40 w-72 max-w-[85vw] border-r border-hairline bg-carriage
		pb-[env(safe-area-inset-bottom)] md:hidden"
	transition:fly={drawerSlide}
>
	<button
		bind:this={closeButton}
		type="button"
		aria-label="Close menu"
		class="absolute top-5 right-3 rounded p-1 text-chalk-muted transition hover:text-chalk"
		onclick={onClose}
	>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="1.5"
			stroke-linecap="round"
			stroke-linejoin="round"
			class="h-6 w-6"
			aria-hidden="true"
		>
			<path d="M18 6 6 18" />
			<path d="m6 6 12 12" />
		</svg>
	</button>
	{@render children()}
</div>
