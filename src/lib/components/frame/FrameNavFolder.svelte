<script lang="ts">
	import { slide } from 'svelte/transition';
	import ChevronIcon from '$lib/components/site/ChevronIcon.svelte';
	import LineIcon from '$lib/components/site/LineIcon.svelte';
	import FrameNavLink from './FrameNavLink.svelte';
	import { foldOpen } from '$lib/client/motion';
	import type { FrameFolder, FrameSection } from './frameGroups';

	let {
		section,
		folder,
		currentHref
	}: { section: FrameSection; folder: FrameFolder; currentHref: string | null } = $props();

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
		<span class="flex min-w-0 items-center gap-3">
			<LineIcon kind={folder.icon} class="h-4 w-4 shrink-0" />
			<span class="truncate">{folder.label}</span>
		</span>
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
