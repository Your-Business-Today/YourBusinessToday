<script lang="ts">
	import { domainThingHref } from './domainTabs';
	import type { DomainWord } from '$lib/data/domainReading';

	let { word, thingTitles }: { word: DomainWord; thingTitles: Map<string, string> } = $props();

	const { namesThingSlug, namesStatus, isRole } = $derived(word);
</script>

{#if namesThingSlug !== null}
	<a href={domainThingHref(namesThingSlug)} class="text-chalk transition hover:text-go">{thingTitles.get(namesThingSlug) ?? namesThingSlug}</a>
	{#if namesStatus !== null}
		<span class="text-chalk-subtle">in {namesStatus}</span>
	{/if}
{/if}
{#if isRole}
	<span class="text-chalk-subtle">A role</span>
{/if}
