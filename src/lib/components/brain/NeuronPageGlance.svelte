<script lang="ts">
	import ProseText from '$lib/components/site/ProseText.svelte';
	import { filedSentence } from './glanceSentences';
	import { glanceStates, PageGlanceReading } from './pageGlanceReading.svelte';

	let { glanceHref }: { glanceHref: string } = $props();

	const reading = new PageGlanceReading();
	const glance = $derived(reading.glance);
	const body = $derived(glance?.body ?? '');
	const facts = $derived(glance?.facts ?? []);

	$effect(() => reading.read(glanceHref));
</script>

<section class="flex flex-col gap-4 border-b border-hairline p-5" aria-live="polite">
	{#if reading.state === glanceStates.reading}
		<p class="text-sm text-chalk/50">Reading the page…</p>
	{:else if glance === null}
		<p class="text-sm text-chalk/50">The page could not be read just now. Open the full page below.</p>
	{:else}
		<p class="text-xs text-chalk-subtle">{filedSentence(glance)}</p>
		{#if body.length > 0}
			<ProseText text={body} class="text-sm leading-relaxed text-chalk-muted" />
		{/if}
		{#if facts.length > 0}
			<dl class="grid grid-cols-[minmax(0,9rem)_minmax(0,1fr)] gap-x-4 gap-y-2 border-t border-hairline pt-4 text-sm">
				{#each facts as fact (fact.name)}
					<dt class="font-display text-chalk-subtle">{fact.name}</dt>
					<dd class="break-words text-chalk">{fact.value}</dd>
				{/each}
			</dl>
		{/if}
	{/if}
</section>
