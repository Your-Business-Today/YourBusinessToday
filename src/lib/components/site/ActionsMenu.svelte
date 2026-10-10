<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		subjectName,
		menuWidthClass,
		isOpen = $bindable(false),
		children
	}: { subjectName: string; menuWidthClass: string; isOpen?: boolean; children: Snippet } = $props();

	let menuElement: HTMLElement | undefined = $state();

	function closeOnOutsideClick(event: MouseEvent) {
		if (!isOpen) return;
		if (menuElement?.contains(event.target as Node)) return;
		isOpen = false;
	}
</script>

<svelte:window onclick={closeOnOutsideClick} />

<div class="relative" bind:this={menuElement}>
	<button
		type="button"
		onclick={() => (isOpen = !isOpen)}
		aria-haspopup="menu"
		aria-expanded={isOpen}
		aria-label={`Actions for ${subjectName}`}
		class="inline-flex items-center gap-1 rounded-full border border-hairline px-4 py-1.5
			font-display text-sm whitespace-nowrap text-chalk/70 transition hover:border-go
			hover:text-go"
	>
		Actions <span aria-hidden="true" class="text-xs">▾</span>
	</button>
	{#if isOpen}
		<div
			role="menu"
			class={`absolute top-full right-0 z-10 mt-2 flex ${menuWidthClass} flex-col rounded-2xl border
				border-hairline bg-night p-2 shadow-xl`}
		>
			{@render children()}
		</div>
	{/if}
</div>
