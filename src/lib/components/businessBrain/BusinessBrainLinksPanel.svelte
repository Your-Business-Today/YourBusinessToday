<script lang="ts">
	import DashboardPanel from '$lib/components/workspace/DashboardPanel.svelte';
	import { linkDirectionWords } from './businessBrainLinks';
	import { panelEmptyClasses, panelListClasses } from '$lib/components/workspace/workspaceStyles';
	import type { BusinessBrainAddresses } from '$lib/data/businessBrainAddresses';
	import type { BusinessBrainLinkRead } from '$lib/server/businessBrain/readBusinessBrainPageLinks';
	import type { BusinessBrainParentPage } from '$lib/server/businessBrain/readBusinessBrainParentPage';

	let {
		parent,
		links,
		addresses
	}: { parent: BusinessBrainParentPage | null; links: BusinessBrainLinkRead[]; addresses: BusinessBrainAddresses } = $props();

	const relatedCount = $derived(links.length + (parent === null ? 0 : 1));
	const lineClasses = 'flex min-w-0 flex-col gap-0.5 px-6 py-3 text-sm';
	const titleClasses = 'truncate font-display text-chalk transition hover:text-go';
</script>

<DashboardPanel title="Related pages" count={relatedCount}>
	{#if relatedCount === 0}
		<p class={panelEmptyClasses}>No other page is linked to this one.</p>
	{:else}
		<ul class={panelListClasses}>
			{#if parent !== null}
				<li class={lineClasses}>
					<span class="text-xs text-chalk-subtle">Filed under</span>
					<a href={addresses.page(parent.pageId)} class={titleClasses}>{parent.title}</a>
				</li>
			{/if}
			{#each links as link (`${link.pageId}-${link.linkKind}-${link.isFromThisPage}`)}
				<li class={lineClasses}>
					<span class="text-xs text-chalk-subtle">{linkDirectionWords(link)}</span>
					<a href={addresses.page(link.pageId)} class={titleClasses}>{link.title}</a>
				</li>
			{/each}
		</ul>
	{/if}
</DashboardPanel>
