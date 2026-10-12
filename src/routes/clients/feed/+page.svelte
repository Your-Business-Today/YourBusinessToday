<script lang="ts">
	import AreaEventRow from '$lib/components/clients/feed/AreaEventRow.svelte';
	import AreaFeedHeader from '$lib/components/clients/feed/AreaFeedHeader.svelte';
	import AreaFeedScoreboard from '$lib/components/clients/feed/AreaFeedScoreboard.svelte';
	import EmptyState from '$lib/components/site/EmptyState.svelte';
	import FeedDaySection from '$lib/components/feed/FeedDaySection.svelte';
	import { LiveRefresh } from '$lib/client/liveRefresh.svelte';
	import { areaFeedDependency } from '$lib/data/areaFeedRefresh';
	import { groupFeedByDay } from '$lib/data/feedDays';
	import { scoreAreaFeedToday } from '$lib/data/areaFeedScore';

	let { data } = $props();

	const liveRefresh = new LiveRefresh(areaFeedDependency);

	const days = $derived(groupFeedByDay(data.events));
	const score = $derived(scoreAreaFeedToday(data.events));
</script>

<svelte:head>
	<title>Patch feed — Your Business Today</title>
</svelte:head>

<div class="mx-auto flex max-w-5xl flex-col gap-8 px-6 py-16">
	<AreaFeedHeader view={data.view} patches={data.patches} readAt={data.readAt} isRefreshing={liveRefresh.isRefreshing} />
	<AreaFeedScoreboard {score} />
	{#if days.length === 0}
		<EmptyState message="Nothing has happened on this ground yet. Claim a sector, search it, and the first events show here." />
	{:else}
		{#each days as day (day.dayKey)}
			<FeedDaySection {day}>
				{#snippet row(event)}
					<AreaEventRow {event} />
				{/snippet}
			</FeedDaySection>
		{/each}
	{/if}
</div>
