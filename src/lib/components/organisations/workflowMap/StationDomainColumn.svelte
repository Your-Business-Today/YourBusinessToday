<script lang="ts">
	import { organisationThingHref } from '$lib/components/organisations/domain/domainTabs';
	import type { StationDomain } from '$lib/data/domainReading';
	import type { StationThing } from './stationDetails';

	let { things, stationDomain, organisationId }: { things: StationThing[]; stationDomain: StationDomain; organisationId: string | null } = $props();

	const { thingTitles, rules } = $derived(stationDomain);
	const slugs = $derived(things.map((thing) => thing.slug));
	const touchedRules = $derived(rules.filter((rule) => rule.governs.some((slug) => slugs.includes(slug))));
	const linkClasses = 'text-chalk transition hover:text-go';
	const rulesHeading = 'Rules';
</script>

<ul class="flex flex-wrap gap-x-3 gap-y-1 text-sm">
	{#each things as thing (thing.slug)}
		<li>
			{#if organisationId === null}
				<span class="text-chalk">{thingTitles[thing.slug] ?? thing.name}</span>
			{:else}
				<a href={organisationThingHref(organisationId, thing.slug)} class={linkClasses}>{thingTitles[thing.slug] ?? thing.name}</a>
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
