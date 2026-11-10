<script lang="ts">
	import EntityLink from '$lib/components/blueprint/EntityLink.svelte';
	import { linkKindPhrases } from '$lib/data/companyContext/companyContextWords';
	import { linksTouching } from '$lib/data/companyContext/contextLinks';
	import type { CompanyContextVersion } from '$lib/data/companyContext/companyContext';

	let {
		partKey,
		context,
		onSelect
	}: { partKey: string; context: CompanyContextVersion; onSelect: (partKey: string) => void } = $props();

	const partNames = $derived(new Map(context.parts.map((part) => [part.key, part.name])));
	const links = $derived(linksTouching(context, partKey));

	function nameOf(key: string): string {
		return partNames.get(key) ?? key;
	}
</script>

<section class="flex flex-col gap-1.5">
	<h3 class="font-display text-xs tracking-widest text-chalk/50 uppercase">Links</h3>
	{#if links.length === 0}
		<p class="text-chalk/50">Nothing is linked to it yet.</p>
	{:else}
		<ul class="flex flex-col gap-1 text-chalk/70">
			{#each links as link (`${link.fromKey} ${link.kind} ${link.toKey}`)}
				<li>
					<EntityLink entityName={link.fromKey} label={nameOf(link.fromKey)} {onSelect} />
					{linkKindPhrases[link.kind]}
					<EntityLink entityName={link.toKey} label={nameOf(link.toKey)} {onSelect} />
				</li>
			{/each}
		</ul>
	{/if}
</section>
