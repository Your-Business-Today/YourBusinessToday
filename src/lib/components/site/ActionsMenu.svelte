<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		subjectName,
		menuWidthClass,
		isCompact = false,
		isOpen = $bindable(false),
		children
	}: {
		subjectName: string;
		menuWidthClass: string;
		isCompact?: boolean;
		isOpen?: boolean;
		children: Snippet;
	} = $props();

	let menuElement: HTMLElement | undefined = $state();

	const wideTriggerClasses =
		'inline-flex items-center gap-1 rounded-full border border-hairline px-4 py-1.5 font-display text-sm whitespace-nowrap text-chalk/70 transition hover:border-go hover:text-go';
	const compactTriggerClasses =
		'inline-flex h-8 w-8 items-center justify-center rounded-full text-lg leading-none text-chalk/50 transition hover:bg-night hover:text-go';
	const triggerClasses = $derived(isCompact ? compactTriggerClasses : wideTriggerClasses);

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
		class={triggerClasses}
	>
		{#if isCompact}
			<span aria-hidden="true">⋯</span>
		{:else}
			Actions <span aria-hidden="true" class="text-xs">▾</span>
		{/if}
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
