<script lang="ts">
	import Badge from '$lib/components/site/Badge.svelte';
	import { domainBlockNames } from '$lib/data/businessBrainDomain';
	import type { BusinessBrainAddresses } from '$lib/data/businessBrainAddresses';
	import type { DomainContextSummary } from '$lib/data/organisationDomain';

	let { context, addresses }: { context: DomainContextSummary; addresses: BusinessBrainAddresses } = $props();

	const blocks = $derived(context.blocks);
	const linkClasses = 'text-chalk transition hover:text-go';
</script>

<li class="flex flex-col gap-2 px-6 py-4 text-sm">
	<div class="flex flex-wrap items-center gap-2">
		<a href={addresses.page(context.pageId)} class={`font-display font-semibold ${linkClasses}`}>{context.title}</a>
		{#if context.isCoreDomain}
			<Badge label="Core domain" tone="positive" />
		{/if}
	</div>
	{#if context.summary !== ''}
		<p class="text-chalk/60">{context.summary}</p>
	{/if}
	{#if blocks.length > 0}
		<ul class="flex flex-col gap-1">
			{#each blocks as block (block.pageId)}
				<li>
					<span class="text-chalk/50">{domainBlockNames[block.kind]}:</span>
					<a href={addresses.page(block.pageId)} class={linkClasses}>{block.title}</a>
				</li>
			{/each}
		</ul>
	{/if}
</li>
