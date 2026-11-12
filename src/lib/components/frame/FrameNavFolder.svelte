<script lang="ts">
	import { slide } from 'svelte/transition';
	import ChevronIcon from '$lib/components/site/ChevronIcon.svelte';
	import FrameNavLink from './FrameNavLink.svelte';
	import { foldOpen } from '$lib/client/motion';
	import type { FrameSection } from './frameGroups';

	let { section, currentHref }: { section: FrameSection; currentHref: string | null } = $props();

	let isOpen = $state(true);

	const folderId = $derived(`frame-folder-${section.key}`);
</script>

<div class="flex flex-col gap-1">
	<button
		type="button"
		aria-expanded={isOpen}
		aria-controls={folderId}
		onclick={() => (isOpen = !isOpen)}
		class="flex items-center gap-2 rounded px-3 pt-3 pb-1 font-display text-xs font-medium tracking-wide
			text-chalk-faint uppercase transition hover:text-chalk"
	>
		<ChevronIcon {isOpen} />
		{section.label}
	</button>
	{#if isOpen}
		<div id={folderId} class="flex flex-col gap-1" transition:slide={foldOpen}>
			{#each section.links as link (link.href)}
				<FrameNavLink {link} isCurrent={link.href === currentHref} />
			{/each}
		</div>
	{/if}
</div>
