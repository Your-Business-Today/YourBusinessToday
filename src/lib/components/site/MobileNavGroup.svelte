<script lang="ts">
	import NavGroupHeading from './NavGroupHeading.svelte';
	import type { NavigationGroup } from './siteNavigation';

	let {
		group,
		onNavigate
	}: { group: NavigationGroup; onNavigate: () => void } = $props();
</script>

<div class="flex flex-col gap-1">
	<NavGroupHeading label={group.label} class="pt-3" />
	{#each group.links as groupLink (groupLink.href)}
		<a
			href={groupLink.href}
			class="rounded-lg px-3 py-2 font-display text-sm text-chalk/80 transition
				hover:bg-night/60 hover:text-chalk"
			onclick={onNavigate}
		>
			{groupLink.label}
		</a>
	{/each}
</div>
