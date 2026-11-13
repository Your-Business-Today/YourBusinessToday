<script lang="ts">
	import { organisationThingHref } from '$lib/components/organisations/domain/domainTabs';
	import { stationThingKey, type StationThing } from './stationDetails';
	import type { StationDomain } from '$lib/data/domainReading';

	let { things, stationDomain, organisationId }: { things: StationThing[]; stationDomain: StationDomain; organisationId: string | null } = $props();

	const { vocabulary, rules } = $derived(stationDomain);
	const thingTitles = $derived(new Map(vocabulary.things.map((thing) => [thing.slug, thing.title])));
	const slugs = $derived(things.map((thing) => thing.slug));
	const touchedRules = $derived(rules.filter((rule) => rule.governs.some((slug) => slugs.includes(slug))));
	const linkClasses = 'text-chalk transition hover:text-go';
	const statusClasses = 'text-chalk-faint';
	const rulesHeading = 'Rules';
</script>

<ul class="flex flex-wrap gap-x-3 gap-y-1 text-sm">
	{#each things as thing (stationThingKey(thing))}
		<li>
			{#if organisationId === null}
				<span class="text-chalk">{thingTitles.get(thing.slug) ?? thing.name}</span>
			{:else}
				<a href={organisationThingHref(organisationId, thing.slug)} class={linkClasses}>{thingTitles.get(thing.slug) ?? thing.name}</a>
			{/if}
			{#if thing.status !== null}
				<span class={statusClasses}>({thing.status})</span>
			{/if}
		</li>
	{/each}
</ul>
{#if touchedRules.length > 0}
	<h4 class="font-display text-xs font-medium text-chalk-subtle">{rulesHeading}</h4>
	<ul class="flex flex-col gap-2 text-sm text-chalk-muted">
		{#each touchedRules as rule (rule.pageId)}
			<li>{rule.title}</li>
		{/each}
	</ul>
{/if}
