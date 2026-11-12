<script lang="ts">
	import { slide } from 'svelte/transition';
	import ChevronIcon from '$lib/components/site/ChevronIcon.svelte';
	import FrameNavLink from './FrameNavLink.svelte';
	import { foldOpen } from '$lib/client/motion';
	import type { FrameSection } from './frameGroups';

	let { section, currentHref }: { section: FrameSection; currentHref: string | null } = $props();

	let isOpen = $state(true);

	const folderId = $derived(`frame-folder-${section.key}`);
	const holdsCurrentPage = $derived(section.links.some((link) => link.href === currentHref));
	const toneClasses = $derived(holdsCurrentPage ? 'text-chalk' : 'text-chalk-subtle');
</script>

<div class="flex flex-col gap-1">
	<button
		type="button"
		aria-expanded={isOpen}
		aria-controls={folderId}
		onclick={() => (isOpen = !isOpen)}
		class={`flex items-center justify-between gap-3 rounded px-3 py-3.5 text-left text-sm font-medium transition
			hover:bg-carriage-raised hover:text-chalk md:py-2 ${toneClasses}`}
	>
		{section.label}
		<ChevronIcon {isOpen} />
	</button>
	{#if isOpen}
		<div id={folderId} class="ml-3 flex flex-col gap-1 border-l border-hairline pl-2" transition:slide={foldOpen}>
			{#each section.links as link (link.href)}
				<FrameNavLink {link} isCurrent={link.href === currentHref} />
			{/each}
		</div>
	{/if}
</div>
