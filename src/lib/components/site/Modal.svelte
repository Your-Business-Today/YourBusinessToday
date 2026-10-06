<script lang="ts">
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
			<div class="mb-5 flex items-center justify-between gap-4">
				<h2 class="font-display text-xl font-medium">{title}</h2>
				<button
					type="button"
					onclick={close}
					aria-label="Close"
					class="rounded-full border border-hairline px-3 py-1 text-sm text-chalk/60 transition
						hover:border-signal hover:text-signal"
				>
					✕
				</button>
			</div>
			{@render children()}
		</div>
	</div>
{/if}
