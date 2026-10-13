<script lang="ts">
	import { siteMapScreenHref } from './blueprintViews';
	import type { PairedScreen } from '$lib/data/blueprint/pairedScreens';

	let { screen, projectId }: { screen: PairedScreen; projectId: string } = $props();

	const { route, siteMapRoute } = $derived(screen);
	const chipClasses = 'rounded-full border border-hairline px-2.5 py-0.5 font-mono text-xs text-chalk/70';
</script>

{#if siteMapRoute === null}
	<span class={chipClasses} title="Not in the site definition">{route}</span>
{:else}
	<a href={siteMapScreenHref(projectId, siteMapRoute)} class={`${chipClasses} hover:border-go hover:text-go`}>{siteMapRoute}</a>
{/if}
