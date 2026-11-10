<script lang="ts">
	import BrandWordmark from '$lib/components/site/BrandWordmark.svelte';
	import FrameNavLink from './FrameNavLink.svelte';
	import FrameSignedIn from './FrameSignedIn.svelte';
	import type { FrameView } from './frameView';
	import type { Snippet } from 'svelte';

	let {
		view,
		personName,
		pickers
	}: { view: FrameView; personName: string; pickers?: Snippet } = $props();
</script>

<div class="flex h-full flex-col gap-6 px-4 py-6">
	<a href={view.homePath} class="flex items-center gap-3 pr-10 md:pr-0">
		<BrandWordmark fontSize={22} />
		<span class="truncate text-sm font-medium text-chalk-subtle">Your Business Today</span>
	</a>
	{#if pickers !== undefined}
		<div class="flex flex-col gap-2">{@render pickers()}</div>
	{/if}
	<nav aria-label="Portal" class="-mx-1 flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto px-1">
		{#each view.links as link (link.href)}
			<FrameNavLink {link} isCurrent={link.href === view.currentHref} />
		{/each}
	</nav>
	<FrameSignedIn {personName} signOutPath={view.signOutPath} />
</div>
