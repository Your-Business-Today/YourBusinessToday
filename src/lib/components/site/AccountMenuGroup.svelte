<script lang="ts">
	import type { NavigationGroup } from './siteNavigation';

	let {
		menuGroup,
		isFirst,
		onNavigate
	}: { menuGroup: NavigationGroup; isFirst: boolean; onNavigate: () => void } = $props();
</script>

{#if !isFirst}
	<div class="my-2 border-t border-hairline"></div>
{/if}
{#each menuGroup.links as menuLink (menuLink.href)}
	<a
		href={menuLink.href}
		onclick={onNavigate}
		class="block rounded-lg px-3 py-2 font-display text-sm text-chalk/80 transition
			hover:bg-night/60 hover:text-chalk"
	>
		{menuLink.label}
	</a>
{/each}
