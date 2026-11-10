<script lang="ts">
	import DashboardPanel from '$lib/components/workspace/DashboardPanel.svelte';
	import ProseText from '$lib/components/site/ProseText.svelte';
	import { formatUkDateTime } from '$lib/data/britishDate';
	import type { PageShown } from './businessBrainPageShown';

	let { shown, currentHref }: { shown: PageShown; currentHref: string } = $props();

	const { facts } = $derived(shown);
	const isEarlierVersion = $derived(shown.revisedAt !== null);
</script>

<DashboardPanel title={shown.kind}>
	{#if shown.revisedAt !== null}
		<p role="status" class="border-b border-hairline px-6 py-3 text-sm text-chalk-muted">
			An earlier version, as it read until {formatUkDateTime(shown.revisedAt)}.
			<a href={currentHref} class="text-go underline underline-offset-2">Read it as it now reads</a>
		</p>
	{/if}
	<div class="flex flex-col gap-6 p-6">
		<ProseText text={shown.body} class="text-sm text-chalk-muted" />
		{#if !isEarlierVersion && facts.length > 0}
			<dl class="grid grid-cols-1 gap-x-6 gap-y-2 border-t border-hairline pt-4 text-sm sm:grid-cols-[minmax(0,12rem)_minmax(0,1fr)]">
				{#each facts as fact (fact.name)}
					<dt class="font-display text-chalk-subtle">{fact.name}</dt>
					<dd class="break-words text-chalk">{fact.value}</dd>
				{/each}
			</dl>
		{/if}
	</div>
</DashboardPanel>
